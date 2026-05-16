<template>
  <div
    class="rounded-2xl border p-6 flex flex-col gap-4 cursor-pointer transition-all hover:shadow-lg"
    :class="[selected ? 'border-primary ring-2 ring-primary/30' : '']"
    style="background: var(--color-surface); border-color: var(--color-border);"
    @click="$emit('select')"
  >
    <!-- Sample character -->
    <div class="text-center" style="font-size: 80px; line-height: 1.1;">{{ sampleChar }}</div>

    <!-- Title + description -->
    <div>
      <h2 class="text-xl font-bold">{{ title }}</h2>
      <p class="text-sm mt-1" style="color: var(--color-text-muted);">{{ description }}</p>
    </div>

    <!-- Direction selector -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('quiz.direction') }}</label>
      <div class="flex gap-2">
        <button
          v-for="d in directions"
          :key="d.value"
          class="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors"
          :class="[modelDirection === d.value
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10']"
          style="border-color: var(--color-border);"
          @click.stop="$emit('update:modelDirection', d.value)"
        >{{ d.label }}</button>
      </div>
    </div>

    <!-- JLPT filter (kanji only) -->
    <div v-if="mode === 'kanji'" class="flex flex-col gap-1">
      <label class="text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('quiz.jlptLevel') }}</label>
      <div class="flex gap-2">
        <button
          v-for="lvl in ['all', 'N5', 'N4']"
          :key="lvl"
          class="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors"
          :class="[modelJlpt === lvl
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10']"
          style="border-color: var(--color-border);"
          @click.stop="$emit('update:modelJlpt', lvl)"
        >{{ lvl === 'all' ? $t('quiz.all') : lvl }}</button>
      </div>
    </div>

    <!-- Difficulty selector -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('quiz.difficulty') }}</label>
      <div class="flex gap-2">
        <button
          v-for="d in difficulties"
          :key="d.value"
          class="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors"
          :class="[modelDifficulty === d.value
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10']"
          style="border-color: var(--color-border);"
          @click.stop="$emit('update:modelDifficulty', d.value)"
        >{{ d.label }}</button>
      </div>
    </div>

    <!-- Start button -->
    <button
      v-if="selected"
      class="w-full py-3 rounded-xl bg-primary text-white font-bold text-lg mt-2 hover:bg-primary/90 transition-colors"
      @click.stop="$emit('start')"
    >{{ $t('quiz.startQuiz') }}</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  mode:            { type: String, required: true },
  title:           { type: String, required: true },
  description:     { type: String, required: true },
  sampleChar:      { type: String, required: true },
  selected:        { type: Boolean, default: false },
  modelDirection:  { type: String, default: 'kana-to-romaji' },
  modelDifficulty: { type: String, default: 'medium' },
  modelJlpt:       { type: String, default: 'all' }
})

defineEmits(['select', 'start', 'update:modelDirection', 'update:modelDifficulty', 'update:modelJlpt'])

const difficulties = computed(() => [
  { value: 'easy',   label: t('quiz.easy') },
  { value: 'medium', label: t('quiz.medium') },
  { value: 'hard',   label: t('quiz.hard') },
])

const directions = computed(() => props.mode === 'kanji'
  ? [
      { value: 'kanji-to-meaning', label: t('quiz.kanjiToMeaning') },
      { value: 'kanji-to-reading', label: t('quiz.meaningToKanji') },
    ]
  : [
      { value: 'kana-to-romaji', label: t('quiz.kanaToRomaji') },
      { value: 'romaji-to-kana', label: t('quiz.romajiToKana') },
    ]
)
</script>
