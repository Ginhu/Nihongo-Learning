<template>
  <div class="max-w-lg mx-auto px-4 py-6 flex flex-col gap-8">

    <div>
      <h1 class="text-2xl font-bold mb-1">{{ $t('vocabQuiz.title') }}</h1>
      <p class="text-sm" style="color: var(--color-text-muted);">
        {{ $t('vocabQuiz.subtitle') }}
      </p>
    </div>

    <!-- Type -->
    <div>
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('vocabQuiz.type') }}</div>
      <div class="flex gap-3">
        <button
          v-for="t in types"
          :key="t.value"
          class="flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors"
          :class="selectedType === t.value ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="onSelectType(t.value)"
        >{{ t.label }}</button>
      </div>
    </div>

    <!-- Level -->
    <div>
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('vocabQuiz.level') }}</div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="lvl in levelOptions"
          :key="lvl.value"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="selectedLevel === lvl.value ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="onSelectLevel(lvl.value)"
        >{{ lvl.label }}</button>
      </div>
    </div>

    <!-- Direction -->
    <div>
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('vocabQuiz.direction') }}</div>
      <div class="flex gap-3">
        <button
          v-for="d in directions"
          :key="d.value"
          class="flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors"
          :class="selectedDirection === d.value ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="selectedDirection = d.value"
        >{{ d.label }}</button>
      </div>
    </div>

    <!-- Difficulty -->
    <div>
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('vocabQuiz.difficulty') }}</div>
      <div class="flex gap-3">
        <button
          v-for="d in difficulties"
          :key="d.value"
          class="flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors"
          :class="selectedDifficulty === d.value ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="selectedDifficulty = d.value"
        >{{ d.label }}</button>
      </div>
      <div class="text-xs mt-2" style="color: var(--color-text-muted);">
        Easy: 2 options · Normal: 4 options · Hard: 6 options
      </div>
    </div>

    <!-- Categories (vocab N5/N4 only) -->
    <div v-if="showCategories">
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">
        {{ $t('vocabQuiz.categories') }} <span class="normal-case font-normal">({{ $t('vocabQuiz.optional') }})</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in availableCategories"
          :key="cat"
          class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
          :class="selectedCategories.includes(cat) ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="toggleCategory(cat)"
        >{{ formatCategory(cat) }} ({{ categoryCounts[cat] ?? 0 }})</button>
      </div>
    </div>

    <!-- Count (hidden for favorites) -->
    <div v-if="!isFavoritesMode">
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('vocabQuiz.count') }}</div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="opt in countOptions"
          :key="opt.value"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="selectedCount === opt.value ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="selectedCount = opt.value"
        >{{ opt.label }}</button>
      </div>
    </div>

    <!-- Start -->
    <button
      class="w-full py-4 rounded-xl font-bold text-lg transition-opacity hover:opacity-90"
      style="background: var(--color-primary); color: white;"
      :disabled="poolSize < minPoolForDifficulty"
      @click="startSession"
    >{{ $t('vocabQuiz.start') }}</button>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProgressStore } from '@/stores/progress'
import n5Vocabulary from '@/data/n5_vocabulary.js'
import n4Vocabulary from '@/data/n4_vocabulary.js'
import kanjiN5Data from '@/data/n5_kanji.js'
import kanjiN4Data from '@/data/n4_kanji.js'

const router   = useRouter()
const { t }    = useI18n()
const progress = useProgressStore()

const selectedType       = ref('vocab')
const selectedLevel      = ref('all')
const selectedDirection  = ref('word-meaning')
const selectedDifficulty = ref('normal')
const selectedCategories = ref([])
const selectedCount      = ref('all')

const types = computed(() => [
  { value: 'vocab', label: t('vocabQuiz.vocabulary') },
  { value: 'kanji', label: t('vocabQuiz.kanji') },
])

const directions = computed(() => [
  { value: 'word-meaning', label: t('vocabQuiz.wordMeaning') },
  { value: 'meaning-word', label: t('vocabQuiz.meaningWord') },
])

const difficulties = computed(() => [
  { value: 'easy',   label: t('vocabQuiz.easy') },
  { value: 'normal', label: t('vocabQuiz.normal') },
  { value: 'hard',   label: t('vocabQuiz.hard') },
])

const hasFavorites      = computed(() => progress.favoritedVocabulary.length > 0)
const hasKanjiFavorites = computed(() => progress.favoritedKanji.length > 0)

const isFavoritesMode = computed(() =>
  selectedLevel.value === 'favorites' || selectedLevel.value === 'kanji-favorites'
)

const levelOptions = computed(() => {
  const base = [
    { value: 'all', label: 'All' },
    { value: 'N5',  label: 'N5' },
    { value: 'N4',  label: 'N4' },
  ]
  if (selectedType.value === 'vocab' && hasFavorites.value) {
    base.push({ value: 'favorites', label: '★ Favorites' })
  }
  if (selectedType.value === 'kanji' && hasKanjiFavorites.value) {
    base.push({ value: 'kanji-favorites', label: '★ Favorites' })
  }
  return base
})

const showCategories = computed(() =>
  selectedType.value === 'vocab' &&
  (selectedLevel.value === 'N5' || selectedLevel.value === 'N4')
)

const availableCategories = computed(() => {
  if (!showCategories.value) return []
  const words = selectedLevel.value === 'N5' ? n5Vocabulary : n4Vocabulary
  return [...new Set(words.map(w => w.category))].sort()
})

const categoryCounts = computed(() => {
  if (!showCategories.value) return {}
  const words = selectedLevel.value === 'N5' ? n5Vocabulary : n4Vocabulary
  return words.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] ?? 0) + 1
    return acc
  }, {})
})

const poolSize = computed(() => {
  if (selectedLevel.value === 'kanji-favorites') return progress.favoritedKanji.length
  if (selectedLevel.value === 'favorites')       return progress.favoritedVocabulary.length
  if (selectedType.value === 'kanji') {
    return selectedLevel.value === 'N5' ? kanjiN5Data.length
         : selectedLevel.value === 'N4' ? kanjiN4Data.length
         : kanjiN5Data.length + kanjiN4Data.length
  }
  let words = selectedLevel.value === 'N5' ? n5Vocabulary
            : selectedLevel.value === 'N4' ? n4Vocabulary
            : [...n5Vocabulary, ...n4Vocabulary]
  if (selectedCategories.value.length > 0) {
    words = words.filter(w => selectedCategories.value.includes(w.category))
  }
  return words.length
})

const minPoolForDifficulty = computed(() => {
  if (selectedDifficulty.value === 'easy') return 2
  if (selectedDifficulty.value === 'hard') return 6
  return 4
})

const countOptions = computed(() => {
  const n = poolSize.value
  const opts = []
  for (let i = 10; i < n && i <= 50; i += 10) {
    opts.push({ label: String(i), value: i })
  }
  opts.push({ label: `All (${n})`, value: 'all' })
  return opts
})

watch(countOptions, (opts) => {
  if (opts.some(o => o.value === selectedCount.value)) return
  const specific = opts.filter(o => typeof o.value === 'number' && o.value <= 20)
  selectedCount.value = specific.length > 0 ? specific[specific.length - 1].value : 'all'
}, { immediate: true })

function onSelectType(type) {
  selectedType.value = type
  if (isFavoritesMode.value) selectedLevel.value = 'all'
  selectedCategories.value = []
}

function onSelectLevel(level) {
  selectedLevel.value = level
  selectedCategories.value = []
}

function toggleCategory(cat) {
  selectedCategories.value = selectedCategories.value.includes(cat)
    ? selectedCategories.value.filter(c => c !== cat)
    : [...selectedCategories.value, cat]
}

function formatCategory(key) {
  return key
    .replace(/_and_/g, ' & ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function startSession() {
  const query = {
    type:      selectedType.value,
    level:     selectedLevel.value,
    direction: selectedDirection.value,
    difficulty: selectedDifficulty.value,
    count:     selectedCount.value,
  }
  if (selectedCategories.value.length > 0) {
    query.categories = selectedCategories.value.join(',')
  }
  router.push({ name: 'vocabulary-session', query })
}
</script>