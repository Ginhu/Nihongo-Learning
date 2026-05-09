<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-2">Quiz</h1>
    <p class="mb-6 text-sm" style="color: var(--color-text-muted);">
      Select a mode, set your options, and start.
    </p>

    <!-- Session length selector -->
    <div class="flex items-center gap-3 mb-6">
      <span class="text-sm font-medium">Questions:</span>
      <div class="flex gap-2">
        <button
          v-for="n in [10, 20, 30]"
          :key="n"
          class="px-3 py-1 rounded-lg text-sm font-medium border transition-colors"
          :class="[settings.quizLength === n
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10']"
          style="border-color: var(--color-border);"
          @click="settings.quizLength = n"
        >{{ n }}</button>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useQuizStore } from '@/stores/quiz'
import { generateQuestions } from '@/utils/quiz-generator'
import QuizModeCard from '@/components/quiz/QuizModeCard.vue'

const router = useRouter()
const settings = useSettingsStore()
const quizStore = useQuizStore()

const selectedMode = ref(null)

const cards = reactive([
  {
    mode: 'hiragana',
    title: 'Hiragana',
    description: 'Practice the 46 base + 25 voiced hiragana characters.',
    sampleChar: 'あ',
    direction: 'kana-to-romaji',
    difficulty: 'medium',
    jlpt: 'all'
  },
  {
    mode: 'katakana',
    title: 'Katakana',
    description: 'Practice the 46 base + 25 voiced katakana characters.',
    sampleChar: 'ア',
    direction: 'kana-to-romaji',
    difficulty: 'medium',
    jlpt: 'all'
  },
  {
    mode: 'kanji',
    title: 'Kanji',
    description: 'Test your JLPT N5 and N4 kanji knowledge.',
    sampleChar: '日',
    direction: 'kanji-to-meaning',
    difficulty: 'medium',
    jlpt: 'all'
  }
])

function startQuiz(card) {
  const questions = generateQuestions({
    mode: card.mode,
    direction: card.direction,
    difficulty: card.difficulty,
    jlptFilter: card.jlpt,
    length: settings.quizLength
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
