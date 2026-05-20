import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/composables/useApi'

const LEVEL_TITLES = [
  '', 'Beginner', 'Student', 'Apprentice', 'Learner', 'Practitioner',
  'Intermediate', 'Advanced', 'Expert', 'Master', 'Sensei'
]

export const useProgressStore = defineStore('progress', () => {
  const xp = ref(0)
  const level = ref(1)
  const streak = ref(0)
  const lastPlayedDate = ref(null)
  const quizHistory = ref([])
  const characterStats = ref({})
  const flashcardKnown = ref([])
  const favoritedKanji = ref([])
  const favoritedVocabulary = ref([])

  const levelTitle = computed(() => LEVEL_TITLES[Math.min(level.value, 10)])

  const weakCharacters = computed(() => {
    return Object.entries(characterStats.value)
      .filter(([, s]) => (s.correct + s.incorrect) >= 3)
      .map(([key, s]) => ({
        key,
        accuracy: s.correct / (s.correct + s.incorrect)
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
  })

  function computeLevel(currentXp) {
    return Math.min(Math.floor(currentXp / 500) + 1, 10)
  }

  function addXp(amount) {
    const prevLevel = level.value
    xp.value += amount
    level.value = computeLevel(xp.value)
    return level.value > prevLevel ? level.value : null
  }

  async function init() {
    const [progressRes, historyRes, charStatsRes, flashcardRes, favoritesRes] = await Promise.all([
      api.get('/progress'),
      api.get('/progress/history'),
      api.get('/progress/character-stats'),
      api.get('/flashcards/known'),
      api.get('/favorites')
    ])

    xp.value = progressRes.data.xp ?? 0
    level.value = progressRes.data.level ?? computeLevel(progressRes.data.xp ?? 0)
    streak.value = progressRes.data.streak ?? 0
    lastPlayedDate.value = progressRes.data.last_played_date ?? null

    quizHistory.value = (historyRes.data ?? []).map(h => ({
      mode: h.mode,
      score: h.score,
      total: h.total,
      xpGained: h.xp_gained,
      date: h.played_at
    }))

    const stats = {}
    for (const entry of (charStatsRes.data ?? [])) {
      stats[entry.char_key] = { correct: entry.correct, incorrect: entry.incorrect }
    }
    characterStats.value = stats

    flashcardKnown.value = (flashcardRes.data ?? [])
      .filter(f => f.known)
      .map(f => f.card_id)

    favoritedKanji.value = favoritesRes.data?.kanji ?? []
    favoritedVocabulary.value = favoritesRes.data?.vocabulary ?? []
  }

  function recordQuizResult(mode, score, total, answers) {
    // Optimistic local update
    quizHistory.value.unshift({ mode, score, total, date: new Date().toISOString() })
    if (quizHistory.value.length > 50) quizHistory.value.pop()

    for (const a of answers) {
      const key = a.question
      if (!characterStats.value[key]) characterStats.value[key] = { correct: 0, incorrect: 0 }
      if (a.wasCorrect) characterStats.value[key].correct++
      else characterStats.value[key].incorrect++
    }

    let xpGained = score * 10
    if (score === total) xpGained += 50
    const newLevel = addXp(xpGained)

    // Fire-and-forget API call
    api.post('/progress/quiz', {
      mode,
      score,
      total,
      answers: answers.map(a => ({ char_key: a.question, was_correct: a.wasCorrect }))
    }).catch(console.error)

    return { xpGained, newLevel }
  }

  function recordVocabQuizResult(mode, score, total, xpTotal) {
    // Optimistic local update
    quizHistory.value.unshift({ mode, score, total, date: new Date().toISOString() })
    if (quizHistory.value.length > 50) quizHistory.value.pop()

    const newLevel = addXp(xpTotal)

    // Fire-and-forget API call
    api.post('/progress/vocab-quiz', { mode, score, total, xp_total: xpTotal })
      .catch(console.error)

    return { xpGained: xpTotal, newLevel }
  }

  function recordFlashcardKnown(id, known) {
    // Optimistic local update
    if (known) {
      if (!flashcardKnown.value.includes(id)) flashcardKnown.value.push(id)
    } else {
      flashcardKnown.value = flashcardKnown.value.filter(k => k !== id)
    }

    // Fire-and-forget API call
    api.put(`/flashcards/known/${id}`, { known })
      .catch(console.error)
  }

  function toggleFavoriteKanji(kanji) {
    // Optimistic local toggle
    const idx = favoritedKanji.value.indexOf(kanji)
    if (idx === -1) favoritedKanji.value.push(kanji)
    else favoritedKanji.value.splice(idx, 1)

    // Fire-and-forget API call
    api.post(`/favorites/kanji/${kanji}`)
      .catch(console.error)
  }

  function toggleFavoriteVocabulary(key) {
    // key is 'expression::reading'
    // Optimistic local toggle
    const idx = favoritedVocabulary.value.indexOf(key)
    if (idx === -1) favoritedVocabulary.value.push(key)
    else favoritedVocabulary.value.splice(idx, 1)

    // Fire-and-forget API call
    api.post(`/favorites/vocabulary/${encodeURIComponent(key)}`)
      .catch(console.error)
  }

  return {
    xp, level, streak, lastPlayedDate,
    quizHistory, characterStats, flashcardKnown, favoritedKanji, favoritedVocabulary,
    levelTitle, weakCharacters,
    addXp, recordQuizResult, recordVocabQuizResult, recordFlashcardKnown,
    toggleFavoriteKanji, toggleFavoriteVocabulary, init
  }
})
