# 🏗️ Inglés Platform — Architecture

## Visión general

Plataforma web SPA para aprendizaje de inglés. Nació como un repaso para 2º ESO y
evoluciona hacia un ecosistema completo multi-nivel (A1-B2) con tracking de progreso,
gamificación, contenido etiquetado y backend para features de IA.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS + Vanilla JS (SPA, sin framework) |
| Progreso | localStorage vía `data-engine.js` |
| Contenido | JSON estructurado en `content/` |
| Registro | `content-registry.js` — índice centralizado |
| Backend | FastAPI (Python 3) en `/backend/` |
| Despliegue | GitHub Pages + Cloudflare Tunnel (tutor.skynetdelbarbas.com) |
| Failover | Cloudflare Worker (`ingles-worker.js`) |

## Estructura de archivos

```
ing-2eso-repaso/
├── index.html              # SPA principal
├── canciones.html          # Songs (standalone)
├── style.css               # Estilos globales
├── exercises.js            # Motor de ejercicios (gap + full mode)
├── pool.js                 # Writing, Reading, Listening pools
├── chat-widget.js          # Chatbot flotante
├── ingles-worker.js        # CF Worker (failover túnel ↔ GitHub Pages)
│
├── data-engine.js          # [NUEVO] Sistema de progreso y gamificación
├── content-registry.js     # [NUEVO] Catálogo centralizado de contenido
├── content-schema.json     # [NUEVO] Taxonomía de etiquetado
│
├── content/                # [NUEVO] Contenido estructurado en JSON
│   ├── grammar/
│   ├── vocabulary/
│   ├── writing/
│   ├── reading/
│   ├── listening/
│   ├── speaking/
│   ├── pronunciation/
│   ├── practice/
│   └── exams/
│
├── backend/                # [NUEVO] Backend FastAPI
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── start-backend.sh        # [NUEVO] Script LaunchAgent
│
├── *.html                  # Standalone pages (vocabulary, passive, etc.)
│
└── README.md / ARCHITECTURE.md
```

## Sistema de etiquetado

Cada contenido se etiqueta con 5 dimensiones fijas (definidas en `content-schema.json`):

| Dimensión | Valores | Ejemplo |
|-----------|---------|---------|
| **level** | A1, A2, B1, B2, C1, C2 | `["A1", "A2"]` |
| **skill** | grammar, listening, speaking, reading, writing, vocabulary, pronunciation | `"grammar"` |
| **difficulty** | basic, intermediate, advanced | `"basic"` |
| **type** | theory, practice, quiz, exam, revision, game, reference, template | `"theory"` |
| **stage** | ESO-1..ESO-4, bachiller, adultos, general | `["ESO-2"]` |

Además: `depends_on`, `unlocks`, `tags`, `estimated_minutes`.

## data-engine.js

Sistema de progreso vía localStorage. Namespace `ing-platform`.

### Capacidades

- **XP y niveles**: curva de niveles prefijada, XP por ejercicio completado
- **Streak diario**: racha de días estudiando, bonus por hitos (3, 7, 14, 30 días)
- **Sesiones**: inicio/fin automático, tiempo total acumulado
- **Errores**: tracking por contenido, top 50 errores frecuentes
- **Progreso por contenido**: score, intentos, última revisión
- **Badges**: 10 logros predefinidos con detección automática
- **Dashboard**: API para obtener datos completos del alumno

### API principal

```javascript
const tracker = window.__tracker  // instancia global

// Registrar ejercicio
tracker.recordExercise('present-simple-quiz', { correct: 8, total: 10 })

// Obtener dashboard
const dashboard = tracker.getDashboard()
// → { xp, level, streak, completionPct, topErrors, badges, ... }

// Contenidos que necesitan repaso
tracker.getNeedsReview()
// → [{ id, score, lastReview }, ...]
```

## content-registry.js

Índice centralizado que mapea IDs de contenido a archivos JSON y metadatos.

### API principal

```javascript
const registry = window.__registry

// Obtener metadatos
registry.get('present-simple')
// → { id, title, level: ['A1','A2'], skill: 'grammar', ... }

// Filtrar
registry.filter({ level: 'A1', skill: 'grammar' })
registry.filter({ type: 'quiz', tag: 'typing' })
registry.filter({ search: 'verbs' })

// Rutas de aprendizaje
registry.getPath('eso-2')
registry.getPathProgress(tracker, 'cambridge-a2')

// Contenidos desbloqueables
registry.getUnlocked(['verb-to-be', 'subject-pronouns'])
```

## Estructura JSON de contenido

### Grammar (teoría + ejercicios)

```json
{
  "id": "present-simple",
  "sections": [
    { "type": "intro", "content": "..." },
    { "type": "usage", "title": "Usos", "items": [...] },
    { "type": "affirmative", "title": "✅ Affirmative", "rules": [...] },
    { "type": "negative", "title": "❌ Negative", "rules": [...] },
    { "type": "questions", "title": "❓ Questions", "rules": [...] }
  ],
  "exercises": [
    { "id": "ps-1", "type": "gap", "stem": "...", "answer": "..." }
  ]
}
```

### Vocabulary (categorías + palabras)

```json
{
  "id": "vocab-travel",
  "categories": [
    {
      "name": "✈️ At the airport",
      "items": [
        { "word": "check-in", "translation": "...", "example": "..." }
      ]
    }
  ]
}
```

### Practice/Quiz (flashcards, typing, etc.)

```json
{
  "id": "irregular-verbs-flashcards",
  "levels": {
    "basic": { "title": "Básicos", "verbs": [...] },
    "frequent": { "title": "Frecuentes", "verbs": [...] }
  }
}
```

## Backend (FastAPI)

Puerto: `18402` (siguiente en la secuencia tras 18401 de la web).

Endpoints actuales (placeholders para Fase 3):

| Endpoint | Método | Función |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/writing/correct` | POST | Corrección de writing con LLM |
| `/api/speaking/analyze` | POST | Transcripción y análisis de speaking |
| `/api/progress/sync` | POST | Sincronización multi-dispositivo |
| `/api/progress/{user_id}` | GET | Recuperar progreso |

## Estrategia de no-ruptura

Los nuevos módulos (`data-engine.js`, `content-registry.js`) se cargan como
`<script type="module">` — no bloquean renderizado, no interfieren con la
funcionalidad existente. La migración de contenido de HTML inline a JSON es
gradual: cuando se toca una sección, se migra. No hay fase de migración forzosa.

## Flujo de datos

```
Usuario → index.html (SPA)
            ├── exercises.js (ejercicios inline existentes)
            ├── pool.js (pools existentes)
            ├── data-engine.js (tracking de progreso) → localStorage
            └── content-registry.js (índice) → content/*.json
                                                    │
                              backend (FastAPI) ←────┘
                                ├── /api/writing/correct
                                ├── /api/speaking/analyze
                                └── /api/progress/sync
```

## Rutas de aprendizaje predefinidas

| Ruta | Nivel | Enfoque |
|------|-------|---------|
| Beginner Path | A1 | Desde cero |
| 2º ESO Path | A1-A2 | Currículo escolar |
| Cambridge A2 Key | A2 | Preparación examen |
| Grammar Survival | A1-B1 | Imprescindibles |
| Exam Preparation | A2-B1 | Técnicas de examen |
| Intensive Review | A1-B1 | Repaso rápido |
