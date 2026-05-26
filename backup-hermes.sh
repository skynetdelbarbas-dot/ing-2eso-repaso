#!/bin/bash
# ============================================================
# Hermes Backup System v1.0
# Backup completo: memoria, skills, sesiones, config, proyectos
# Cifrado AES-256 + subida a Google Drive via rclone
# Rotación: 7 días (se borra el más antiguo automáticamente)
# ============================================================
set -euo pipefail

# ─── Config ───
BACKUP_DIR="$HOME/.hermes/backups"
BACKUP_PREFIX="hermes-backup"
DATE_TAG=$(date '+%Y-%m-%d')
ARCHIVE_NAME="${BACKUP_PREFIX}-${DATE_TAG}.tar.gz"
MAX_BACKUPS=7
RCLONE_REMOTE="gdrive"
RCLONE_PATH="${RCLONE_REMOTE}:Backup-Hermes"
KEY_FILE="$HOME/.hermes/.backup_key"
RCLONE="$HOME/bin/rclone"

# ─── Logging (all to stderr to avoid contaminating return values) ───
log()  { echo -e "\033[0;36m[$(date '+%H:%M:%S')]\033[0m $1" >&2; }
ok()   { echo -e "  \033[0;32m✓\033[0m $1" >&2; }
warn() { echo -e "  \033[1;33m⚠\033[0m $1" >&2; }
fail() { echo -e "  \033[0;31m✗\033[0m $1" >&2; }

# ─── Pre-flight checks ───
preflight() {
    log "🔍 Verificando requisitos..."
    mkdir -p "$BACKUP_DIR"
    
    if [ ! -f "$KEY_FILE" ]; then
        warn "No existe ${KEY_FILE}. Creando clave de cifrado..."
        openssl rand -base64 32 > "$KEY_FILE"
        chmod 600 "$KEY_FILE"
        ok "Clave creada en ${KEY_FILE}"
    fi
    if [ ! -s "$KEY_FILE" ]; then
        fail "Archivo de clave vacío: ${KEY_FILE}"; exit 1
    fi
    ok "Clave de cifrado lista"
    
    for cmd in tar openssl gzip; do
        if ! command -v "$cmd" &>/dev/null; then
            fail "Falta herramienta: ${cmd}"; exit 1
        fi
    done
    ok "Herramientas base disponibles"
}

# ─── Backup ───
do_backup() {
    local WORKDIR=$(mktemp -d)
    local STAGING="${WORKDIR}/hermes-backup"
    mkdir -p "$STAGING"
    
    log "📦 Ensamblando backup..."
    
    # Helper: copy a directory with excludes
    copy_dir() {
        local src="$1" dst="$2"
        shift 2
        if [ -d "$src" ]; then
            local rel="${src#$HOME/}"
            mkdir -p "$(dirname "${STAGING}/${rel}")"
            tar cf - -C "$HOME" "$rel" "$@" 2>/dev/null | tar xf - -C "$STAGING" 2>/dev/null || true
        fi
    }
    
    copy_file() {
        local src="$1"
        if [ -f "$src" ]; then
            local rel="${src#$HOME/}"
            mkdir -p "$(dirname "${STAGING}/${rel}")"
            cp "$src" "${STAGING}/${rel}"
        fi
    }
    
    # ─── Hermes core config ───
    for f in config.yaml .env SOUL.md auth.json gateway_state.json channel_directory.json; do
        copy_file "$HOME/.hermes/$f"
    done
    ok "Configuración core"
    
    # ─── Memories ───
    copy_dir "$HOME/.hermes/memories" "$STAGING"
    ok "Memorias (identidad + perfil)"
    
    # ─── Skills ───
    copy_dir "$HOME/.hermes/skills" "$STAGING" --exclude='__pycache__' --exclude='*.pyc'
    ok "Skills"
    
    # ─── Sessions ───
    copy_dir "$HOME/.hermes/sessions" "$STAGING"
    ok "Sesiones (historial conversaciones)"
    
    # ─── Scripts ───
    copy_dir "$HOME/.hermes/scripts" "$STAGING"
    ok "Scripts"
    
    # ─── Cron ───
    copy_dir "$HOME/.hermes/cron" "$STAGING"
    ok "Cron jobs"
    
    # ─── Projects (excluyendo pesados) ───
    for proj in ve-dashboard home-dashboard news-dashboard empleo-publico-murcia; do
        if [ -d "$HOME/hermes/$proj" ]; then
            copy_dir "$HOME/hermes/$proj" "$STAGING" \
                --exclude='venv' --exclude='.venv' \
                --exclude='__pycache__' --exclude='*.pyc' \
                --exclude='.git' --exclude='.DS_Store'
            ok "Proyecto: $proj"
        fi
    done
    # ing-2eso-repaso (tiene node_modules pesado)
    if [ -d "$HOME/hermes/ing-2eso-repaso" ]; then
        copy_dir "$HOME/hermes/ing-2eso-repaso" "$STAGING" \
            --exclude='node_modules' --exclude='.git' \
            --exclude='__pycache__' --exclude='.DS_Store'
        ok "Proyecto: ing-2eso-repaso"
    fi
    
    # ─── LaunchAgents ───
    for plist in "$HOME/Library/LaunchAgents/com.cloudflare.cloudflared.plist" \
                 "$HOME/Library/LaunchAgents/homebrew.mxcl.cloudflared.plist"; do
        copy_file "$plist"
    done
    ok "LaunchAgents (túneles)"
    
    # ─── Rclone config ───
    copy_file "$HOME/.config/rclone/rclone.conf"
    ok "Config rclone"
    
    # ─── Crontab dump ───
    crontab -l 2>/dev/null > "${STAGING}/crontab.txt" || true
    
    # ─── System info ───
    cat > "${STAGING}/SYSTEM_INFO.txt" <<EOF
=== HERMES BACKUP ===
Date: $(date '+%Y-%m-%d %H:%M:%S')
Host: $(hostname)
User: $(whoami)

=== Versiones ===
Python: $(python3 --version 2>/dev/null || echo 'N/A')
Node:   $(node --version 2>/dev/null || echo 'N/A')
EOF
    for d in ~/hermes/*/; do
        if [ -d "${d}/.git" ]; then
            local name=$(basename "$d")
            local commit=$(cd "$d" && git rev-parse --short HEAD 2>/dev/null)
            local msg=$(cd "$d" && git log -1 --format='%s' 2>/dev/null)
            echo "Git $name: $commit - $msg" >> "${STAGING}/SYSTEM_INFO.txt"
        fi
    done
    ok "Información del sistema"
    
    # ─── Comprimir ───
    log "🗜️ Comprimiendo..."
    local ARCHIVE_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"
    tar czf "$ARCHIVE_PATH" -C "$WORKDIR" "hermes-backup"
    rm -rf "$WORKDIR"
    
    local SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)
    ok "Archivo creado: ${ARCHIVE_PATH} (${SIZE})"
    
    echo "$ARCHIVE_PATH"  # stdout = return value
}

# ─── Encrypt ───
do_encrypt() {
    local ARCHIVE_PATH="$1"
    local ENCRYPTED_PATH="${ARCHIVE_PATH}.enc"
    
    log "🔐 Cifrando (AES-256-CBC)..."
    openssl enc -aes-256-cbc -pbkdf2 -salt \
        -in "$ARCHIVE_PATH" \
        -out "$ENCRYPTED_PATH" \
        -pass file:"$KEY_FILE"
    rm -f "$ARCHIVE_PATH"
    
    local SIZE=$(du -h "$ENCRYPTED_PATH" | cut -f1)
    ok "Cifrado: $(basename ${ENCRYPTED_PATH}) (${SIZE})"
    
    echo "$ENCRYPTED_PATH"
}

# ─── Upload to GDrive ───
do_upload() {
    local ENCRYPTED_PATH="$1"
    
    if [ ! -x "$RCLONE" ]; then
        warn "rclone no disponible. Backup solo local."
        return 1
    fi
    if ! timeout 5 "$RCLONE" listremotes 2>/dev/null | grep -q "^${RCLONE_REMOTE}:"; then
        warn "Remote '${RCLONE_REMOTE}:' no configurado. Backup solo local."
        return 1
    fi
    
    log "☁️ Subiendo a GDrive..."
    if "$RCLONE" copy "$ENCRYPTED_PATH" "${RCLONE_PATH}/" 2>&1; then
        ok "Subido correctamente"
        return 0
    else
        warn "Error al subir a GDrive. Backup guardado localmente."
        return 1
    fi
}

# ─── Rotate ───
do_rotate() {
    log "🔄 Rotando backups (máx. ${MAX_BACKUPS})..."
    local backups=($(ls -1t "${BACKUP_DIR}/${BACKUP_PREFIX}"-*.enc 2>/dev/null || true))
    local count=${#backups[@]}
    
    if [ "$count" -le "$MAX_BACKUPS" ]; then
        ok "${count} backups en disco — ok"
        return
    fi
    
    local to_delete=$((count - MAX_BACKUPS))
    for ((i=MAX_BACKUPS; i<count; i++)); do
        rm -f "${backups[$i]}"
        ok "🗑️ Eliminado: $(basename ${backups[$i]})"
    done
    ok "${to_delete} backup(s) antiguo(s) eliminados"
}

# ─── Main ───
main() {
    echo -e "\n\033[0;36m════════════════════════════════════════\033[0m" >&2
    echo -e "\033[0;36m  🔐  HERMES BACKUP v1.0\033[0m" >&2
    echo -e "\033[0;36m  $(date '+%d/%m/%Y %H:%M')\033[0m" >&2
    echo -e "\033[0;36m════════════════════════════════════════\033[0m" >&2
    
    preflight
    
    local ARCHIVE=$(do_backup)
    local ENCRYPTED=$(do_encrypt "$ARCHIVE")
    local UPLOAD_OK=false
    
    if do_upload "$ENCRYPTED"; then
        UPLOAD_OK=true
    fi
    
    do_rotate
    
    local SIZE=$(du -h "$ENCRYPTED" | cut -f1)
    
    echo -e "\n\033[0;32m════════════════════════════════════════\033[0m" >&2
    echo -e "\033[0;32m  ✅ BACKUP COMPLETADO\033[0m" >&2
    echo -e "\033[0;32m  Archivo: $(basename ${ENCRYPTED})\033[0m" >&2
    echo -e "\033[0;32m  Tamaño: ${SIZE}\033[0m" >&2
    if [ "$UPLOAD_OK" = true ]; then
        echo -e "\033[0;32m  GDrive: ✅ Subido\033[0m" >&2
    else
        echo -e "\033[1;33m  GDrive: ⏸ Solo local\033[0m" >&2
    fi
    echo -e "\033[0;32m  Directorio: ${BACKUP_DIR}\033[0m" >&2
    echo -e "\033[0;32m════════════════════════════════════════\033[0m" >&2
    
    # Restore info
    echo -e "\n\033[1;33m📋 Para restaurar:\033[0m" >&2
    echo "  openssl enc -d -aes-256-cbc -pbkdf2 -in ${ENCRYPTED} -pass file:${KEY_FILE} | tar xz" >&2
}

main "$@"
