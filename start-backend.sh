#!/bin/bash
# start-backend.sh — Lanza el backend FastAPI de la plataforma de inglés
# Puerto: 18402
# Usar con LaunchAgent: RunAtLoad + KeepAlive

cd "$(dirname "$0")"

BACKEND_DIR="$(pwd)/backend"
PORT=${PORT:-18402}

# Usar el mismo venv que Hermes o uno propio
if [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
    source "$BACKEND_DIR/venv/bin/activate"
elif [ -f "$(dirname "$0")/venv/bin/activate" ]; then
    source "$(dirname "$0")/venv/bin/activate"
fi

cd "$BACKEND_DIR"

# Instalar dependencias si no están
pip install -q -r requirements.txt 2>/dev/null

exec python main.py
