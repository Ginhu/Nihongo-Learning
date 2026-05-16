<template>
  <div class="max-w-lg mx-auto px-4 py-6 flex flex-col gap-8">

    <div>
      <h1 class="text-2xl font-bold mb-1">{{ $t('flashcards.title') }}</h1>
      <p class="text-sm" style="color: var(--color-text-muted);">
        {{ $t('flashcards.subtitle') }}
      </p>
    </div>

    <!-- Type -->
    <div>
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('flashcards.type') }}</div>
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
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('flashcards.level') }}</div>
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

    <!-- Count (hidden for favorites) -->
    <div v-if="!isFavoritesMode">
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">{{ $t('flashcards.cardsPerRound') }}</div>
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

    <!-- Categories (inline, vocab + N5/N4 only) -->
    <div v-if="showCategories">
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">
        {{ $t('flashcards.categories') }} <span class="normal-case font-normal">({{ $t('flashcards.optional') }})</span>
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

    <!-- Start -->
    <button
      class="w-full py-4 rounded-xl font-bold text-lg transition-opacity hover:opacity-90"
      style="background: var(--color-primary); color: white;"
      @click="startSession"
    >{{ $t('flashcards.start') }}</button>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '@/stores/progress'
import n5Vocabulary from '@/data/n5_vocabulary.js'
import n4Vocabulary from '@/data/n4_vocabulary.js'
import kanjiN5Data from '@/data/n5_kanji.js'
import kanjiN4Data from '@/data/n4_kanji.js'

const router = useRouter()
const progress = useProgressStore()

const selectedType       = ref('vocab')  // 'vocab' | 'kanji'
const selectedLevel      = ref('all')    // 'all' | 'N5' | 'N4' | 'favorites' | 'kanji-favorites'
const selectedCategories = ref([])
const selectedCount      = ref('all')   // number | 'all'

const types = [
  { value: 'vocab', label: 'Vocabulary' },
  { value: 'kanji', label: 'Kanji' },
]

const hasFavorites = computed(() => progress.favoritedVocabulary.length > 0)
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
  selectedType.value === 'vocab' && (selectedLevel.value === 'N5' || selectedLevel.value === 'N4')
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

const countOptions = computed(() => {
  const n = poolSize.value
  const opts = []
  for (let i = 10; i < n && i <= 50; i += 10) {
    opts.push({ label: String(i), value: i })
  }
  opts.push({ label: `All (${n})`, value: 'all' })
  return opts
})

// Auto-select count when options change (pick highest ≤ 20, else 'all')
watch(countOptions, (opts) => {
  const specific = opts.filter(o => typeof o.value === 'number' && o.value <= 20)
  selectedCount.value = specific.length > 0 ? specific[specific.length - 1].value : 'all'
}, { immediate: true })

function onSelectType(type) {
  selectedType.value = type
  if (selectedLevel.value === 'favorites' || selectedLevel.value === 'kanji-favorites') {
    selectedLevel.value = 'all'
  }
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
    type:  selectedType.value === 'kanji' ? 'kanji' : 'vocab',
    level: selectedLevel.value,
    count: selectedCount.value,
  }
  if (selectedCategories.value.length > 0) {
    query.categories = selectedCategories.value.join(',')
  }
  router.push({ name: 'flashcards-session', query })
}
</script>
