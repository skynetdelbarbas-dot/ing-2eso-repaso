/**
 * exercises.js — Motor compartido de ejercicios interactivos
 * 
 * Soporta dos modos:
 *   Modo "gap"  → un input por frase (artículos, pronombres, conditionals...)
 *   Modo "full" → respuesta completa (nor/so, reported speech, wish rewrite...)
 */

// ============================================================
// Renderizado de ejercicios (modo "full" = respuesta completa)
// ============================================================

/**
 * Renderiza una lista de ejercicios en un contenedor.
 * @param {Array} data - Array de { stem, answer, alts }  
 * @param {string} containerId - ID del contenedor
 * @param {string} placeholder - Texto placeholder para el input
 */
function renderExercises(data, containerId, placeholder) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  data.forEach((ex, i) => {
    const num = i + 1;
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.id = `ex-${containerId}-${num}`;
    card.innerHTML = `
      <p class="stem"><strong>${num}.</strong> ${ex.stem}</p>
      <input type="text" id="inp-${containerId}-${num}" 
             data-answer="${ex.answer}" 
             data-alts="${JSON.stringify(ex.alts || []).replace(/"/g, '&quot;')}" 
             placeholder="${placeholder || 'Escribe la respuesta...'}">
      <div class="btn-row">
        <button class="btn-sm btn-check" onclick="checkOne('${containerId}', ${num})">✅ Corregir</button>
        <button class="btn-sm btn-answer" onclick="showAnswer('${containerId}', ${num})">💡 Mostrar respuesta</button>
      </div>
      <div id="fb-${containerId}-${num}" class="feedback-line"></div>
      <div id="hint-${containerId}-${num}" class="hint-box"></div>
    `;
    container.appendChild(card);
  });
}

// ============================================================
// Funciones de corrección (modo "full")
// ============================================================

function getAnswer(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return null;
  return {
    val: input.value.trim().toLowerCase(),
    mainAns: input.dataset.answer,
    alts: JSON.parse(input.dataset.alts || '[]')
  };
}

function markCorrect(input, fb, hint) {
  input.classList.remove('wrong');
  input.classList.add('correct');
  fb.className = 'feedback-line show ok';
  fb.textContent = '✅ ¡Correcto!';
  if (hint) hint.classList.remove('show');
}

function markWrong(input, fb, hint, mainAns) {
  input.classList.remove('correct');
  input.classList.add('wrong');
  fb.className = 'feedback-line show ko';
  fb.textContent = '❌ Incorrecto';
  if (hint) {
    hint.className = 'hint-box show';
    hint.innerHTML = `<strong>Respuesta correcta:</strong> <span class="correct-answer">${mainAns}</span>`;
  }
}

function checkOne(containerId, num) {
  const input = document.getElementById(`inp-${containerId}-${num}`);
  const fb = document.getElementById(`fb-${containerId}-${num}`);
  const hint = document.getElementById(`hint-${containerId}-${num}`);
  if (!input || !fb) return;
  const { val, mainAns, alts } = getAnswer(`inp-${containerId}-${num}`);
  const allValid = [mainAns, ...alts];
  if (allValid.includes(val)) {
    markCorrect(input, fb, hint);
  } else {
    markWrong(input, fb, hint, mainAns);
  }
}

function showAnswer(containerId, num) {
  const input = document.getElementById(`inp-${containerId}-${num}`);
  const hint = document.getElementById(`hint-${containerId}-${num}`);
  if (!input) return;
  const { mainAns } = getAnswer(`inp-${containerId}-${num}`);
  input.value = mainAns;
  input.classList.remove('wrong', 'correct');
  hint.className = 'hint-box show';
  hint.innerHTML = `<strong>Respuesta:</strong> <span class="correct-answer">${mainAns}</span>`;
  const fb = document.getElementById(`fb-${containerId}-${num}`);
  if (fb) fb.className = 'feedback-line';
}

function checkAllFull(containerId, total) {
  let correct = 0;
  for (let i = 1; i <= total; i++) {
    checkOne(containerId, i);
    const input = document.getElementById(`inp-${containerId}-${i}`);
    if (input && input.classList.contains('correct')) correct++;
  }
  const pct = Math.round((correct / total) * 100);
  const scoreId = `${containerId}-score`;
  let scoreBox = document.getElementById(scoreId);
  if (!scoreBox) {
    scoreBox = document.createElement('div');
    scoreBox.id = scoreId;
    scoreBox.className = 'score-box';
    const section = document.getElementById(containerId);
    if (section) section.appendChild(scoreBox);
  }
  scoreBox.style.display = 'block';
  let msg = `🎯 ${correct}/${total} correctas (${pct}%)`;
  if (pct === 100) msg += ' ¡Perfecto! 🏆';
  else if (pct >= 70) msg += ' Muy bien 👍';
  else msg += ' Sigue practicando 💪';
  scoreBox.innerHTML = `<span class="big">${correct}/${total}</span><br>${msg}`;
  // ── Tracker: registrar progreso ──
  if (window.__tracker && total > 0) {
    window.__tracker.recordExercise(containerId, { correct, total });
  }
}

function resetAll(containerId, total) {
  for (let i = 1; i <= total; i++) {
    const input = document.getElementById(`inp-${containerId}-${i}`);
    if (input) {
      input.value = '';
      input.classList.remove('correct', 'wrong');
    }
    const fb = document.getElementById(`fb-${containerId}-${i}`);
    if (fb) { fb.className = 'feedback-line'; fb.textContent = ''; }
    const hint = document.getElementById(`hint-${containerId}-${i}`);
    if (hint) { hint.className = 'hint-box'; hint.innerHTML = ''; }
  }
  const scoreBox = document.getElementById(`${containerId}-score`);
  if (scoreBox) { scoreBox.style.display = 'none'; scoreBox.innerHTML = ''; }
}

// ============================================================
// Modo "gap" — un input peque para completar una frase
// Usa la estructura original: <div class="exercise"> con input
// ============================================================

function checkGap(answers) {
  const inputs = document.querySelectorAll('[data-key]');
  let correct = 0;
  let total = 0;
  inputs.forEach(inp => {
    const key = inp.dataset.key;
    if (!answers[key]) return;
    total++;
    const val = inp.value.trim().toLowerCase();
    const valid = answers[key].map(a => a.toLowerCase().trim());
    if (valid.includes(val)) {
      inp.classList.remove('wrong');
      inp.classList.add('correct');
      correct++;
    } else {
      inp.classList.remove('correct');
      inp.classList.add('wrong');
    }
  });
  return { correct, total };
}

function checkAllGap(answers, scoreContainerId) {
  const { correct, total } = checkGap(answers);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const scoreBox = document.getElementById(scoreContainerId);
  if (!scoreBox && total === 0) return;
  if (scoreBox) {
    scoreBox.style.display = 'block';
    let msg = `🎯 ${correct}/${total} correctas (${pct}%)`;
    if (pct === 100) msg += ' ¡Perfecto! 🏆';
    else if (pct >= 70) msg += ' Muy bien 👍';
    else msg += ' Sigue practicando 💪';
    scoreBox.innerHTML = `<span class="big">${correct}/${total}</span><br>${msg}`;
    // ── Tracker: registrar progreso ──
    if (window.__tracker && total > 0) {
      window.__tracker.recordExercise(scoreContainerId, { correct, total });
    }
  }
}

function resetGap() {
  document.querySelectorAll('[data-key]').forEach(inp => {
    inp.value = '';
    inp.classList.remove('correct', 'wrong');
  });
  document.querySelectorAll('.score-box').forEach(sb => {
    sb.style.display = 'none';
    sb.innerHTML = '';
  });
}

// ============================================================
// localStorage: guardar/restaurar progreso
// ============================================================
function saveProgress() {
  const data = {};
  document.querySelectorAll('[data-key]').forEach(inp => {
    data[inp.dataset.key] = inp.value;
  });
  document.querySelectorAll('#ex-list input[type="text"]').forEach(inp => {
    if (inp.id) data[inp.id] = inp.value;
  });
  const topic = document.body.dataset.topic || 'unknown';
  try {
    localStorage.setItem(`ing-2eso-${topic}`, JSON.stringify(data));
  } catch(e) {}
}

function restoreProgress() {
  const topic = document.body.dataset.topic || 'unknown';
  let data;
  try {
    data = JSON.parse(localStorage.getItem(`ing-2eso-${topic}`));
  } catch(e) { return; }
  if (!data) return;
  Object.keys(data).forEach(key => {
    const el = document.getElementById(key) || document.querySelector(`[data-key="${key}"]`);
    if (el) el.value = data[key];
  });
}

// Auto-save on input
document.addEventListener('input', () => {
  clearTimeout(window._saveTimer);
  window._saveTimer = setTimeout(saveProgress, 500);
});

// Restore on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(restoreProgress, 100);
});


// ── Progreso tracker (global helper para checkAll personalizados) ──
function trackCheckAll(containerId, correct, total) {
  if (window.__tracker && total > 0) {
    window.__tracker.recordExercise(containerId, { correct, total });
  }
}
