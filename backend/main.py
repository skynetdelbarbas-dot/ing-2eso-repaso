# ing-2eso-repaso — Backend API
# FastAPI para writing correction, speaking, y sync de progreso

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Inglés Platform API",
    description="Backend para la plataforma de aprendizaje de inglés",
    version="1.0.0"
)

# CORS — permitir desde cualquier origen (GitHub Pages, túnel, localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health ──
@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

# ── Writing Correction (placeholder) ──
@app.post("/api/writing/correct")
def correct_writing(text: str):
    """
    Corrige un texto de writing usando LLM.
    Devuelve correcciones gramaticales, sugerencias de vocabulario,
    estimación CEFR y análisis de fluidez.
    """
    # TODO: Integrar con OpenRouter / DeepSeek
    return {
        "original": text,
        "corrections": [],
        "cefr_estimate": "A2",
        "vocabulary_suggestions": [],
        "grammar_issues": [],
        "fluency_score": 0.0
    }

# ── Speaking (placeholder) ──
@app.post("/api/speaking/analyze")
def analyze_speaking(audio_url: str):
    """
    Analiza un audio de speaking: transcripción, pronunciación, feedback.
    """
    # TODO: Whisper + análisis
    return {
        "transcription": "",
        "pronunciation_score": 0.0,
        "feedback": []
    }

# ── Progress Sync (placeholder) ──
@app.post("/api/progress/sync")
def sync_progress(data: dict):
    """
    Sincroniza progreso del alumno (para multi-dispositivo).
    Recibe el export de data-engine.js y lo almacena.
    """
    # TODO: Almacenar en SQLite/JSON
    return {"status": "saved", "items_received": len(data)}

@app.get("/api/progress/{user_id}")
def get_progress(user_id: str):
    """
    Recupera el progreso de un alumno.
    """
    # TODO: Leer de almacenamiento
    return {"user_id": user_id, "progress": {}}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "18402"))
    uvicorn.run(app, host="127.0.0.1", port=port)
