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
          <div class="text-3xl font-black text-white mb-3">{{ $t('vocabQuiz.levelUp') }}</div>
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

    <!-- Active session -->
    <template v-else-if="questions.length > 0">

      <!-- Progress bar -->
      <div class="flex items-center gap-3 mb-6">
        <div class="flex-1 h-2 rounded-full overflow-hidden" style="background: var(--color-surface-2);">
          <div
            class="h-full rounded-full transition-all duration-300"
            style="background: var(--color-primary);"
            :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"
          />
        </div>
        <span class="text-sm font-semibold tabular-nums" style="color: var(--color-text-muted);">
          {{ currentIndex + 1 }} / {{ questions.length }}
        </span>
        <span class="text-sm font-semibold" style="color: var(--color-accent);">
          {{ score }} ✓
        </span>
      </div>

      <!-- Question card -->
      <div
        class="rounded-2xl border p-6 mb-6"
        style="background: var(--color-surface); border-color: var(--color-border);"
      >
        <VocabQuestionCard
          :item="currentQ.item"
          :type="qType"
          :direction="qDirection"
        />

        <!-- Tips (kanji only) -->
        <VocabTipPanel
          v-if="qType === 'kanji'"
          :examples="localizedExamples"
          :tips-used="tipsUsed"
          :answered="answered"
          @use-tip="onUseTip"
        />
      </div>

      <!-- Answer grid -->
      <QuizAnswerGrid
        :options="currentQ.options"
        :selected-answer="selectedAnswer"
        :correct-answer="currentQ.correctAnswer"
        :answered="answered"
        @select="handleAnswer"
      />

      <!-- Wrong answer tooltip -->
      <div
        v-if="answered && selectedAnswer !== currentQ.correctAnswer"
        class="mt-4 p-3 rounded-xl text-sm text-center"
        style="background: var(--color-surface); color: var(--color-text-muted);"
      >
        {{ $t('vocabQuiz.correct') }} <strong style="color: var(--color-text);">{{ currentQ.correctAnswer }}</strong>
      </div>

    </template>

    <!-- No session fallback -->
    <div v-else class="text-center py-10">
      <p style="color: var(--color-text-muted);">{{ $t('vocabQuiz.noSession') }}</p>
      <button
        class="mt-4 px-6 py-2 rounded-xl bg-primary text-white font-semibold"
        @click="router.push({ name: 'vocabulary' })"
      >{{ $t('vocabQuiz.chooseQuiz') }}</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProgressStore } from '@/stores/progress'
import { useLocaleData } from '@/composables/useLocaleData'
import n5Vocabulary from '@/data/n5_vocabulary.js'
import n4Vocabulary from '@/data/n4_vocabulary.js'
import kanjiN5Data from '@/data/n5_kanji.js'
import kanjiN4Data from '@/data/n4_kanji.js'
import QuizAnswerGrid from '@/components/quiz/QuizAnswerGrid.vue'
import QuizEndScreen   from '@/components/quiz/QuizEndScreen.vue'
import VocabQuestionCard from '@/components/vocabulary/VocabQuestionCard.vue'
import VocabTipPanel     from '@/components/vocabulary/VocabTipPanel.vue'

const router   = useRouter()
const route    = useRoute()
const progress = useProgressStore()
const { locale } = useI18n()
const { getFirstMeaning, getExampleMeaning } = useLocaleData()

// ── Read query params ──────────────────────────────────────────────────────
const qType       = route.query.type       ?? 'vocab'
const qLevel      = route.query.level      ?? 'all'
const qDirection  = route.query.direction  ?? 'word-meaning'
const qDifficulty = route.query.difficulty ?? 'normal'
const qCount      = route.query.count      === 'all' ? 'all' : Number(route.query.count ?? 'all')
const qCategories = route.query.categories ? route.query.categories.split(',') : []

// ── Helpers ────────────────────────────────────────────────────────────────
function fisherYates(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getAnswerText(item, type, direction) {
  if (direction === 'word-meaning') {
    return getFirstMeaning(item, type)
  }
  return type === 'kanji' ? item.kanji : `${item.expression} (${item.reading})`
}

function optionCount(difficulty) {
  if (difficulty === 'easy') return 2
  if (difficulty === 'hard') return 6
  return 4
}

function buildPool() {
  if (qType === 'kanji') {
    if (qLevel === 'kanji-favorites') {
      const favSet = new Set(progress.favoritedKanji)
      return [...kanjiN5Data, ...kanjiN4Data].filter(k => favSet.has(k.kanji))
    }
    if (qLevel === 'N5') return kanjiN5Data
    if (qLevel === 'N4') return kanjiN4Data
    return [...kanjiN5Data, ...kanjiN4Data]
  }
  // vocab
  if (qLevel === 'favorites') {
    const favSet = new Set(progress.favoritedVocabulary)
    return [...n5Vocabulary, ...n4Vocabulary].filter(w => favSet.has(w.expression))
  }
  let words = qLevel === 'N5' ? n5Vocabulary
            : qLevel === 'N4' ? n4Vocabulary
            : [...n5Vocabulary, ...n4Vocabulary]
  if (qCategories.length > 0) {
    words = words.filter(w => qCategories.includes(w.category))
  }
  return words
}

function generateOptions(item, pool) {
  const n = optionCount(qDifficulty)
  const correct = getAnswerText(item, qType, qDirection)
  const usedTexts = new Set([correct])
  const distractors = []

  for (const candidate of fisherYates(pool)) {
    if (candidate === item) continue
    const text = getAnswerText(candidate, qType, qDirection)
    if (!usedTexts.has(text)) {
      usedTexts.add(text)
      distractors.push(text)
      if (distractors.length >= n - 1) break
    }
  }

  return fisherYates([correct, ...distractors])
}

function buildQuestions(pool) {
  const shuffled = fisherYates(pool)
  const slice = qCount === 'all' ? shuffled : shuffled.slice(0, qCount)
  return slice.map(item => ({
    item,
    correctAnswer: getAnswerText(item, qType, qDirection),
    options: generateOptions(item, pool),
  }))
}

function calcXp(wasCorrect, tips) {
  if (!wasCorrect) return 0
  const multipliers = [1, 0.8, 0.4, 0.1]
  return Math.round(10 * multipliers[Math.min(tips, 3)])
}

// ── Session state ──────────────────────────────────────────────────────────
const pool      = buildPool()
const questions = ref(pool.length >= 2 ? buildQuestions(pool) : [])

const currentIndex   = ref(0)
const answered       = ref(false)
const selectedAnswer = ref(null)
const tipsUsed       = ref(0)
const score          = ref(0)
const totalXp        = ref(0)
let startTime      = Date.now()

const showEndScreen = ref(false)
const sessionResult = ref(null)
const showLevelUp   = ref(false)
const levelUpData   = ref({ level: 1, title: '' })

let advanceTimer = null

const currentQ = computed(() => questions.value[currentIndex.value])

const localizedExamples = computed(() => {
  if (!currentQ.value?.item?.examples) return []
  if (locale.value !== 'pt-BR') return currentQ.value.item.examples
  return currentQ.value.item.examples.map(ex => ({
    ...ex,
    meaning: getExampleMeaning(ex, currentQ.value.item.kanji)
  }))
})

// ── Answer handling ────────────────────────────────────────────────────────
function handleAnswer(option) {
  if (answered.value) return
  selectedAnswer.value = option
  answered.value = true

  const correct = option === currentQ.value.correctAnswer
  if (correct) score.value++
  totalXp.value += calcXp(correct, tipsUsed.value)

  const delay = correct ? 1000 : 1500
  advanceTimer = setTimeout(advance, delay)
}

function onUseTip() {
  const maxTips = Math.min(3, currentQ.value.item.examples?.length ?? 0)
  if (answered.value || tipsUsed.value >= maxTips) return
  tipsUsed.value++
}

function advance() {
  clearTimeout(advanceTimer)
  if (currentIndex.value >= questions.value.length - 1) {
    finishSession()
    return
  }
  currentIndex.value++
  answered.value = false
  selectedAnswer.value = null
  tipsUsed.value = 0
}

// ── Session end ────────────────────────────────────────────────────────────
function finishSession() {
  const perfect = score.value === questions.value.length
  const bonus   = perfect ? 50 : 0
  const xpFinal = totalXp.value + bonus
  const timeTaken = Math.round((Date.now() - startTime) / 1000)

  const mode = `${qType}-${qLevel}`
  const { xpGained, newLevel } = progress.recordVocabQuizResult(
    mode,
    score.value,
    questions.value.length,
    xpFinal
  )

  sessionResult.value = {
    score: score.value,
    total: questions.value.length,
    timeTaken,
    xpGained,
  }

  if (newLevel) {
    levelUpData.value = { level: newLevel, title: progress.levelTitle }
    showLevelUp.value = true
    setTimeout(() => {
      showLevelUp.value = false
      showEndScreen.value = true
    }, 2000)
  } else {
    showEndScreen.value = true
  }
}

function handleRetry() {
  clearTimeout(advanceTimer)
  startTime = Date.now()
  const fresh = buildQuestions(pool)
  questions.value    = fresh
  currentIndex.value = 0
  answered.value     = false
  selectedAnswer.value = null
  tipsUsed.value     = 0
  score.value        = 0
  totalXp.value      = 0
  showEndScreen.value = false
  showLevelUp.value = false
  sessionResult.value = null
}

onUnmounted(() => clearTimeout(advanceTimer))
</script>
