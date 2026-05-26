# 📋 Release Notes — Plataforma Inglés 2º ESO

> **Timeline:** 22 – 26 de mayo de 2026 (5 días de desarrollo intensivo)  
> **Commits totales:** ~55

---

## v1.0 — Fundación | 22–23 Mayo

### v1.0.0 — Initial Commit (22 May)
- Estructura base del proyecto con ejercicios interactivos de Inglés 2º ESO
- `exercises.js` con pool inicial de ejercicios
- Sistema de **rondas** para práctica progresiva
- Páginas HTML estáticas para cada tema gramatical
- Audio MP3 para ejercicios de listening

### v1.0.1 — Correcciones Iniciales (23 May)
- **Fix**: escape de apóstrofes en `data-alts` (rompía `checkOne` tras 4 ejercicios)
- **Fix**: eliminadas preguntas de Past Simple del pool de Present Perfect
- **Cache busters**: versionado `v=7` en JS, `v=4` en CSS
- **Mejora UX**: stems de Just/Already/Yet sin `have/has`, respuestas con Have/Has completo
- **Teoría Present Perfect**: regla Since/For explicada, "truco del millón", ejemplos con `[PPS]/[PPC]`
- **Lenguaje inclusivo**: "Bienvenid@" en el índice
- **DNS**: CNAME para dominio personalizado

---

## v2.0 — Simulacro & Contenido | 24 Mayo

### v2.1.0 — Simulacro de Examen
- **Simulacro**: 10 bloques × 5 preguntas, puntuación 0.20 cada una
- **Bloque 11**: bloque de listening con SpeechSynthesis
- **Puntuación por bloque**: botón de corregir individual
- **Puntuación separada**: UOE /10 + Listening /10
- **Segundo listening**: "Tom's zoo trip"
- **Scoring**: cálculo dinámico tras cada corrección

### v2.2.0 — Expansión de Contenido
- **Reported Speech**: enlace a PDF descargable con teoría y ejercicios
- **Vocabulary**: referencia completa por unidades + PDF descargable
- **Vocabulary pool**: expandido a **115 preguntas** alineado con referencia del PDF
- **Simulacro bloque 10**: vocabulario actualizado según referencia PDF
- **Páginas rosa**: contenido de referencia y ejercicios alineado con PDF (Units 1, 3, 5-11)

---

## v3.0 — Mega-SPA & Rediseño | 25 Mayo

### v3.0.0 — Conversión a SPA
- **Arquitectura SPA completa**: todas las secciones en un solo `index.html`
- Navegación con sidebar y `show()` para mostrar/ocultar secciones
- Menú colapsable de gramática con 13 temas

### v3.0.1 — Traductor Flotante
- Botón 🔤 flotante en esquina inferior derecha
- Panel desplegable con traducción y voz
- Se oculta automáticamente durante el simulacro

### v3.0.2 — Irregular Verbs 3.0
- Tabla completa con 3 formas verbales
- **Pronunciación**: `speakAll3()` reproduce secuencialmente base → past → participle

### v3.0.3 — Writing Templates
- 8 plantillas de writing (Opinion, For/Against, Emails, Story, Article, Blog, Review)
- Cajas de texto editables

### v3.0.4 — Sistema de Carga Legacy (Iframe)
- Páginas legacy (simulacro, vocabulary, grammar-review, cambridge-a2) cargadas en **iframe**
- Soporte multi-respuesta
- Hints de adjetivos en comparatives

### v3.0.5 — Bugfixes Post-SPA
- Ejercicios inline funcionales en páginas legacy
- Checkboxes en simulacro con filtrado
- Aislamiento de nombres: `_pickRandom`, `chk` namespaced para evitar conflictos
- `exercises.js` cargado en SPA para que legacy pages funcionen
- Iframe loader robusto con múltiples estrategias (fetch → iframe fallback)

---

## v4.0 — Pool, Timer & Fetch Revolution | 26 Mayo

### v4.1.0 — Pool Central de Ejercicios
- **`pool.js`**: 30 ejercicios divididos en:
  - **10 Writing**: prompts con keywords, bonus words, trapWords (españolismos), modelo de referencia
  - **10 Reading**: textos con preguntas de comprensión
  - **10 Listening**: textos para SpeechSynthesis con preguntas
- **Corrección por keywords**: detecta presencia de palabras clave en la respuesta del alumno
- Writing bajo pestaña específica "Writing Practice"

### v4.2.0 — Timer & Instrucciones
- **Cronómetro flotante**: `position: fixed`, visible siempre durante el examen
- **Instrucciones dinámicas**: se muestran según el estado del examen
- Pool blocks seleccionables con checkboxes en simulacro
- Leyenda explicativa de colores/puntuación
- Scroll directo al ejercicio seleccionado

### v4.2.1 — Cache Busting General
- Versionados `?v=N` en todas las URLs: `pool.js`, `exercises.js`, `style.css`, `simulacro.html`
- Reflejado tanto en SPA como en iframe/páginas legacy

### v4.3.0 — Fetch sin Iframe (Revolución)
- **Eliminación del iframe**: las páginas legacy ahora se cargan vía `fetch()`
- Se extrae `<main>` del HTML con regex
- **Los scripts se extraen antes del `innerHTML`** para garantizar ejecución
- Filtrado de `src=` solo en atributos, no en contenido del script
- Timer ahora a nivel página (no anidado en iframe)
- **Fin del doble scroll** definitivo

### v4.4.0 — Bugfixes Intensivos
- **Fix crítico**: `display: none` en `.section` ocultaba todo el contenido de páginas legacy → eliminado
- **Fix eventos**: prácticas no se cierran al hacer click en inputs/botones (`stopPropagation`)
- **Botón ⏹ Parar**: detiene SpeechSynthesis en listening practice
- **Hints unchecked** por defecto en simulacro
- **Inputs inline en stem**: los inputs se colocan donde está `____` o al final del texto
- **Ancho dinámico**: inputs entre 140px y 500px según longitud de la respuesta esperada
- **Botón Generar Examen** movido después de las instrucciones (timer/hint)
- **Opciones Extra**: panel `⚙️` con toggles de tiempo y respuestas
- **Todos los botones visibles**: incluyendo "Corregir todo" global tras generar examen
- **Weighted scoring**: puntuación ponderada calculada automáticamente
- **Pool con `var`** (no `const`) para accesibilidad global
- **Auto-render** de pool exercises al cargar la sección
- **Audio en bloques**: SpeechSynthesis disponible en listening del simulacro
- **Scoring condicional**: solo se muestran puntuaciones de bloques corregidos
- **Timer flotante**: posicionado correctamente a nivel página
- **Hint toggle**: se deshabilita al generar examen, se re-habilita al corregir

### v4.4.1 — Cache Busters Finales
- `simulacro.html?v=3`, `exercises.js?v=9`, `pool.js?v=3`, `style.css?v=6`
- Commit final de la tanda: `d52e509`

---

## Resumen de Evolución

```
22 May ─▶ Semilla: ejercicios estáticos + rondas
23 May ─▶ Correcciones + teoría Present Perfect + Just/Already/Yet
24 May ─▶ Simulacro: 10 bloques + listening + puntuación
       ─▶ Vocabulary: 115 preguntas + PDF + páginas rosa
25 May ─▶ MEGA-SPA: sidebar, 13 temas grammar, traductor, verbs 3D
       ─▶ Iframe loader para legacy pages
26 May ─▶ Pool central (30 ejercicios Writing/Reading/Listening)
       ─▶ Timer flotante, cache busting generalizado
       ─▶ Fetch revolution: iframe eliminado, fin doble scroll
       ─▶ Bugfixes intensivos, Opciones Extra, weighted scoring
       ─▶ Inputs dinámicos, hints toggle, stopPropagation
```

---

## Stats

| Métrica | Valor |
|---|---|
| Días de desarrollo | 5 |
| Commits totales | ~55 |
| Archivos HTML | 15 |
| Líneas pool.js | 990 |
| Líneas CSS | 416 |
| Ejercicios Writing Pool | 10 |
| Ejercicios Reading Pool | 10 |
| Ejercicios Listening Pool | 10 |
| Preguntas Vocabulary | 115 |
| Bloques Simulacro | 11 |
| Temas Gramática | 13 |
| Plantillas Writing | 8 |
| PDFs descargables | 2 |
