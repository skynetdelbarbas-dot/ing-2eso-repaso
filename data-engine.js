/**
 * data-engine.js — Sistema de progreso, tracking y gamificación
 * 
 * Gestiona XP, niveles, streaks, errores, tiempo de estudio e historial
 * de sesiones vía localStorage. No depende de ningún framework.
 * 
 * Uso:
 *   import { ProgressTracker } from './data-engine.js'
 *   const tracker = new ProgressTracker()
 *   tracker.recordExercise('present-simple-quiz', { correct: 8, total: 10 })
 *   tracker.getDashboard()
 * 
 * Convivio con el save/restore de exercises.js sin conflictos
 * (usa namespace 'ing-platform' en localStorage).
 */

const STORAGE_KEY = 'ing-platform'

const XP_TABLE = {
  exercise_correct: 50,     // XP por cada respuesta correcta
  exercise_perfect: 100,    // 100% en un ejercicio
  streak_bonus: 15,         // extra por día de racha
  daily_complete: 75,       // completar el daily challenge
  lesson_done: 50,
  exam_passed: 150,
  badge_earned: 100
}

// Bonus por dificultad
const DIFFICULTY_BONUS = {
  basic: 0,
  intermediate: 25,
  advanced: 50
}

const LEVEL_CURVE = [
  0,      // L1: 0 XP
  200,    // L2: 200 XP
  500,    // L3: 500 XP
  900,    // L4: 900 XP
  1400,   // L5: 1400 XP
  2000,   // L6: 2000 XP
  2700,   // L7: 2700 XP
  3500,   // L8: 3500 XP
  4500,   // L9: 4500 XP
  6000    // L10: 6000 XP
  // A partir de L10: +2000 XP por nivel
]

class ProgressTracker {
  constructor() {
    this._data = this._load()
    this._ensureIntegrity()
  }

  // ── Acceso interno ──

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      console.warn('[data-engine] Error loading progress, starting fresh')
      return null
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data))
    } catch (e) {
      console.warn('[data-engine] Error saving progress:', e)
    }
  }

  _ensureIntegrity() {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)

    if (!this._data) {
      this._data = {
        xp: 0,
        streak: 0,
        lastStudyDate: null,
        totalStudySeconds: 0,
        sessionStart: null,
        currentLevel: 1,
        completed: {},
        errors: [],
        sessions: [],
        badges: [],
        dailyLog: {}
      }
    }

    // Asegurar campos
    if (!this._data.sessions) this._data.sessions = []
    if (!this._data.badges) this._data.badges = []
    if (!this._data.dailyLog) this._data.dailyLog = {}
    if (!this._data.errors) this._data.errors = []
    if (!this._data.completed) this._data.completed = {}
    if (this._data.currentLevel === undefined) this._data.currentLevel = 1

    // Recalcular nivel
    this._data.currentLevel = this._calcLevel(this._data.xp)

    this._save()
  }

  _calcLevel(xp) {
    for (let i = LEVEL_CURVE.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_CURVE[i]) return i + 1
    }
    return 1
  }

  _xpForNextLevel() {
    const lvl = this._data.currentLevel
    if (lvl < LEVEL_CURVE.length) {
      return LEVEL_CURVE[lvl] - this._data.xp
    }
    return (lvl * 2000 + 4000) - this._data.xp // extrapolación
  }

  _todayStr() {
    return new Date().toISOString().slice(0, 10)
  }

  _updateStreak() {
    const today = this._todayStr()
    const last = this._data.lastStudyDate

    if (last === today) return // ya registrado hoy

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    if (last === yesterday) {
      this._data.streak++
    } else if (last !== today) {
      this._data.streak = 1 // racha rota o primera vez
    }

    this._data.lastStudyDate = today

    // Streak bonus: XP extra cuando la racha alcanza hitos
    const streakMilestones = [3, 7, 14, 21, 30, 60, 90]
    if (streakMilestones.includes(this._data.streak)) {
      const bonus = this._data.streak * XP_TABLE.streak_bonus
      this._addXP(bonus, `streak-${this._data.streak}-days`)
    }
  }

  _addXP(amount, reason) {
    if (amount <= 0) return
    this._data.xp += amount
    const newLevel = this._calcLevel(this._data.xp)
    const leveledUp = newLevel > this._data.currentLevel
    this._data.currentLevel = newLevel
    return { xpGained: amount, leveledUp, newLevel }
  }

  _trackError(contentId, userAnswer, correctAnswer) {
    // Busca si ya tenemos este error registrado
    const existing = this._data.errors.find(
      e => e.contentId === contentId && e.answer === userAnswer.toLowerCase().trim()
    )
    if (existing) {
      existing.count++
      existing.lastSeen = new Date().toISOString()
    } else {
      this._data.errors.push({
        contentId,
        answer: userAnswer.toLowerCase().trim(),
        correct: correctAnswer,
        count: 1,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      })
    }
    // Mantener solo los 50 errores más frecuentes
    this._data.errors.sort((a, b) => b.count - a.count)
    if (this._data.errors.length > 50) this._data.errors.length = 50
  }

  // ── API pública ──

  /**
   * Registra un ejercicio completado
   * @param {string} contentId - ID del contenido
   * @param {object} result - { correct: number, total: number, answers?: [{ userAnswer, correctAnswer }] }
   * @returns {object} { xpGained, leveledUp, newLevel, streakActive }
   */
  recordExercise(contentId, result) {
    const { correct, total } = result
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0

    // XP base: 50 por correcta, 100 si es perfecto
    let xp = 0
    if (pct === 100) {
      xp += XP_TABLE.exercise_perfect
    } else if (pct >= 70) {
      xp += Math.round(XP_TABLE.exercise_correct * (correct / total))
    } else {
      xp += Math.round(XP_TABLE.exercise_correct * 0.5 * (correct / total))
    }

    // Bonus por dificultad (si el registro tiene info)
    const diff = result.difficulty || 'basic'
    xp += DIFFICULTY_BONUS[diff] || 0

    // Bonus por racha activa
    if (this._data.streak > 0) {
      xp += XP_TABLE.streak_bonus
    }

    // Actualizar streak
    this._updateStreak()

    // Registrar errores si hay detalle
    if (result.answers) {
      result.answers.forEach(a => {
        if (a.userAnswer && a.correctAnswer && a.userAnswer.trim().toLowerCase() !== a.correctAnswer.trim().toLowerCase()) {
          this._trackError(contentId, a.userAnswer, a.correctAnswer)
        }
      })
    }

    // Marcar contenido como completado
    const prev = this._data.completed[contentId]
    this._data.completed[contentId] = {
      status: pct >= 70 ? 'done' : 'needs-review',
      score: Math.max(prev?.score || 0, pct),
      attempts: (prev?.attempts || 0) + 1,
      lastReview: new Date().toISOString()
    }

    const xpResult = this._addXP(xp, `exercise-${contentId}`)

    // Registrar sesión si es la primera actividad del día
    this._ensureSessionLogged()

    this._save()

    // Otorgar badges automáticamente si se cumplen condiciones
    this._checkAndAwardBadges()

    return {
      xpGained: xp,
      leveledUp: xpResult?.leveledUp || false,
      newLevel: this._data.currentLevel,
      streakActive: this._data.streak,
      score: pct
    }
  }

  /**
   * Inicia/continúa una sesión de estudio
   */
  startSession() {
    if (!this._data.sessionStart) {
      this._data.sessionStart = Date.now()
    }
  }

  /**
   * Finaliza la sesión actual y registra el tiempo
   */
  endSession() {
    if (this._data.sessionStart) {
      const elapsed = Math.round((Date.now() - this._data.sessionStart) / 1000)
      if (elapsed > 10) {
        this._data.totalStudySeconds += elapsed
      }
      this._data.sessionStart = null
      this._save()
    }
  }

  _ensureSessionLogged() {
    // Si pasaron más de 30 min desde la última actividad, es nueva sesión
    const now = Date.now()
    const last = this._data.sessions.length > 0
      ? new Date(this._data.sessions[0].date).getTime()
      : 0
    if (now - last > 30 * 60 * 1000) {
      this._data.sessions.unshift({
        date: new Date().toISOString(),
        duration: 0, // se actualiza al endSession
        xpGained: 0,
        topicsStudied: []
      })
    }
    // Mantener solo últimas 100 sesiones
    if (this._data.sessions.length > 100) this._data.sessions.length = 100
  }

  /**
   * Registra tiempo de estudio manual (ej. un timer)
   * @param {number} seconds 
   */
  addStudyTime(seconds) {
    this._data.totalStudySeconds += seconds
    this._save()
  }

  /**
   * Devuelve los datos del dashboard del alumno
   */
  getDashboard() {
    const now = new Date()
    const today = this._todayStr()

    // Actividad hoy
    const todayXP = this._data.dailyLog[today]?.xp || 0
    const todayExercises = this._data.dailyLog[today]?.exercises || 0

    // Contenido completado
    const totalContent = Object.keys(this._data.completed).length
    const doneContent = Object.values(this._data.completed).filter(c => c.status === 'done').length
    const needsReview = Object.values(this._data.completed).filter(c => c.status === 'needs-review').length

    // Errores frecuentes
    const topErrors = this._data.errors.slice(0, 5)

    // Próximos badges
    const badges = this._getBadgeProgress()

    // XP para siguiente nivel
    const xpForNext = this._xpForNextLevel()

    return {
      xp: this._data.xp,
      level: this._data.currentLevel,
      xpToNextLevel: xpForNext,
      streak: this._data.streak,
      totalStudyMinutes: Math.round(this._data.totalStudySeconds / 60),
      todayXP,
      todayExercises,
      totalContent,
      doneContent,
      needsReview,
      completionPct: totalContent > 0 ? Math.round((doneContent / totalContent) * 100) : 0,
      topErrors,
      badges,
      lastSession: this._data.sessions[0] || null
    }
  }

  /**
   * Devuelve el progreso de un contenido específico
   */
  getContentProgress(contentId) {
    return this._data.completed[contentId] || null
  }

  /**
   * Devuelve IDs de contenido que necesitan repaso
   * (score < 70% o última revisión > 7 días)
   */
  getNeedsReview() {
    const now = Date.now()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    return Object.entries(this._data.completed)
      .filter(([_, c]) => c.status === 'needs-review' || (now - new Date(c.lastReview).getTime() > sevenDays))
      .map(([id, c]) => ({ id, score: c.score, lastReview: c.lastReview }))
      .sort((a, b) => a.score - b.score)
  }

  /**
   * Registra un badge conseguido
   */
  awardBadge(badgeId, badgeTitle) {
    if (this._data.badges.some(b => b.id === badgeId)) return false // ya lo tiene
    this._data.badges.push({
      id: badgeId,
      title: badgeTitle,
      awardedAt: new Date().toISOString()
    })
    this._addXP(XP_TABLE.badge_earned, `badge-${badgeId}`)
    this._save()
    return true
  }

  /**
   * Comprueba todos los badges y otorga los que se hayan ganado
   */
  _checkAndAwardBadges() {
    const earned = new Set(this._data.badges.map(b => b.id))
    const allDefs = this._getBadgeDefs()
    allDefs.forEach(b => {
      if (!earned.has(b.id) && b.check()) {
        this.awardBadge(b.id, b.title)
      }
    })
  }

  _getBadgeDefs() {
    return [
      { id: 'first-exercise', title: 'Primer ejercicio', icon: '🌟', check: () => Object.keys(this._data.completed).length >= 1 },
      { id: 'streak-3', title: '3 días seguidos', icon: '🔥', check: () => this._data.streak >= 3 },
      { id: 'streak-7', title: '¡Una semana!', icon: '🔥', check: () => this._data.streak >= 7 },
      { id: 'streak-30', title: 'Super racha', icon: '💪', check: () => this._data.streak >= 30 },
      { id: 'perfect-10', title: '10 ejercicios perfectos', icon: '🏆', check: () => Object.values(this._data.completed).filter(c => c.score === 100).length >= 10 },
      { id: 'level-5', title: 'Nivel 5', icon: '⭐', check: () => this._data.currentLevel >= 5 },
      { id: 'level-10', title: 'Nivel 10', icon: '👑', check: () => this._data.currentLevel >= 10 },
      { id: 'vocab-master', title: 'Vocabulario 100%', icon: '📚', check: () => {
        const vocabItems = Object.entries(this._data.completed).filter(([id]) => id.startsWith('vocab-'))
        return vocabItems.length > 0 && vocabItems.every(([_, c]) => c.status === 'done')
      }},
      { id: 'grammar-guru', title: 'Gramática completa', icon: '🧠', check: () => {
        const gramItems = Object.entries(this._data.completed).filter(([id]) => id.startsWith('grammar-'))
        return gramItems.length >= 5 && gramItems.every(([_, c]) => c.status === 'done')
      }},
      { id: 'exam-ready', title: 'Listo para el examen', icon: '🎯', check: () => {
        const examItems = Object.entries(this._data.completed).filter(([id]) => id.startsWith('exam-'))
        return examItems.length >= 3 && examItems.every(([_, c]) => c.score >= 80)
      }},
      { id: 'all-rounder', title: '4 skills diferentes', icon: '🎭', check: () => {
        const skills = new Set(Object.keys(this._data.completed).map(id => id.split('-')[0]))
        return skills.size >= 4
      }}
    ]
  }

  _getBadgeProgress() {
    const badges = this._getBadgeDefs()

    const earned = new Set(this._data.badges.map(b => b.id))

    return {
      earned: this._data.badges,
      next: badges.filter(b => !earned.has(b.id) && b.check())
        .slice(0, 3),
      all: badges.map(b => ({
        ...b,
        earned: earned.has(b.id)
      }))
    }
  }

  /**
   * Resetea todo el progreso (con confirmación implícita)
   */
  resetAll() {
    localStorage.removeItem(STORAGE_KEY)
    this._data = null
    this._ensureIntegrity()
    this._save()
  }

  /**
   * Exporta datos completos para backup o sincronización
   */
  exportData() {
    return JSON.parse(JSON.stringify(this._data))
  }

  /**
   * Importa datos desde backup
   */
  importData(data) {
    this._data = data
    this._ensureIntegrity()
    this._save()
  }
}

// ── Inicialización automática silenciosa ──
// Expone una instancia global para que el HTML existente pueda usarla sin imports
(function() {
  try {
    window.__tracker = new ProgressTracker()
    window.__tracker.startSession()

    // Registrar cuando el usuario cierra/recarga
    window.addEventListener('beforeunload', () => {
      if (window.__tracker) window.__tracker.endSession()
    })

    // En SPA, detectar cambios de vista
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.__tracker.endSession()
      } else {
        window.__tracker.startSession()
      }
    })

    // ── Inactividad: corta sesión tras 5 min sin interacción ──
    var inactivityTimer = null;
    var INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 min
    function resetInactivity() {
      clearTimeout(inactivityTimer);
      if (window.__tracker) {
        // Si no hay sesión activa y la página está visible, reanudar
        if (!window.__tracker._data.sessionStart && !document.hidden) {
          window.__tracker.startSession()
        }
      }
      inactivityTimer = setTimeout(function() {
        if (window.__tracker) window.__tracker.endSession()
      }, INACTIVITY_LIMIT);
    }
    document.addEventListener('click', resetInactivity);
    document.addEventListener('keydown', resetInactivity);
    document.addEventListener('mousemove', resetInactivity);
    document.addEventListener('touchstart', resetInactivity);
    resetInactivity();

    // Guardar tiempo de estudio cada 15s (solo si página visible)
    setInterval(function() {
      if (window.__tracker && !document.hidden) {
        window.__tracker.endSession()
        window.__tracker.startSession()
      }
      // Actualizar el tiempo en el dashboard si está visible
      var dashTime = document.getElementById('dash-time');
      if (dashTime && window.__tracker) {
        var mins = window.__tracker.getDashboard().totalStudyMinutes;
        dashTime.textContent = mins + 'm';
      }
    }, 15000)
  } catch (e) {
    console.warn('[data-engine] Init error:', e)
  }
})()

export { ProgressTracker }
