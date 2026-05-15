import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'nihongo-progress'

const LEVEL_TITLES = [
  '', 'Beginner', 'Student', 'Apprentice', 'Learner', 'Practitioner',
  'Intermediate', 'Advanced', 'Expert', 'Master', 'Sensei'
]

export const useProgressStore = defineStore('progress', () => {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { /* use defaults */ }

  const xp = ref(saved.xp ?? 0)
  const level = ref(Math.min(Math.floor((saved.xp ?? 0) / 500) + 1, 10))
  const streak = ref(saved.streak ?? 0)
  const lastPlayedDate = ref(saved.lastPlayedDate ?? null)
  const quizHistory = ref(saved.quizHistory ?? [])
  const characterStats = ref(saved.characterStats ?? {})
  const flashcardKnown = ref(saved.flashcardKnown ?? [])
  const favoritedKanji = ref(saved.favoritedKanji ?? [])
  const favoritedVocabulary = ref(saved.favoritedVocabulary ?? [])

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

  function recordQuizResult(mode, score, total, answers) {
    quizHistory.value.unshift({ mode, score, total, date: new Date().toISOString() })
    if (quizHistory.value.length > 50) quizHistory.value.pop()

    let xpGained = score * 10
    if (score === total) xpGained += 50
    const newLevel = addXp(xpGained)

    for (const a of answers) {
      const key = a.question
      if (!characterStats.value[key]) characterStats.value[key] = { correct: 0, incorrect: 0 }
      if (a.wasCorrect) characterStats.value[key].correct++
      else characterStats.value[key].incorrect++
    }

    checkStreak()
    return { xpGained, newLevel }
  }

  function recordVocabQuizResult(mode, score, total, xpTotal) {
    quizHistory.value.unshift({ mode, score, total, date: new Date().toISOString() })
    if (quizHistory.value.length > 50) quizHistory.value.pop()
    const newLevel = addXp(xpTotal)
    checkStreak()
    return { xpGained: xpTotal, newLevel }
  }

  function recordFlashcardKnown(id, known) {
    if (known) {
      if (!flashcardKnown.value.includes(id)) flashcardKnown.value.push(id)
    } else {
      flashcardKnown.value = flashcardKnown.value.filter(k => k !== id)
    }
  }

  function toggleFavoriteKanji(kanji) {
    const idx = favoritedKanji.value.indexOf(kanji)
    if (idx === -1) favoritedKanji.value.push(kanji)
    else favoritedKanji.value.splice(idx, 1)
  }

  function toggleFavoriteVocabulary(expression) {
    const idx = favoritedVocabulary.value.indexOf(expression)
    if (idx === -1) favoritedVocabulary.value.push(expression)
    else favoritedVocabulary.value.splice(idx, 1)
  }

  function checkStreak() {
    const today = new Date().toISOString().slice(0, 10)
    if (lastPlayedDate.value === today) return
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    streak.value = lastPlayedDate.value === yesterday ? streak.value + 1 : 1
    lastPlayedDate.value = today
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      xp: xp.value,
      level: level.value,
      streak: streak.value,
      lastPlayedDate: lastPlayedDate.value,
      quizHistory: quizHistory.value,
      characterStats: characterStats.value,
      flashcardKnown: flashcardKnown.value,
      favoritedKanji: favoritedKanji.value,
      favoritedVocabulary: favoritedVocabulary.value
    }))
  }

  watch(
    [xp, level, streak, lastPlayedDate, quizHistory, characterStats, flashcardKnown, favoritedKanji, favoritedVocabulary],
    persist,
    { deep: true }
  )

  return {
    xp, level, streak, lastPlayedDate,
    quizHistory, characterStats, flashcardKnown, favoritedKanji, favoritedVocabulary,
    levelTitle, weakCharacters,
    addXp, recordQuizResult, recordVocabQuizResult, recordFlashcardKnown, toggleFavoriteKanji, toggleFavoriteVocabulary, checkStreak
  }
})
