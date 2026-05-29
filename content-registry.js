/**
 * content-registry.js — Catálogo centralizado de contenido
 * 
 * Mapea IDs de contenido a sus archivos fuente, metadatos y relaciones.
 * Es el punto único de registro: todo contenido nuevo se añade aquí.
 * 
 * Uso:
 *   import { ContentRegistry } from './content-registry.js'
 *   const reg = new ContentRegistry()
 *   reg.get('present-simple')        // → metadata del contenido
 *   reg.filter({ level: 'A1', skill: 'grammar' })  // → contenidos filtrados
 *   reg.getPath('a2-grammar')        // → IDs de contenidos en esa ruta
 */

const CONTENT_BASE = 'content'

// ── Definición centralizada de todo el contenido ──
// Cada entrada: id → { file, metadata }
// metadata sigue el content-schema.json

const CONTENT_INDEX = {
  // ── FUNDAMENTOS ──
  'verb-to-be': {
    file: `${CONTENT_BASE}/grammar/verb-to-be.json`,
    metadata: {
      title: 'Verb To Be',
      title_short: 'To Be',
      level: ['A1'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '🔤',
      depends_on: [],
      unlocks: ['subject-pronouns', 'present-simple'],
      tags: ['affirmative', 'negative', 'questions', 'short-answers'],
      estimated_minutes: 25
    }
  },
  'subject-pronouns': {
    file: `${CONTENT_BASE}/grammar/subject-pronouns.json`,
    metadata: {
      title: 'Subject Pronouns',
      title_short: 'Pronouns I',
      level: ['A1'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '👤',
      depends_on: ['verb-to-be'],
      unlocks: ['object-pronouns', 'possessives'],
      tags: ['I', 'you', 'he', 'she', 'it', 'we', 'they'],
      estimated_minutes: 15
    }
  },
  'object-pronouns': {
    file: `${CONTENT_BASE}/grammar/object-pronouns.json`,
    metadata: {
      title: 'Object Pronouns',
      title_short: 'Pronouns II',
      level: ['A1'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '👥',
      depends_on: ['subject-pronouns'],
      unlocks: ['present-simple'],
      tags: ['me', 'him', 'her', 'us', 'them'],
      estimated_minutes: 15
    }
  },
  'possessives': {
    file: `${CONTENT_BASE}/grammar/possessives.json`,
    metadata: {
      title: 'Possessive Adjectives & Pronouns',
      title_short: 'Possessives',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '📌',
      depends_on: ['subject-pronouns'],
      unlocks: ['present-simple'],
      tags: ['my', 'mine', 'your', 'yours', 'his', 'her', 'its'],
      estimated_minutes: 20
    }
  },
  'present-simple': {
    file: `${CONTENT_BASE}/grammar/present-simple.json`,
    metadata: {
      title: 'Present Simple',
      title_short: 'Present Simple',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '📖',
      depends_on: ['verb-to-be', 'subject-pronouns'],
      unlocks: ['present-continuous', 'frequency-adverbs', 'past-simple'],
      tags: ['routines', 'daily-life', 'affirmative', 'negative', 'questions', '3rd-person'],
      estimated_minutes: 30
    }
  },
  'present-continuous': {
    file: `${CONTENT_BASE}/grammar/present-continuous.json`,
    metadata: {
      title: 'Present Continuous',
      title_short: 'Present Continuous',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '⏳',
      depends_on: ['present-simple'],
      unlocks: ['past-continuous'],
      tags: ['now', 'ing', 'actions-happening', 'vs-present-simple'],
      estimated_minutes: 25
    }
  },
  'past-simple': {
    file: `${CONTENT_BASE}/grammar/past-simple.json`,
    metadata: {
      title: 'Past Simple',
      title_short: 'Past Simple',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '⏪',
      depends_on: ['present-simple'],
      unlocks: ['past-continuous', 'used-to', 'irregular-verbs'],
      tags: ['regular-verbs', 'irregular-verbs', '-ed', 'questions', 'negatives', 'yesterday'],
      estimated_minutes: 30
    }
  },
  'frequency-adverbs': {
    file: `${CONTENT_BASE}/grammar/frequency-adverbs.json`,
    metadata: {
      title: 'Frequency Adverbs',
      title_short: 'Adverbs',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '🔄',
      depends_on: ['present-simple'],
      unlocks: [],
      tags: ['always', 'usually', 'sometimes', 'never', 'often', 'rarely'],
      estimated_minutes: 15
    }
  },
  'there-is-there-are': {
    file: `${CONTENT_BASE}/grammar/there-is-there-are.json`,
    metadata: {
      title: 'There is / There are',
      title_short: 'There is/are',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '📍',
      depends_on: ['verb-to-be'],
      unlocks: ['quantifiers'],
      tags: ['existencia', 'hay', 'singular', 'plural'],
      estimated_minutes: 15
    }
  },
  'quantifiers': {
    file: `${CONTENT_BASE}/grammar/quantifiers.json`,
    metadata: {
      title: 'Quantifiers',
      title_short: 'Quantifiers',
      level: ['A1', 'A2'],
      stage: ['ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '🔢',
      depends_on: ['there-is-there-are'],
      unlocks: [],
      tags: ['much', 'many', 'some', 'any', 'a-lot-of', 'few', 'little'],
      estimated_minutes: 20
    }
  },
  'prepositions': {
    file: `${CONTENT_BASE}/grammar/prepositions.json`,
    metadata: {
      title: 'Prepositions',
      title_short: 'Prepositions',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '🗺️',
      depends_on: [],
      unlocks: [],
      tags: ['time', 'place', 'movement', 'at', 'on', 'in', 'behind', 'next-to', 'into'],
      estimated_minutes: 25
    }
  },
  'basic-connectors': {
    file: `${CONTENT_BASE}/grammar/basic-connectors.json`,
    metadata: {
      title: 'Basic Connectors',
      title_short: 'Connectors',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '🔗',
      depends_on: ['present-simple'],
      unlocks: ['linking-words'],
      tags: ['and', 'but', 'because', 'although', 'however'],
      estimated_minutes: 15
    }
  },

  // ── GRAMMAR (avanzado) ──
  'modal-verbs': {
    file: `${CONTENT_BASE}/grammar/modal-verbs.json`,
    metadata: {
      title: 'Modal Verbs',
      title_short: 'Modals',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '⚠️',
      depends_on: ['present-simple'],
      unlocks: [],
      tags: ['can', 'must', 'should', 'have-to', 'may', 'might'],
      estimated_minutes: 30
    }
  },
  'past-continuous': {
    file: `${CONTENT_BASE}/grammar/past-continuous.json`,
    metadata: {
      title: 'Past Continuous',
      title_short: 'Past Continuous',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '⏮️',
      depends_on: ['past-simple', 'present-continuous'],
      unlocks: ['used-to'],
      tags: ['while', 'when', 'interrupted', 'was-were-ing'],
      estimated_minutes: 25
    }
  },
  'used-to': {
    file: `${CONTENT_BASE}/grammar/used-to.json`,
    metadata: {
      title: 'Used To',
      title_short: 'Used To',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '🕰️',
      depends_on: ['past-simple'],
      unlocks: [],
      tags: ['past-habits', 'past-states', 'no-longer'],
      estimated_minutes: 15
    }
  },
  'future-tenses': {
    file: `${CONTENT_BASE}/grammar/future-tenses.json`,
    metadata: {
      title: 'Future Tenses',
      title_short: 'Future',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '🔮',
      depends_on: ['present-simple', 'present-continuous'],
      unlocks: ['conditionals'],
      tags: ['will', 'going-to', 'present-continuous-future', 'shall'],
      estimated_minutes: 30
    }
  },
  'comparatives': {
    file: `${CONTENT_BASE}/grammar/comparatives.json`,
    metadata: {
      title: 'Comparatives & Superlatives',
      title_short: 'Comparatives',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '📊',
      depends_on: ['present-simple'],
      unlocks: [],
      tags: ['comparative', 'superlative', 'as-as', 'than', 'the-most'],
      estimated_minutes: 25
    }
  },
  'present-perfect': {
    file: `${CONTENT_BASE}/grammar/present-perfect.json`,
    metadata: {
      title: 'Present Perfect Simple & Continuous',
      title_short: 'Present Perfect',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '⏳',
      depends_on: ['past-simple', 'irregular-verbs'],
      unlocks: ['conditionals'],
      tags: ['ever', 'never', 'just', 'already', 'yet', 'for', 'since'],
      estimated_minutes: 30
    }
  },
  'conditionals': {
    file: `${CONTENT_BASE}/grammar/conditionals.json`,
    metadata: {
      title: 'Conditionals',
      title_short: 'Conditionals',
      level: ['B1', 'B2'],
      stage: ['ESO-3', 'ESO-4'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '🔀',
      depends_on: ['present-simple', 'past-simple', 'future-tenses'],
      unlocks: ['mixed-conditionals', 'wish-if-only'],
      tags: ['zero', 'first', 'second', 'third', 'if', 'unless'],
      estimated_minutes: 35
    }
  },
  'wish-if-only': {
    file: `${CONTENT_BASE}/grammar/wish-if-only.json`,
    metadata: {
      title: 'I wish / If only',
      title_short: 'Wish',
      level: ['B1', 'B2'],
      stage: ['ESO-3', 'ESO-4'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '💭',
      depends_on: ['conditionals', 'past-simple'],
      unlocks: [],
      tags: ['wishes', 'regrets', 'hypothetical'],
      estimated_minutes: 20
    }
  },
  'reported-speech': {
    file: `${CONTENT_BASE}/grammar/reported-speech.json`,
    metadata: {
      title: 'Reported Speech',
      title_short: 'Reported Sp.',
      level: ['B1', 'B2'],
      stage: ['ESO-3', 'ESO-4'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '🗣️',
      depends_on: ['past-simple', 'present-perfect'],
      unlocks: [],
      tags: ['say', 'tell', 'asked', 'reported-questions', 'backshift'],
      estimated_minutes: 30
    }
  },
  'passive-voice': {
    file: `${CONTENT_BASE}/grammar/passive-voice.json`,
    metadata: {
      title: 'Passive Voice',
      title_short: 'Passive',
      level: ['B1', 'B2'],
      stage: ['ESO-3', 'ESO-4'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '🔄',
      depends_on: ['past-simple', 'present-perfect'],
      unlocks: ['advanced-passive'],
      tags: ['be-past-participle', 'by-agent', 'present-passive', 'past-passive'],
      estimated_minutes: 30
    }
  },
  'question-tags': {
    file: `${CONTENT_BASE}/grammar/question-tags.json`,
    metadata: {
      title: 'Question Tags',
      title_short: 'Q. Tags',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '❓',
      depends_on: ['present-simple', 'past-simple', 'verb-to-be'],
      unlocks: [],
      tags: ['tags', 'confirmation', "isn-it", "don't-you"],
      estimated_minutes: 15
    }
  },
  'articles': {
    file: `${CONTENT_BASE}/grammar/articles.json`,
    metadata: {
      title: 'Articles (a/an/the/∅)',
      title_short: 'Articles',
      level: ['A1', 'A2', 'B1'],
      stage: ['ESO-1', 'ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'basic',
      type: 'theory',
      icon: '📝',
      depends_on: [],
      unlocks: [],
      tags: ['a', 'an', 'the', 'zero-article', 'definite', 'indefinite'],
      estimated_minutes: 25
    }
  },
  'indefinite-pronouns': {
    file: `${CONTENT_BASE}/grammar/indefinite-pronouns.json`,
    metadata: {
      title: 'Indefinite Pronouns',
      title_short: 'Indef. Pronouns',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '❔',
      depends_on: [],
      unlocks: [],
      tags: ['somebody', 'anyone', 'nothing', 'everywhere', 'compounds'],
      estimated_minutes: 15
    }
  },
  'nor-neither-so': {
    file: `${CONTENT_BASE}/grammar/nor-neither-so.json`,
    metadata: {
      title: 'Nor / Neither / So',
      title_short: 'Nor/Neither/So',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '➕',
      depends_on: ['present-simple', 'verb-to-be', 'auxiliaries'],
      unlocks: [],
      tags: ['agreement', 'so-do-I', 'neither-do-I', 'me-too'],
      estimated_minutes: 20
    }
  },
  'gerunds-infinitives': {
    file: `${CONTENT_BASE}/grammar/gerunds-infinitives.json`,
    metadata: {
      title: 'Gerunds & Infinitives',
      title_short: 'Gerund/Inf.',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '🏃',
      depends_on: ['present-simple'],
      unlocks: [],
      tags: ['like-doing', 'want-to-do', 'enjoy', 'decide-to', 'stop-ing'],
      estimated_minutes: 25
    }
  },
  'relative-clauses': {
    file: `${CONTENT_BASE}/grammar/relative-clauses.json`,
    metadata: {
      title: 'Relative Clauses',
      title_short: 'Rel. Clauses',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '🔗',
      depends_on: ['present-simple'],
      unlocks: [],
      tags: ['who', 'which', 'where', 'that', 'whose', 'whom'],
      estimated_minutes: 25
    }
  },
  'linking-words': {
    file: `${CONTENT_BASE}/grammar/linking-words.json`,
    metadata: {
      title: 'Linking Words',
      title_short: 'Linking',
      level: ['B1', 'B2'],
      stage: ['ESO-3', 'ESO-4'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '🧩',
      depends_on: ['basic-connectors'],
      unlocks: [],
      tags: ['firstly', 'moreover', 'however', 'therefore', 'in-conclusion', 'furthermore'],
      estimated_minutes: 20
    }
  },
  'phrasal-verbs': {
    file: `${CONTENT_BASE}/grammar/phrasal-verbs.json`,
    metadata: {
      title: 'Phrasal Verbs',
      title_short: 'Phrasal Verbs',
      level: ['B1', 'B2'],
      stage: ['ESO-3', 'ESO-4'],
      skill: 'grammar',
      difficulty: 'intermediate',
      type: 'theory',
      icon: '🔀',
      depends_on: ['past-simple'],
      unlocks: [],
      tags: ['get-up', 'turn-on', 'look-after', 'give-up', 'separables', 'inseparables'],
      estimated_minutes: 25
    }
  },

  // ── IRREGULAR VERBS ──
  'irregular-verbs': {
    file: `${CONTENT_BASE}/grammar/irregular-verbs.json`,
    metadata: {
      title: 'Irregular Verbs',
      title_short: 'Irreg. Verbs',
      level: ['A1', 'A2', 'B1'],
      stage: ['ESO-1', 'ESO-2', 'ESO-3'],
      skill: 'grammar',
      secondarySkills: ['vocabulary'],
      difficulty: 'intermediate',
      type: 'reference',
      icon: '📋',
      depends_on: ['past-simple'],
      unlocks: ['present-perfect', 'passive-voice'],
      tags: ['infinitive', 'past', 'participle', 'basic', 'frequent', 'advanced'],
      estimated_minutes: 45
    }
  },
  'irregular-verbs-flashcards': {
    file: `${CONTENT_BASE}/practice/irregular-verbs-flashcards.json`,
    metadata: {
      title: 'Irregular Verbs — Flashcards',
      title_short: 'Flashcards',
      level: ['A1', 'A2', 'B1'],
      stage: ['ESO-1', 'ESO-2', 'ESO-3'],
      skill: 'grammar',
      secondarySkills: ['vocabulary'],
      difficulty: 'basic',
      type: 'practice',
      icon: '🃏',
      depends_on: ['irregular-verbs'],
      unlocks: [],
      tags: ['self-study', 'memorization'],
      estimated_minutes: 10
    }
  },
  'irregular-verbs-typing': {
    file: `${CONTENT_BASE}/practice/irregular-verbs-typing.json`,
    metadata: {
      title: 'Irregular Verbs — Typing Challenge',
      title_short: 'Typing',
      level: ['A1', 'A2', 'B1'],
      stage: ['ESO-1', 'ESO-2', 'ESO-3'],
      skill: 'grammar',
      secondarySkills: ['vocabulary'],
      difficulty: 'intermediate',
      type: 'quiz',
      icon: '⌨️',
      depends_on: ['irregular-verbs'],
      unlocks: [],
      tags: ['active-recall', 'typing', 'speed'],
      estimated_minutes: 10
    }
  },

  // ── VOCABULARY HUB ──
  'vocab-travel': {
    file: `${CONTENT_BASE}/vocabulary/travel.json`,
    metadata: {
      title: 'Vocabulary — Travel',
      title_short: 'Travel',
      level: ['A1', 'A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'vocabulary',
      difficulty: 'basic',
      type: 'reference',
      icon: '✈️',
      depends_on: [],
      unlocks: [],
      tags: ['transport', 'hotel', 'airport', 'directions', 'holiday'],
      estimated_minutes: 20
    }
  },
  'vocab-food': {
    file: `${CONTENT_BASE}/vocabulary/food.json`,
    metadata: {
      title: 'Vocabulary — Food',
      title_short: 'Food',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'vocabulary',
      difficulty: 'basic',
      type: 'reference',
      icon: '🍽️',
      depends_on: [],
      unlocks: [],
      tags: ['meals', 'ingredients', 'restaurant', 'cooking'],
      estimated_minutes: 15
    }
  },
  'vocab-school': {
    file: `${CONTENT_BASE}/vocabulary/school.json`,
    metadata: {
      title: 'Vocabulary — School',
      title_short: 'School',
      level: ['A1', 'A2'],
      stage: ['ESO-1', 'ESO-2'],
      skill: 'vocabulary',
      difficulty: 'basic',
      type: 'reference',
      icon: '🎒',
      depends_on: [],
      unlocks: [],
      tags: ['subjects', 'classroom', 'objects', 'teachers'],
      estimated_minutes: 15
    }
  },
  'vocab-technology': {
    file: `${CONTENT_BASE}/vocabulary/technology.json`,
    metadata: {
      title: 'Vocabulary — Technology',
      title_short: 'Technology',
      level: ['A2', 'B1', 'B2'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'vocabulary',
      difficulty: 'intermediate',
      type: 'reference',
      icon: '💻',
      depends_on: [],
      unlocks: [],
      tags: ['computer', 'internet', 'devices', 'software'],
      estimated_minutes: 15
    }
  },
  'vocab-environment': {
    file: `${CONTENT_BASE}/vocabulary/environment.json`,
    metadata: {
      title: 'Vocabulary — Environment',
      title_short: 'Environment',
      level: ['A2', 'B1', 'B2'],
      stage: ['ESO-3', 'ESO-4'],
      skill: 'vocabulary',
      difficulty: 'intermediate',
      type: 'reference',
      icon: '🌍',
      depends_on: [],
      unlocks: [],
      tags: ['nature', 'climate', 'recycling', 'animals', 'pollution'],
      estimated_minutes: 20
    }
  },
  'vocab-jobs': {
    file: `${CONTENT_BASE}/vocabulary/jobs.json`,
    metadata: {
      title: 'Vocabulary — Jobs',
      title_short: 'Jobs',
      level: ['A1', 'A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'vocabulary',
      difficulty: 'basic',
      type: 'reference',
      icon: '💼',
      depends_on: [],
      unlocks: [],
      tags: ['professions', 'workplace', 'job-interview'],
      estimated_minutes: 15
    }
  },

  // ── WRITING ──
  'writing-templates-a2': {
    file: `${CONTENT_BASE}/writing/templates-a2.json`,
    metadata: {
      title: 'Writing Templates — A2',
      title_short: 'Templates A2',
      level: ['A2'],
      stage: ['ESO-2'],
      skill: 'writing',
      difficulty: 'basic',
      type: 'template',
      icon: '📝',
      depends_on: [],
      unlocks: ['writing-templates-b1'],
      tags: ['email', 'story', 'description', 'blog'],
      estimated_minutes: 20
    }
  },
  'writing-common-mistakes': {
    file: `${CONTENT_BASE}/writing/common-mistakes.json`,
    metadata: {
      title: 'Common Writing Mistakes',
      title_short: 'Common Mistakes',
      level: ['A2', 'B1', 'B2'],
      stage: ['ESO-2', 'ESO-3', 'ESO-4'],
      skill: 'writing',
      difficulty: 'basic',
      type: 'reference',
      icon: '⚠️',
      depends_on: [],
      unlocks: [],
      tags: ['people-is', 'i-have-15-years', 'more-easier', 'depends-of', 'false-friends'],
      estimated_minutes: 15
    }
  },

  // ── READING ──
  'reading-strategies': {
    file: `${CONTENT_BASE}/reading/strategies.json`,
    metadata: {
      title: 'Reading Strategies',
      title_short: 'Strategies',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'reading',
      difficulty: 'basic',
      type: 'theory',
      icon: '📖',
      depends_on: [],
      unlocks: [],
      tags: ['skimming', 'scanning', 'keywords', 'distractors'],
      estimated_minutes: 15
    }
  },
  'reading-practice-a2': {
    file: `${CONTENT_BASE}/reading/practice-a2.json`,
    metadata: {
      title: 'Reading Practice — A2',
      title_short: 'Reading A2',
      level: ['A2'],
      stage: ['ESO-2'],
      skill: 'reading',
      difficulty: 'basic',
      type: 'practice',
      icon: '📖',
      depends_on: ['reading-strategies'],
      unlocks: ['reading-practice-b1'],
      tags: ['emails', 'articles', 'stories', 'notices'],
      estimated_minutes: 25
    }
  },

  // ── LISTENING ──
  'listening-strategies': {
    file: `${CONTENT_BASE}/listening/strategies.json`,
    metadata: {
      title: 'Listening Strategies',
      title_short: 'Strategies',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'listening',
      difficulty: 'basic',
      type: 'theory',
      icon: '🎧',
      depends_on: [],
      unlocks: [],
      tags: ['predict', 'gist', 'details', 'inference'],
      estimated_minutes: 15
    }
  },
  'listening-accent-training': {
    file: `${CONTENT_BASE}/listening/accent-training.json`,
    metadata: {
      title: 'Accent Training',
      title_short: 'Accents',
      level: ['A2', 'B1', 'B2'],
      stage: ['ESO-3', 'ESO-4'],
      skill: 'listening',
      difficulty: 'intermediate',
      type: 'practice',
      icon: '🗣️',
      depends_on: ['listening-strategies'],
      unlocks: [],
      tags: ['british', 'american', 'australian', 'pronunciation'],
      estimated_minutes: 20
    }
  },

  // ── PRONUNCIATION ──
  'pronunciation-th': {
    file: `${CONTENT_BASE}/pronunciation/th-sounds.json`,
    metadata: {
      title: 'Pronunciation — TH Sounds',
      title_short: 'TH Sounds',
      level: ['A1', 'A2', 'B1'],
      stage: ['ESO-1', 'ESO-2', 'ESO-3'],
      skill: 'pronunciation',
      difficulty: 'basic',
      type: 'theory',
      icon: '🔊',
      depends_on: [],
      unlocks: ['pronunciation-ed'],
      tags: ['voiceless', 'voiced', 'θ', 'ð', 'minimal-pairs'],
      estimated_minutes: 15
    }
  },
  'pronunciation-ed': {
    file: `${CONTENT_BASE}/pronunciation/ed-endings.json`,
    metadata: {
      title: 'Pronunciation — ED Endings',
      title_short: 'ED Endings',
      level: ['A1', 'A2', 'B1'],
      stage: ['ESO-1', 'ESO-2', 'ESO-3'],
      skill: 'pronunciation',
      difficulty: 'basic',
      type: 'theory',
      icon: '🔊',
      depends_on: ['pronunciation-th'],
      unlocks: [],
      tags: ['/t/', '/d/', '/id/', 'past-verbs', 'regular-verbs'],
      estimated_minutes: 15
    }
  },

  // ── SPEAKING ──
  'speaking-roleplay-restaurant': {
    file: `${CONTENT_BASE}/speaking/roleplay-restaurant.json`,
    metadata: {
      title: 'Speaking — Restaurant Roleplay',
      title_short: 'Restaurant',
      level: ['A2', 'B1'],
      stage: ['ESO-2', 'ESO-3'],
      skill: 'speaking',
      difficulty: 'basic',
      type: 'practice',
      icon: '🍕',
      depends_on: [],
      unlocks: [],
      tags: ['ordering', 'polite-requests', 'menu', 'dialogues'],
      estimated_minutes: 15
    }
  },
  'speaking-conversation-prompts': {
    file: `${CONTENT_BASE}/speaking/conversation-prompts.json`,
    metadata: {
      title: 'Conversation Prompts',
      title_short: 'Conversation',
      level: ['A2', 'B1', 'B2'],
      stage: ['ESO-2', 'ESO-3', 'ESO-4'],
      skill: 'speaking',
      difficulty: 'intermediate',
      type: 'practice',
      icon: '💬',
      depends_on: [],
      unlocks: [],
      tags: ['topics', 'questions', 'discussion', 'pair-work'],
      estimated_minutes: 20
    }
  },

  // ── CAMBRIDGE A2 ──
  'cambridge-a2-structure': {
    file: `${CONTENT_BASE}/exams/cambridge-a2-structure.json`,
    metadata: {
      title: 'Cambridge A2 Key — Structure',
      title_short: 'Exam Structure',
      level: ['A2'],
      stage: ['ESO-2'],
      skill: 'reading',
      secondarySkills: ['writing', 'listening', 'speaking'],
      difficulty: 'intermediate',
      type: 'exam',
      icon: '🎓',
      depends_on: [],
      unlocks: [],
      tags: ['reading-writing', 'listening', 'speaking', 'time', 'parts'],
      estimated_minutes: 20
    }
  },
  'cambridge-a2-speaking-sim': {
    file: `${CONTENT_BASE}/exams/cambridge-a2-speaking-sim.json`,
    metadata: {
      title: 'Cambridge A2 — Speaking Simulator',
      title_short: 'Speaking Sim',
      level: ['A2'],
      stage: ['ESO-2'],
      skill: 'speaking',
      difficulty: 'intermediate',
      type: 'exam',
      icon: '🎙️',
      depends_on: ['cambridge-a2-structure'],
      unlocks: [],
      tags: ['introductions', 'visual-prompts', 'qa'],
      estimated_minutes: 15
    }
  }
}

// ── RUTAS DE APRENDIZAJE ──

const LEARNING_PATHS = {
  'beginner': {
    id: 'beginner',
    title: '🌟 Beginner Path',
    description: 'Desde cero hasta A1 sólido',
    level_range: 'A1',
    icon: '🌱',
    nodes: [
      'verb-to-be', 'subject-pronouns', 'object-pronouns', 'possessives',
      'present-simple', 'frequency-adverbs', 'articles',
      'there-is-there-are', 'quantifiers', 'prepositions',
      'basic-connectors', 'pronunciation-th', 'pronunciation-ed'
    ]
  },
  'eso-2': {
    id: 'eso-2',
    title: '📚 2º ESO Path',
    description: 'Currículo completo de 2º de ESO',
    level_range: 'A1-A2',
    icon: '📖',
    nodes: [
      'verb-to-be', 'subject-pronouns', 'possessives', 'present-simple',
      'present-continuous', 'frequency-adverbs', 'past-simple',
      'past-continuous', 'irregular-verbs', 'future-tenses',
      'comparatives', 'present-perfect', 'modal-verbs',
      'there-is-there-are', 'quantifiers', 'prepositions',
      'articles', 'question-tags', 'basic-connectors',
      'gerunds-infinitives', 'relative-clauses'
    ]
  },
  'cambridge-a2': {
    id: 'cambridge-a2',
    title: '🎓 Cambridge A2 Key Path',
    description: 'Prepárate para el examen oficial',
    level_range: 'A2',
    icon: '🎯',
    nodes: [
      'cambridge-a2-structure', 'writing-templates-a2',
      'reading-practice-a2', 'listening-strategies',
      'cambridge-a2-speaking-sim', 'vocab-travel',
      'vocab-food', 'vocab-school', 'vocab-jobs',
      'writing-common-mistakes'
    ]
  },
  'grammar-survival': {
    id: 'grammar-survival',
    title: '🛡️ Grammar Survival Path',
    description: 'Los temas imprescindibles para sobrevivir',
    level_range: 'A1-B1',
    icon: '🛡️',
    nodes: [
      'verb-to-be', 'present-simple', 'present-continuous',
      'past-simple', 'past-continuous', 'future-tenses',
      'present-perfect', 'modal-verbs', 'conditionals',
      'passive-voice', 'reported-speech'
    ]
  },
  'exam-prep': {
    id: 'exam-prep',
    title: '📝 Exam Preparation Path',
    description: 'Enfocado en técnicas y práctica de examen',
    level_range: 'A2-B1',
    icon: '📋',
    nodes: [
      'writing-templates-a2', 'writing-common-mistakes',
      'reading-strategies', 'reading-practice-a2',
      'listening-strategies', 'listening-accent-training',
      'cambridge-a2-structure', 'cambridge-a2-speaking-sim'
    ]
  },
  'intensive-review': {
    id: 'intensive-review',
    title: '⚡ Intensive Review Path',
    description: 'Repaso rápido de todo lo esencial',
    level_range: 'A1-B1',
    icon: '⚡',
    nodes: [
      'verb-to-be', 'present-simple', 'past-simple',
      'present-perfect', 'future-tenses', 'conditionals',
      'passive-voice', 'reported-speech', 'modal-verbs',
      'irregular-verbs', 'comparatives', 'relative-clauses'
    ]
  }
}

class ContentRegistry {
  constructor() {
    this._index = CONTENT_INDEX
    this._paths = LEARNING_PATHS
  }

  /**
   * Obtiene metadatos de un contenido por su ID
   */
  get(id) {
    const entry = this._index[id]
    if (!entry) return null
    return {
      id,
      ...entry.metadata
    }
  }

  /**
   * Obtiene la ruta del archivo de contenido
   */
  getFile(id) {
    return this._index[id]?.file || null
  }

  /**
   * Filtra contenido por criterios
   * @param {object} filters - { level, skill, difficulty, type, stage, tag }
   */
  filter(filters = {}) {
    let results = Object.entries(this._index)

    if (filters.level) {
      results = results.filter(([_, e]) => e.metadata.level.includes(filters.level))
    }
    if (filters.skill) {
      results = results.filter(([_, e]) => e.metadata.skill === filters.skill)
    }
    if (filters.difficulty) {
      results = results.filter(([_, e]) => e.metadata.difficulty === filters.difficulty)
    }
    if (filters.type) {
      results = results.filter(([_, e]) => e.metadata.type === filters.type)
    }
    if (filters.stage) {
      results = results.filter(([_, e]) => e.metadata.stage?.includes(filters.stage))
    }
    if (filters.tag) {
      results = results.filter(([_, e]) => e.metadata.tags?.includes(filters.tag))
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(([_, e]) =>
        e.metadata.title.toLowerCase().includes(q) ||
        e.metadata.tags?.some(t => t.toLowerCase().includes(q))
      )
    }

    return results.map(([id, e]) => ({
      id,
      ...e.metadata
    }))
  }

  /**
   * Devuelve todos los contenidos (para catálogo completo)
   */
  getAll() {
    return Object.entries(this._index).map(([id, e]) => ({
      id,
      ...e.metadata
    }))
  }

  /**
   * Obtiene una ruta de aprendizaje completa
   */
  getPath(pathId) {
    const path = this._paths[pathId]
    if (!path) return null
    return {
      ...path,
      contents: path.nodes.map(id => this.get(id)).filter(Boolean)
    }
  }

  /**
   * Obtiene todas las rutas de aprendizaje
   */
  getAllPaths() {
    return Object.values(this._paths)
  }

  /**
   * Calcula el progreso en una ruta
   * @param {ProgressTracker} tracker - instancia del tracker
   * @param {string} pathId - ID de la ruta
   */
  getPathProgress(tracker, pathId) {
    const path = this._paths[pathId]
    if (!path || !tracker) return null

    const results = path.nodes.map(id => {
      const content = this.get(id)
      const progress = tracker.getContentProgress(id)
      return { id, title: content?.title || id, progress }
    })

    const done = results.filter(r => r.progress?.status === 'done').length
    const total = results.length

    return {
      pathId,
      title: path.title,
      total,
      done,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      items: results
    }
  }

  /**
   * Devuelve contenidos desbloqueables dado un set de IDs completados
   * @param {string[]} completedIds - IDs de contenido ya completados
   */
  getUnlocked(completedIds = []) {
    const completed = new Set(completedIds)
    return Object.entries(this._index)
      .filter(([id, e]) => {
        if (completed.has(id)) return false
        const deps = e.metadata.depends_on || []
        return deps.every(d => completed.has(d))
      })
      .map(([id, e]) => ({ id, ...e.metadata }))
  }
}

// Export para módulos y global para scripts inline
window.__registry = new ContentRegistry()

export { ContentRegistry }
