<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-2">{{ $t('quiz.title') }}</h1>
    <p class="mb-6 text-sm" style="color: var(--color-text-muted);">
      {{ $t('quiz.subtitle') }}
    </p>

    <!-- Session length selector -->
    <div class="flex items-center gap-3 mb-6">
      <span class="text-sm font-medium">{{ $t('quiz.questions') }}</span>
      <div class="flex gap-2">
        <button
          v-for="n in (selectedMode === 'kanji' ? [15, 30, 45, 60] : [15, 30, 45, 60, 71])"
          :key="n"
          class="px-3 py-1 rounded-lg text-sm font-medium border transition-colors"
          :class="[settings.quizLength === n && !kanjiUseAll
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10']"
          style="border-color: var(--color-border);"
          @click="settings.quizLength = n; kanjiUseAll = false"
        >{{ n }}</button>
        <button
          v-if="selectedMode === 'kanji'"
          class="px-3 py-1 rounded-lg text-sm font-medium border transition-colors"
          :class="[kanjiUseAll ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10']"
          style="border-color: var(--color-border);"
          @click="kanjiUseAll = true"
        >{{ $t('quiz.all') }}</button>
      </div>
    </div>

    <!-- Mode cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <QuizModeCard
        v-for="card in cards"
        :key="card.mode"
        :mode="card.mode"
        :title="card.title"
        :description="card.description"
        :sample-char="card.sampleChar"
        :selected="selectedMode === card.mode"
        v-model:model-direction="card.direction"
        v-model:model-difficulty="card.difficulty"
        v-model:model-jlpt="card.jlpt"
        @select="selectedMode = card.mode"
        @start="startQuiz(card)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import { useQuizStore } from '@/stores/quiz'
import { generateQuestions } from '@/utils/quiz-generator'
import QuizModeCard from '@/components/quiz/QuizModeCard.vue'

const router = useRouter()
const settings = useSettingsStore()
const quizStore = useQuizStore()
const { t } = useI18n()

const selectedMode = ref(null)
const kanjiUseAll = ref(false)

watch(selectedMode, (mode) => {
  if (mode === 'kanji') kanjiUseAll.value = false
})

const cards = reactive([
  {
    mode: 'hiragana',
    get title() { return t('quiz.hiraganaTitle') },
    get description() { return t('quiz.hiraganaDesc') },
    sampleChar: 'あ',
    direction: 'kana-to-romaji',
    difficulty: 'medium',
    jlpt: 'all'
  },
  {
    mode: 'katakana',
    get title() { return t('quiz.katakanaTitle') },
    get description() { return t('quiz.katakanaDesc') },
    sampleChar: 'ア',
    direction: 'kana-to-romaji',
    difficulty: 'medium',
    jlpt: 'all'
  },
  {
    mode: 'kanji',
    get title() { return t('quiz.kanjiTitle') },
    get description() { return t('quiz.kanjiDesc') },
    sampleChar: '日',
    direction: 'kanji-to-meaning',
    difficulty: 'medium',
    jlpt: 'all'
  }
])

function startQuiz(card) {
  const length = (card.mode === 'kanji' && kanjiUseAll.value) ? null : settings.quizLength
  const questions = generateQuestions({
    mode: card.mode,
    direction: card.direction,
    difficulty: card.difficulty,
    jlptFilter: card.jlpt,
    length
  })

  if (questions.length === 0) return

  quizStore.startSession({
    mode: card.mode,
    direction: card.direction,
    difficulty: card.difficulty,
    jlptFilter: card.jlpt,
    questions
  })

  router.push({ name: 'quiz-session', params: { mode: card.mode } })
}
</script>
