# 🎓 Plataforma de Inglés 2º ESO — Documento Funcional

> **URL:** https://ingles.skynetdelbarbas.com  
> **Directorio:** `~/hermes/ing-2eso-repaso/`  
> **Stack:** SPA (Single Page Application) HTML+CSS+JS vanilla, sin frameworks  
> **Última actualización:** 26 de mayo de 2026

---

## 1. ARQUITECTURA GENERAL

### 1.1 Estructura de Archivos

| Archivo | Función |
|---|---|
| `index.html` | SPA principal — menú, navegación, todas las secciones integradas + JS inline |
| `simulacro.html` | Página legacy del simulacro de examen (cargada vía fetch) |
| `vocabulary.html` | Página legacy de vocabulario por unidades con ejercicios |
| `grammar-review.html` | Página legacy de repaso gramatical 1º ESO |
| `cambridge-a2.html` | Página legacy de preparación Cambridge A2 Key |
| `articles.html` | Página legacy: ejercicios de artículos |
| `conditionals.html` | Página legacy: ejercicios de condicionales |
| `indefinite-pronouns.html` | Página legacy: pronombres indefinidos |
| `nor-neither-so.html` | Página legacy: nor / neither / so |
| `passive.html` | Página legacy: voz pasiva |
| `present-perfect.html` | Página legacy: present perfect |
| `question-tags.html` | Página legacy: question tags |
| `reported-speech.html` | Página legacy: reported speech |
| `wish-if-only.html` | Página legacy: I wish / If only |
| `pool.js` | Pool central de ejercicios Writing, Reading, Listening (990 líneas) |
| `exercises.js` | Pool de ejercicios legacy (vocabulary tasks) |
| `style.css` | Estilos responsive (416 líneas) |
| `ingles-worker.js` | Cloudflare Worker para el subdominio |
| `audio/` | Archivos de audio MP3 para listening |
| `pdfs/` | PDFs descargables de teoría y ejercicios |

### 1.2 Sistema de Carga

- **SPA nativa**: las secciones principales (home, fundamentos, verbs, grammar, writing, vocabulary pool, etc.) están definidas como divs ocultos/mostrados por `display: block/none` mediante `show()`.
- **Carga legacy vía `fetch()`**: páginas HTML externas (simulacro, vocabulary, etc.) se cargan con `fetch()` → se extrae `<main>` con regex → se inyecta en el contenedor SPA. Los scripts se extraen antes del innerHTML para garantizar ejecución.
- **Cache busting**: versionados `?v=N` en todas las URLs de recursos (`pool.js?v=3`, `exercises.js?v=9`, `style.css?v=6`, `simulacro.html?v=3`).

---

## 2. NAVEGACIÓN — MENÚ PRINCIPAL

### 🏠 Inicio
- Cards de acceso rápido: Fundamentos, Irregular Verbs, Grammar, Writing, Simulacro
- Bienvenida dinámica con enlaces directos

### 📖 Fundamentos
- To Be, To Have, To Get
- Reglas esenciales con ejemplos
- Ejercicios inline con sistema de rondas (`_rounds`), corrección y reset

### 📋 Irregular Verbs
- Tabla completa verbos irregulares con 3 formas (base, past, participle)
- **Pronunciación**: click en cualquier fila → `speakAll3()` reproduce las 3 formas secuencialmente vía SpeechSynthesis
- Resaltado interactivo

### 🗣️ Grammar (submenú colapsable)
13 temas gramaticales, cada uno con:
- Teoría explicativa con ejemplos
- Sistema de **rondas de ejercicios** (``_rounds``): botón "▶️ Siguiente ronda" genera nuevo ejercicio aleatorio
- Botones: ✅ Corregir todo | 🔄 Reset | ▶️ Siguiente ronda

| ID | Tema |
|---|---|
| `g-modal` | Modal Verbs |
| `g-future` | Future Tenses |
| `g-comparatives` | Comparatives & Superlatives |
| `g-just` | Just / Already / Yet / Still |
| `g-present-perfect` | Present Perfect S/C |
| `g-conditionals` | Conditionals |
| `g-reported-speech` | Reported Speech |
| `g-passive` | Passive Voice |
| `g-wish-if-only` | I wish / If only |
| `g-question-tags` | Question Tags |
| `g-articles` | Articles (a/an/the) |
| `g-indefinite-pronouns` | Indefinite Pronouns |
| `g-nor-neither` | Nor / Neither / So |

### 📝 Plantillas (Writing)
- 8 plantillas de Writing con estructura guiada:
  1. Opinion Essay
  2. For and Against Essay
  3. Informal Email
  4. Formal Email
  5. Story
  6. Article
  7. Blog Post
  8. Review
- Cada una con **caja de texto editable** donde el alumno escribe directamente

### 🖊️ Writing Practice
- **10 ejercicios de escritura** del pool central (`WRITING_POOL` en `pool.js`)
- Cada ejercicio: título, prompt en inglés, palabras clave requeridas, mínimo/máximo palabras, palabras trampa (españolismos)
- Caja de texto grande para escribir
- **Corrección por keywords**: detecta presencia de palabras clave y bonus
- **Modelo de referencia** mostrado tras corregir
- Scroll automático al hacer clic en un ejercicio

### 📖 Reading Practice
- **10 textos de lectura** del pool central (`READING_POOL`)
- Preguntas de comprensión después de cada texto
- SpeechSynthesis disponible para leer en voz alta

### 🎧 Listening Practice
- **10 ejercicios de listening** del pool central (`LISTENING_POOL`)
- Texto reproducido vía **SpeechSynthesis** (Web Speech API)
- Botón **⏹ Parar** para detener la reproducción
- Preguntas de comprensión después de cada audio

### 📖 Vocabulary
- Página legacy cargada vía fetch (`vocabulary.html`)
- Referencia completa de vocabulario por unidades (1-11)
- PDF descargable con teoría
- Pool de **115 preguntas** alineado con las "páginas rosa" del PDF de referencia
- Ejercicios tipo cloze / opción múltiple

### 🔄 Grammar Review 1º ESO
- Página legacy cargada vía fetch (`grammar-review.html`)
- Repaso gramatical de 1º ESO

### 🎓 Cambridge A2 Key
- Página legacy cargada vía fetch (`cambridge-a2.html`)
- Preparación específica para el examen Cambridge A2 Key (KET)

### 🎯 Simulacro examen
- Página legacy cargada vía fetch (`simulacro.html`)
- **Simulación completa de examen** con generación aleatoria

---

## 3. SIMULACRO DE EXAMEN (🎯)

### 3.1 Estructura del Examen
- **10 bloques temáticos** × 5 preguntas cada uno = 50 preguntas
- **Bloque 11**: Listening (audio por SpeechSynthesis)
- Puntuación: 0.20 puntos por pregunta
- Peso total: 10 puntos UOE + 10 puntos Listening

### 3.2 Generación del Examen
1. El alumno **selecciona los bloques** que quiere incluir (checkboxes)
2. Pulsa **"Generar Examen"**
3. El sistema selecciona aleatoriamente preguntas del pool
4. Se muestran las instrucciones y el cronómetro

### 3.3 ⚙️ **Opciones Extra** (panel de configuración)
- **⏱️ Mostrar tiempo**: toggle para activar/desactivar el cronómetro
- **💡 Mostrar respuestas**: toggle para mostrar las respuestas correctas
  - Se deshabilita automáticamente al generar un nuevo examen
  - Se desbloquea al corregir (toggle re-habilitado)

### 3.4 Interacción Durante el Examen
- **Inputs dinámicos**: el ancho del input se ajusta automáticamente según la longitud de la respuesta esperada (mín. 140px, máx. 500px)
- **Inputs inline**: los inputs se colocan donde está `____` en el stem, o al final si no hay placeholder
- **Checkboxes nativos**: para preguntas multi-opción
- **Eventos**: `event.stopPropagation()` en inputs y botones para evitar cierre accidental

### 3.5 Corrección y Puntuación
- **Bloque por bloque**: botón "✅ Corregir" individual por bloque
- **Corrección global**: botón "✅ Corregir todo" al final
- **Scoring dinámico**: se actualiza tras cada corrección
- **Weighted score**: escanea la puntuación de cada bloque y calcula el total ponderado
- **Casilla dedicada** de puntuación ponderada
- Solo las puntuaciones de bloques corregidos son visibles

### 3.6 Timer / Cronómetro
- Cuenta atrás configurable
- **Flotante** (`position: fixed`) visible siempre durante el examen
- Se oculta si el toggle de tiempo está desactivado
- Posicionado a nivel página (no anidado en iframe)

---

## 4. POOL CENTRAL (`pool.js`)

### 4.1 Writing Pool (10 ejercicios)
- Temas: descripción de habitación, email a amigo, descripción de familia, rutina diaria, restaurante, ciudad, fin de semana, película, deporte, fin de semana ideal
- Cada ejercicio: `{ id, title, prompt, wordMin, wordMax, keywords, bonus, trapWords, model }`
- **Keywords**: palabras que el alumno debe usar obligatoriamente
- **Bonus**: palabras extra que suman puntos adicionales
- **TrapWords**: españolismos a detectar y penalizar
- **Model**: respuesta modelo de referencia

### 4.2 Reading Pool (10 ejercicios)
- Textos con preguntas de comprensión
- SpeechSynthesis para lectura en voz alta

### 4.3 Listening Pool (10 ejercicios)
- Textos diseñados para ser leídos por SpeechSynthesis
- Preguntas de comprensión auditiva

---

## 5. FUNCIONALIDADES TRANSVERSALES

### 5.1 🔤 Traductor Flotante
- Botón flotante 🔤 en la esquina superior derecha
- Panel desplegable: texto → español
- Botón 🔁 para traducir (simulado / integrado)
- Botón 🔊 para leer en voz alta
- Se **oculta automáticamente** durante el simulacro de examen

### 5.2 🔊 SpeechSynthesis (Web Speech API)
- Lectura en voz alta de textos, palabras, respuestas
- Reproducción secuencial de las 3 formas verbales
- Botón de Parar reproducción en listening
- Soporte multilingüe (voz inglesa para ejercicios)

### 5.3 💡 Sistema de Ayuda / Hints
- Botón "💡 Mostrar" con la respuesta correcta
- Toggle "Mostrar respuestas" en simulacro
- Hints deshabilitados durante la generación del examen
- Multi-respuesta: muestra todas las respuestas aceptadas

### 5.4 🎨 Diseño Visual
- **Tema oscuro** con sidebar izquierdo fijo
- **Responsive**: sidebar se oculta en móvil con menú hamburguesa
- **Cards** en la home con iconos emoji
- **Botones** con iconografía consistente (✅ ⏹ ▶️ 🔄 💡)
- **Scroll**: sin doble scroll en ninguna página
- **Sidebar unificado**: mismo menú en todas las secciones

### 5.5 📥 PDFs Descargables
- **Reported Speech**: teoría + ejercicios
- **Vocabulary**: referencia completa por unidades

### 5.6 Caché y Consistencia
- **Cache busting**: versionado manual `?v=N` en cada recurso
- **Servidor anti-caché** en puerto 18801 para pruebas con headers `no-cache`
- **GitHub Pages** como hosting principal

---

## 6. TECNOLOGÍAS

| Componente | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript vanilla |
| Speech | Web Speech API (SpeechSynthesis) |
| Hosting | GitHub Pages (`skynetdelbarbas.github.io`) |
| CDN / Proxy | Cloudflare (subdominio `ingles.skynetdelbarbas.com`) |
| Worker | Cloudflare Worker (`ingles-worker.js`) |
| PDFs | Descargables (almacenados en `pdfs/`) |
| Audio | MP3 en `audio/` |

---

## 7. MAPA DE NAVEGACIÓN COMPLETO

```
🏠 Inicio
├── 📖 Fundamentos          → inline exercises + rounds
├── 📋 Irregular Verbs      → tabla + pronunciación 3-formas
├── 🗣️ Grammar (submenú)
│   ├── Modal Verbs
│   ├── Future Tenses
│   ├── Comparatives & Superlatives
│   ├── Just / Already / Yet / Still
│   ├── Present Perfect S/C
│   ├── Conditionals
│   ├── Reported Speech
│   ├── Passive Voice
│   ├── I wish / If only
│   ├── Question Tags
│   ├── Articles (a/an/the)
│   ├── Indefinite Pronouns
│   └── Nor / Neither / So
├── 📝 Plantillas           → 8 writing templates + text boxes
├── 🖊️ Writing Practice     → 10 pool exercises (keywords, traps, model)
├── 📖 Reading Practice     → 10 pool texts + comprehension
├── 🎧 Listening Practice   → 10 pool audios + SpeechSynthesis
├── 📖 Vocabulary           → legacy page (115 preguntas)
├── 🔄 Grammar Review 1º ESO → legacy page
├── 🎓 Cambridge A2 Key     → legacy page
└── 🎯 Simulacro examen     → 11 bloques, timer, opciones extra
    └── ⚙️ Opciones Extra
        ├── ⏱️ Mostrar tiempo
        └── 💡 Mostrar respuestas
```
