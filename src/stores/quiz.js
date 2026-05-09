import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQuizStore = defineStore('quiz', () => {
  // Session-only state — intentionally not persisted to localStorage.
  // Quiz sessions should not survive page refresh.
  const mode = ref(null)
  const direction = ref(null)
  const difficulty = ref('medium')
  const jlptFilter = ref('all')
  const questions = ref([])
  const currentIndex = ref(0)
  const score = ref(0)
  const answers = ref([])
  const startTime = ref(null)

  const difficultyOptions = { easy: 2, medium: 4, hard: 6 }

  function startSession(opts) {
    mode.value = opts.mode
    direction.value = opts.direction
    difficulty.value = opts.difficulty ?? 'medium'
    jlptFilter.value = opts.jlptFilter ?? 'all'
    questions.value = opts.questions
    currentIndex.value = 0
    score.value = 0
    answers.value = []
    startTime.value = Date.now()
  }

  function answerQuestion(chosenAnswer, correctAnswer) {
    const wasCorrect = chosenAnswer === correctAnswer
    if (wasCorrect) score.value++
    answers.value.push({
      question: questions.value[currentIndex.value]?.prompt ?? '',
      chosen: chosenAnswer,
      correct: correctAnswer,
      wasCorrect
    })
    currentIndex.value++
  }

  function endSession() {
    return {
      mode: mode.value,
      score: score.value,
      total: questions.value.length,
      timeTaken: Math.floor((Date.now() - startTime.value) / 1000),
      answers: answers.value
    }
  }

  function reset() {
    mode.value = null
    direction.value = null
    questions.value = []
    currentIndex.value = 0
    score.value = 0
    answers.value = []
    startTime.value = null
  }

  return {
    mode, direction, difficulty, jlptFilter,
    questions, currentIndex, score, answers, startTime,
    difficultyOptions,
    startSession, answerQuestion, endSession, reset
  }
})
