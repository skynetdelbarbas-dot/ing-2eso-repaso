#!/usr/bin/env python3
"""
English Tutor Server — FastAPI
Multi-level English tutor (A1-C1) with SQLite persistence,
student identification, and usage tracking.
"""

import json
import os
import sys
import sqlite3
import time
import urllib.error
import urllib.request
import mimetypes
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import uvicorn

# ─── Paths ───
BASE_DIR = Path(__file__).parent
PORT = 18401
DB_PATH = BASE_DIR / "tutor.db"

# ─── OpenRouter setup ───
OPENROUTER_MODEL = os.environ.get("TUTOR_MODEL", "deepseek/deepseek-chat")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def get_api_key() -> str:
    """Read API key from env var first, then from env files."""
    key = os.environ.get("TUTOR_API_KEY") or os.environ.get("OPENROUTER_API_KEY") or ""
    if key:
        return key
    for env_path in [BASE_DIR / ".tutor.env", Path.home() / ".hermes" / ".env"]:
        if env_path.exists():
            try:
                for line in env_path.read_text().splitlines():
                    line = line.strip()
                    if line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    if k in ("TUTOR_API_KEY", "OPENROUTER_API_KEY"):
                        val = v.strip().strip("\"'")
                        if val:
                            return val
            except OSError:
                continue
    return ""


OPENROUTER_API_KEY = get_api_key()

# ─── Admin password ───
# Set TUTOR_ADMIN_PASSWORD in env or .tutor.env for admin dashboard access
ADMIN_PASSWORD = ""


def get_admin_password() -> str:
    pwd = os.environ.get("TUTOR_ADMIN_PASSWORD") or ""
    if pwd:
        return pwd
    for env_path in [BASE_DIR / ".tutor.env", Path.home() / ".hermes" / ".env"]:
        if env_path.exists():
            try:
                for line in env_path.read_text().splitlines():
                    line = line.strip()
                    if line.startswith("TUTOR_ADMIN_PASSWORD="):
                        val = line.split("=", 1)[1].strip().strip("\"'")
                        if val:
                            return val
            except OSError:
                continue
    return ""


ADMIN_PASSWORD = get_admin_password()

# ─── Level-based Tutor Prompts ───

LEVEL_PROMPTS = {
    "A1": """You are an English tutor for a Spanish student at CEFR A1 level (beginner / approximately 1st-2nd year).

RULES:
1. ALWAYS respond in English
2. Use VERY short sentences — 5 to 8 words max
3. Use only present simple tense
4. Vocabulary: basic greetings, colours, numbers, family, animals, school objects, days, weather
5. Repeat key words and phrases often
6. Be VERY encouraging — lots of emojis 🌟😊🎉
7. Correct mistakes gently: repeat the correct form
8. If the student writes in Spanish, respond in English but show you understood
9. Keep responses to 1-2 sentences
10. NEVER do the student's homework — guide them

Examples of good responses:
- "Good! Apple is red. 🍎 What colour is the sky?"
- "Yes! I like cats. Do you like cats?"

Topics: greetings, alphabet, numbers 1-100, colours, family members, animals, food, school objects, weather, days of the week, months.""",

    "A2": """You are an English tutor for a Spanish student at CEFR A2 level (elementary / approximately 2nd-3rd year of Secondary / ESO).

RULES:
1. ALWAYS respond in English
2. Keep sentences short and clear
3. Use: present simple, present continuous, past simple, going to future
4. Vocabulary: hobbies, routines, food & drink, travel, clothes, house, town
5. Be encouraging and patient — use emojis 😊
6. Correct mistakes gently: show the correct form without being harsh
7. If the student writes in Spanish, respond in English but show you understood
8. Keep responses concise (2-4 sentences usually)
9. NEVER do the student's homework — guide them to find the answer

Topics: present simple vs continuous, past simple (regular & irregular), comparatives, going to future, prepositions of place, basic modals (can/must), possessives, question words.""",

    "B1": """You are an English tutor for a Spanish student at CEFR B1 level (intermediate / approximately 4th ESO or 1st Bachillerato).

RULES:
1. ALWAYS respond in English
2. Students can express opinions, experiences, and plans
3. Use: past tenses (simple, continuous, present perfect), 1st & 2nd conditionals, passive voice, relative clauses, modals (should/might/must)
4. Vocabulary: education, work, media, environment, relationships, technology
5. Encourage longer responses — ask "Why?" and "What do you think?"
6. Correct gently — explain the rule briefly when needed
7. If the student writes in Spanish, respond in English but show you understood
8. Keep responses 2-5 sentences
9. NEVER do the student's homework — guide them

Topics: present perfect vs past simple, 1st & 2nd conditionals, passive (present/past), relative pronouns, modal verbs, reported speech (basic), phrasal verbs (common).""",

    "B2": """You are an English tutor for a Spanish student at CEFR B2 level (upper-intermediate / approximately 2nd Bachillerato or advanced).

RULES:
1. ALWAYS respond in English
2. Students can discuss abstract topics and argue points of view
3. Use: all tenses including future perfect, mixed conditionals, reported speech, advanced passive, inversions
4. Vocabulary: society, politics, science, culture, business, arts — with collocations and register awareness
5. Push for nuance and precision — ask for examples, clarification
6. Correct with explanations: explain WHY the mistake happened
7. If the student writes in Spanish, respond in English but show you understood
8. Responses can be 3-6 sentences
9. NEVER do the student's homework — guide them to the answer

Topics: mixed conditionals, wish/if only, reported speech (all tenses), causative have/get, phrasal verbs (extended), linking devices (however, nevertheless, moreover), cleft sentences.""",

    "C1": """You are an English tutor for a Spanish student at CEFR C1 level (advanced / proficient).

RULES:
1. ALWAYS respond in English
2. Students can express themselves fluently and spontaneously
3. Treat them as near-native — minimal simplification
4. Use: idiomatic expressions, register shifts (formal vs informal), subtle meaning distinctions
5. Vocabulary: specialised terms across fields, idioms, collocations, connotations
6. Challenge them — use sophisticated sentence structures and vocabulary in your responses
7. Correct on nuance, register, and naturalness, not basic grammar
8. If the student writes in Spanish, respond in English but show you understood
9. Responses can be 3-8 sentences
10. NEVER do the student's homework — guide them

Topics: idioms and collocations, register and tone, hedging language, inversion, ellipsis and substitution, complex argumentation, academic and professional writing conventions.""",
}

VALID_LEVELS = set(LEVEL_PROMPTS.keys())

# ─── Database ───

def get_db() -> sqlite3.Connection:
    """Get a database connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    """Create tables if they don't exist."""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS students (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            level       TEXT NOT NULL DEFAULT 'A2',
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            last_active TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER NOT NULL,
            started_at  TEXT NOT NULL DEFAULT (datetime('now')),
            ended_at    TEXT,
            message_count INTEGER DEFAULT 0,
            FOREIGN KEY (student_id) REFERENCES students(id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id  INTEGER NOT NULL,
            role        TEXT NOT NULL CHECK(role IN ('user','assistant','system')),
            content     TEXT NOT NULL,
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        );

        CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id, started_at);
    """)
    conn.commit()
    conn.close()


def find_student_by_name(name: str) -> dict | None:
    """Find active student by case-insensitive name."""
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM students WHERE LOWER(name) = LOWER(?)", (name.strip(),)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def create_student(name: str, level: str) -> dict:
    """Create a new student record and return it."""
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO students (name, level) VALUES (?, ?)", (name.strip(), level)
    )
    student_id = cur.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM students WHERE id = ?", (student_id,)).fetchone()
    conn.close()
    return dict(row)


def update_student_level(student_id: int, level: str) -> None:
    """Update student's level and last_active timestamp."""
    conn = get_db()
    conn.execute(
        "UPDATE students SET level = ?, last_active = datetime('now') WHERE id = ?",
        (level, student_id),
    )
    conn.commit()
    conn.close()


def touch_student(student_id: int) -> None:
    """Update last_active timestamp."""
    conn = get_db()
    conn.execute(
        "UPDATE students SET last_active = datetime('now') WHERE id = ?", (student_id,)
    )
    conn.commit()
    conn.close()


def get_active_session(student_id: int, timeout_minutes: int = 30) -> dict | None:
    """
    Get the most recent session for a student.
    Returns None if no session exists or the last one is too old.
    """
    conn = get_db()
    row = conn.execute("""
        SELECT s.* FROM sessions s
        LEFT JOIN (
            SELECT session_id, MAX(created_at) as last_msg
            FROM messages GROUP BY session_id
        ) m ON m.session_id = s.id
        WHERE s.student_id = ?
        ORDER BY COALESCE(m.last_msg, s.started_at) DESC
        LIMIT 1
    """, (student_id,)).fetchone()
    conn.close()

    if not row:
        return None

    session = dict(row)
    # Check if session is still active (last message or started_at within timeout)
    last_activity = session.get("last_msg") or session["started_at"]
    if last_activity:
        try:
            last_dt = datetime.strptime(last_activity, "%Y-%m-%d %H:%M:%S")
            now = datetime.utcnow()
            if (now - last_dt).total_seconds() > timeout_minutes * 60:
                return None  # Session expired
        except ValueError:
            return None
    return session


def create_session(student_id: int) -> dict:
    """Create a new session for a student."""
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO sessions (student_id) VALUES (?)", (student_id,)
    )
    session_id = cur.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    conn.close()
    return dict(row)


def save_message(session_id: int, role: str, content: str) -> int:
    """Save a message and update session message_count. Returns message id."""
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
        (session_id, role, content),
    )
    msg_id = cur.lastrowid
    conn.execute(
        "UPDATE sessions SET message_count = message_count + 1 WHERE id = ?",
        (session_id,),
    )
    conn.commit()
    conn.close()
    return msg_id


def get_session_context(session_id: int, limit: int = 20) -> list[dict]:
    """Get the last N messages from a session for context."""
    conn = get_db()
    rows = conn.execute("""
        SELECT role, content FROM messages
        WHERE session_id = ?
        ORDER BY id DESC LIMIT ?
    """, (session_id, limit)).fetchall()
    conn.close()
    # Return in chronological order
    return [dict(r) for r in reversed(rows)]


def get_student_usage(student_id: int) -> dict:
    """Get usage stats for a student."""
    conn = get_db()
    row = conn.execute("""
        SELECT
            s.id, s.name, s.level, s.created_at, s.last_active,
            COUNT(DISTINCT sess.id) as total_sessions,
            COUNT(m.id) as total_messages,
            SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END) as user_messages,
            SUM(CASE WHEN m.role = 'assistant' THEN 1 ELSE 0 END) as bot_messages
        FROM students s
        LEFT JOIN sessions sess ON sess.student_id = s.id
        LEFT JOIN messages m ON m.session_id = sess.id
        WHERE s.id = ?
        GROUP BY s.id
    """, (student_id,)).fetchone()
    conn.close()
    return dict(row) if row else {}


def get_all_usage() -> list[dict]:
    """Get usage stats for all students."""
    conn = get_db()
    rows = conn.execute("""
        SELECT
            s.id, s.name, s.level, s.created_at, s.last_active,
            COUNT(DISTINCT sess.id) as total_sessions,
            COUNT(m.id) as total_messages,
            SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END) as user_messages,
            SUM(CASE WHEN m.role = 'assistant' THEN 1 ELSE 0 END) as bot_messages
        FROM students s
        LEFT JOIN sessions sess ON sess.student_id = s.id
        LEFT JOIN messages m ON m.session_id = sess.id
        GROUP BY s.id
        ORDER BY s.last_active DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_recent_conversations(limit: int = 5) -> list[dict]:
    """Get most recent messages across all students."""
    conn = get_db()
    rows = conn.execute("""
        SELECT
            m.id, m.role, m.content, m.created_at,
            s.name as student_name, s.level as student_level,
            sess.id as session_id, sess.student_id
        FROM messages m
        JOIN sessions sess ON sess.id = m.session_id
        JOIN students s ON s.id = sess.student_id
        ORDER BY m.id DESC
        LIMIT ?
    """, (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─── FastAPI App ───

app = FastAPI(title="English Tutor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Inject chat widget into HTML pages ───
CHAT_WIDGET_SCRIPT = '<script src="/chat-widget.js?v=3"></script>'


class ChatWidgetMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        content_type = response.headers.get("content-type", "")
        if "text/html" in content_type and response.status_code == 200:
            try:
                body = response.body
                if isinstance(body, bytes):
                    body_str = body.decode("utf-8")
                    if "chat-widget.js" not in body_str:
                        body_str = body_str.replace("</body>", f"{CHAT_WIDGET_SCRIPT}\n</body>")
                        return Response(
                            content=body_str.encode("utf-8"),
                            status_code=response.status_code,
                            headers=dict(response.headers),
                            media_type=response.media_type,
                        )
            except Exception:
                pass
        return response


app.add_middleware(ChatWidgetMiddleware)


# ─── API Endpoints ───

@app.post("/api/start")
async def start_student(body: dict):
    """
    Register or identify a student.
    If the name already exists, update their level and return existing ID.
    Always creates a new session.
    """
    name = body.get("name", "").strip()
    level = body.get("level", "A2").strip().upper()

    if not name:
        raise HTTPException(400, "name is required")

    if level not in VALID_LEVELS:
        raise HTTPException(400, f"Invalid level. Choose from: {', '.join(sorted(VALID_LEVELS))}")

    # Find existing student or create new
    student = find_student_by_name(name)
    if student:
        if student["level"] != level:
            update_student_level(student["id"], level)
            student["level"] = level
        else:
            touch_student(student["id"])
    else:
        student = create_student(name, level)

    # Create a new session
    session = create_session(student["id"])

    return {
        "student_id": student["id"],
        "session_id": session["id"],
        "name": student["name"],
        "level": student["level"],
    }


@app.post("/api/chat")
async def chat(body: dict):
    """
    Chat endpoint. Requires student_id.
    Auto-manages sessions (creates new if last message > 30 min ago).
    Persists all messages. Returns personalized reply.
    """
    student_id = body.get("student_id")
    message = body.get("message", "").strip()
    scenario = body.get("scenario", "").strip()

    if not student_id:
        raise HTTPException(400, "student_id is required")
    if not message:
        raise HTTPException(400, "message is required")

    # Look up student
    conn = get_db()
    student_row = conn.execute(
        "SELECT * FROM students WHERE id = ?", (student_id,)
    ).fetchone()
    conn.close()

    if not student_row:
        raise HTTPException(404, "Student not found. Register with /api/start first.")

    student = dict(student_row)
    level = student["level"]
    name = student["name"]

    # Get or create session
    session = get_active_session(student_id)
    if not session:
        session = create_session(student_id)

    session_id = session["id"]

    # Save user message
    save_message(session_id, "user", message)
    touch_student(student_id)

    # Build conversation context
    context_messages = get_session_context(session_id)

    if not OPENROUTER_API_KEY:
        save_message(session_id, "assistant", "⚠️ El tutor no está configurado. Dile al administrador que revise la API key.")
        return {"reply": f"⚠️ Hi {name}! The tutor isn't configured yet. Please tell the admin to check the API key.", "student_name": name}

    # Build the system prompt for this level
    level_prompt = LEVEL_PROMPTS.get(level, LEVEL_PROMPTS["A2"])
    system_prompt = level_prompt + f"\n\nThe student's name is {name}. Always address them by their name to make the conversation personal."
    if scenario:
        system_prompt += f"\n\n--- SCENARIO ---\n{scenario}\n--- END SCENARIO ---"

    # Build messages array for OpenRouter
    or_messages = [{"role": "system", "content": system_prompt}]
    for ctx_msg in context_messages:
        or_messages.append({
            "role": ctx_msg["role"],
            "content": ctx_msg["content"],
        })

    # Call OpenRouter
    try:
        req_data = json.dumps({
            "model": OPENROUTER_MODEL,
            "messages": or_messages,
            "max_tokens": 500,
            "temperature": 0.7,
        }).encode("utf-8")

        req = urllib.request.Request(
            OPENROUTER_URL,
            data=req_data,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://ingles.skynetdelbarbas.com",
                "X-Title": "English Tutor - Ingles Tutor",
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            reply = result["choices"][0]["message"]["content"]

    except urllib.error.HTTPError as e:
        error_detail = e.read().decode("utf-8")[:300]
        print(f"OpenRouter HTTP {e.code}: {error_detail}", file=sys.stderr)
        reply = f"❌ Hi {name}, the tutor service is temporarily unavailable (HTTP {e.code}). Please try again later!"
    except Exception as e:
        print(f"OpenRouter error: {e}", file=sys.stderr)
        reply = f"❌ Hi {name}, I can't reach the tutor right now. Check your internet connection and try again."

    # Save assistant response
    save_message(session_id, "assistant", reply)

    return {"reply": reply, "student_name": name}


@app.get("/api/usage")
async def get_usage(student_id: int | None = None):
    """
    Get usage statistics.
    - With student_id: stats for that student
    - Without: overall stats for all students
    """
    if student_id:
        stats = get_student_usage(student_id)
        if not stats:
            raise HTTPException(404, "Student not found")
        return stats

    all_stats = get_all_usage()
    total_students = len(all_stats)
    total_messages = sum(s["total_messages"] or 0 for s in all_stats)
    by_level = {}
    for s in all_stats:
        lvl = s["level"]
        by_level.setdefault(lvl, {"students": 0, "messages": 0})
        by_level[lvl]["students"] += 1
        by_level[lvl]["messages"] += s["total_messages"] or 0

    # Recent activity
    recent = get_recent_conversations(10)

    return {
        "total_students": total_students,
        "total_messages": total_messages,
        "by_level": by_level,
        "students": all_stats,
        "recent_messages": recent,
    }


@app.get("/api/health")
async def health():
    """Health check."""
    return {
        "status": "ok",
        "model": OPENROUTER_MODEL,
        "levels_available": sorted(VALID_LEVELS),
        "api_configured": bool(OPENROUTER_API_KEY),
        "admin_configured": bool(ADMIN_PASSWORD),
    }


# ─── Admin login ───


@app.post("/api/admin/login")
async def admin_login(body: dict):
    """
    Authenticate for admin dashboard.
    Returns usage data on success.
    """
    password = body.get("password", "")

    if not ADMIN_PASSWORD:
        raise HTTPException(503, "Admin panel not configured (no TUTOR_ADMIN_PASSWORD set)")

    if password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid password")

    # Return full usage data
    all_stats = get_all_usage()
    total_students = len(all_stats)
    total_messages = sum(s["total_messages"] or 0 for s in all_stats)
    total_sessions = sum(s["total_sessions"] or 0 for s in all_stats)

    by_level = {}
    for s in all_stats:
        lvl = s["level"]
        by_level.setdefault(lvl, {"students": 0, "messages": 0, "sessions": 0})
        by_level[lvl]["students"] += 1
        by_level[lvl]["messages"] += s["total_messages"] or 0
        by_level[lvl]["sessions"] += s["total_sessions"] or 0

    recent = get_recent_conversations(30)

    # Student-level detail with per-session breakdown
    students_detail = []
    for s in all_stats:
        conn = get_db()
        sessions_rows = conn.execute("""
            SELECT id, started_at, ended_at, message_count
            FROM sessions WHERE student_id = ?
            ORDER BY started_at DESC LIMIT 10
        """, (s["id"],)).fetchall()
        conn.close()
        students_detail.append({
            **s,
            "sessions": [dict(r) for r in sessions_rows],
        })

    return {
        "success": True,
        "total_students": total_students,
        "total_messages": total_messages,
        "total_sessions": total_sessions,
        "by_level": by_level,
        "students": students_detail,
        "recent_messages": recent,
    }


# ─── Admin: get full message history for a student ───


@app.get("/api/admin/student-messages")
async def get_student_messages(
    student_id: int,
    password: str = "",
):
    """Return all messages for a student, ordered newest first. Requires admin password."""
    if not ADMIN_PASSWORD:
        raise HTTPException(503, "Admin not configured")
    if password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid password")

    conn = get_db()
    # Verify student exists
    student = conn.execute(
        "SELECT id, name, level FROM students WHERE id = ?", (student_id,)
    ).fetchone()
    if not student:
        conn.close()
        raise HTTPException(404, "Student not found")

    # Get all sessions for this student
    sessions = conn.execute("""
        SELECT id, started_at, ended_at, message_count
        FROM sessions WHERE student_id = ?
        ORDER BY started_at DESC
    """, (student_id,)).fetchall()

    # Get messages, newest first, grouped by session
    messages = conn.execute("""
        SELECT m.id, m.role, m.content, m.created_at, m.session_id,
               s.name as student_name
        FROM messages m
        JOIN sessions sess ON sess.id = m.session_id
        JOIN students s ON s.id = sess.student_id
        WHERE sess.student_id = ?
        ORDER BY m.created_at DESC
        LIMIT 200
    """, (student_id,)).fetchall()

    conn.close()

    return {
        "student": dict(student),
        "sessions": [dict(r) for r in sessions],
        "messages": [dict(r) for r in messages],
    }


# ─── Serve static files (catch-all for non-API routes) ───

BIN_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.svg', '.pdf', '.woff2', '.woff', '.ttf'}


@app.api_route("/{path:path}", methods=["GET"])
async def serve_static(path: str):
    """Serve static files from BASE_DIR."""
    if path.startswith("api/"):
        return JSONResponse({"error": "Not found"}, status_code=404)

    file_path = BASE_DIR / path if path else BASE_DIR / "index.html"
    if not path:
        file_path = BASE_DIR / "index.html"
    elif not (BASE_DIR / path).exists():
        file_path = BASE_DIR / "index.html"

    if file_path.is_dir():
        file_path = file_path / "index.html"

    if file_path.exists() and file_path.is_file():
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if mime_type is None:
            mime_type = "application/octet-stream"

        mode = "rb" if os.path.splitext(str(file_path))[1].lower() in BIN_EXTENSIONS else "r"
        try:
            if mode == "rb":
                content = file_path.read_bytes()
                return Response(
                    content=content, media_type=mime_type,
                    headers={"Cache-Control": "no-store, max-age=0"},
                )
            else:
                content = file_path.read_text(encoding="utf-8")
                return Response(
                    content=content, media_type=mime_type,
                    headers={"Cache-Control": "no-store, max-age=0"},
                )
        except Exception:
            pass

    return HTMLResponse("<h1>404 Not Found</h1><p>The page you requested does not exist.</p>", status_code=404)


# ─── Main ───
@app.on_event("startup")
def on_startup():
    init_db()
    levels = ", ".join(sorted(VALID_LEVELS))
    print(f"📚 English Tutor Server (multi-level: {levels})")
    print(f"   DB: {DB_PATH}")
    print(f"   Model: {OPENROUTER_MODEL}")
    print(f"   API key: {'✅ configured' if OPENROUTER_API_KEY else '❌ MISSING'}")
    print(f"   Chat API: POST http://localhost:{PORT}/api/chat")
    print(f"   Stats: GET http://localhost:{PORT}/api/usage")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
