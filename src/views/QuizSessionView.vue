<template>
  <div class="max-w-lg mx-auto px-4 py-6">

    <!-- Level-up overlay -->
    <Teleport to="body">
      <div
        v-if="showLevelUp"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.88);"
        aria-live="assertive"
        role="status"
      >
        <div class="anim-levelup text-center px-8">
          <div class="text-5xl mb-4">⭐</div>
          <div class="text-3xl font-black text-white mb-3">{{ $t('quiz.levelUp') }}</div>
          <div class="font-black" style="font-size: 72px; line-height: 1; color: var(--color-accent);">
            {{ levelUpData.level }}
          </div>
          <div class="text-xl font-semibold text-white mt-3">{{ levelUpData.title }}</div>
        </div>
      </div>
    </Teleport>

    <!-- End screen -->
    <QuizEndScreen
      v-if="showEndScreen && sessionResult"
      :score="sessionResult.score"
      :total="sessionResult.total"
      :time-taken="sessionResult.timeTaken"
      :xp-gained="sessionResult.xpGained"
      @retry="handleRetry"
      @home="router.push({ name: 'home' })"
    />

    <!-- Active quiz -->
    <template v-else-if="quizStore.questions.length > 0">
      <QuizQuestion
        :prompt="currentQuestion.prompt"
        :current="quizStore.currentIndex + 1"
        :total="quizStore.questions.length"
        :score="quizStore.score"
        :onyomi="currentQuestion.onyomi"
        :kunyomi="currentQuestion.kunyomi"
      />

      <QuizAnswerGrid
        class="mt-6"
        :options="currentQuestion.options"
        :selected-answer="selectedAnswer"
        :correct-answer="currentQuestion.correctAnswer"
        :answered="answered"
        @select="handleAnswer"
        @correct-tap="advanceAfterWrong"
      />

      <!-- Wrong answer tooltip -->
      <div
        v-if="answered && selectedAnswer !== currentQuestion.correctAnswer"
        class="mt-4 p-3 rounded-xl text-sm text-center"
        style="background: var(--color-surface); color: var(--color-text-muted);"
      >
        {{ $t('quiz.correct') }} <strong style="color: var(--color-text);">{{ currentQuestion.correctAnswer }}</strong>
        {{ $t('quiz.tapToContinue') }}
      </div>
    </template>

    <!-- No session fallback -->
    <div v-else class="text-center py-10">
      <p style="color: var(--color-text-muted);">{{ $t('quiz.noSession') }}</p>
      <button
        class="mt-4 px-6 py-2 rounded-xl bg-primary text-white font-semibold"
        @click="router.push({ name: 'quiz-select' })"
      >{{ $t('quiz.chooseQuiz') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuizStore } from '@/stores/quiz'
import { useProgressStore } from '@/stores/progress'
import { useSettingsStore } from '@/stores/settings'
import { useContentStore } from '@/stores/content'
import { playCorrect, playWrong, playLevelUp } from '@/utils/sound'
import { generateQuestions } from '@/utils/quiz-generator'
import QuizQuestion from '@/components/quiz/QuizQuestion.vue'
import QuizAnswerGrid from '@/components/quiz/QuizAnswerGrid.vue'
import QuizEndScreen from '@/components/quiz/QuizEndScreen.vue'

const router = useRouter()
const { t } = useI18n()
const quizStore = useQuizStore()
const progressStore = useProgressStore()
const settings = useSettingsStore()
const contentStore = useContentStore()

const answered = ref(false)
const selectedAnswer = ref(null)
const showEndScreen = ref(false)
const sessionResult = ref(null)
let advanceTimer = null
let levelUpTimer = null
const showLevelUp = ref(false)
const levelUpData = ref({ level: 1, title: '' })

onUnmounted(() => {
  clearTimeout(advanceTimer)
  clearTimeout(levelUpTimer)
})

const currentQuestion = computed(() => quizStore.questions[quizStore.currentIndex] ?? null)

function handleAnswer(chosen) {
  if (answered.value || !currentQuestion.value) return
  answered.value = true
  selectedAnswer.value = chosen

  const isCorrect = chosen === currentQuestion.value.correctAnswer

  if (settings.soundEnabled) {
    isCorrect ? playCorrect() : playWrong()
  }

  if (isCorrect) {
    advanceTimer = setTimeout(() => advance(chosen), 600)
  }
}

function advanceAfterWrong() {
  if (!answered.value || !currentQuestion.value) return
  advance(selectedAnswer.value)
}

function advance(chosen) {
  clearTimeout(advanceTimer)
  const correct = currentQuestion.value.correctAnswer
  const isLast = quizStore.currentIndex === quizStore.questions.length - 1
  quizStore.answerQuestion(chosen, correct)
  answered.value = false
  selectedAnswer.value = null
  if (isLast) endSession()
}

function endSession() {
  const result = quizStore.endSession()
  const { xpGained, newLevel } = progressStore.recordQuizResult(
    result.mode,
    result.score,
    result.total,
    result.answers
  )
  sessionResult.value = { ...result, xpGained, newLevel }

  if (newLevel) {
    levelUpData.value = { level: newLevel, title: progressStore.levelTitle }
    showLevelUp.value = true
    if (settings.soundEnabled) playLevelUp()
    levelUpTimer = setTimeout(() => {
      showLevelUp.value = false
      showEndScreen.value = true
    }, 2000)
  } else {
    showEndScreen.value = true
  }
}

function handleRetry() {
  const questions = generateQuestions({
    mode: quizStore.mode,
    direction: quizStore.direction,
    difficulty: quizStore.difficulty,
    jlptFilter: quizStore.jlptFilter,
    length: settings.quizLength,
    kana: contentStore.kana,
    kanji: contentStore.kanji,
  })

  quizStore.startSession({
    mode: quizStore.mode,
    direction: quizStore.direction,
    difficulty: quizStore.difficulty,
    jlptFilter: quizStore.jlptFilter,
    questions
  })

  answered.value = false
  selectedAnswer.value = null
  showEndScreen.value = false
  sessionResult.value = null
}
</script>
