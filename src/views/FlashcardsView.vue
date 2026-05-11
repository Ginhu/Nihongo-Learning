<template>
  <div class="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

    <DeckSelector
      :active-deck="activeDeck"
      :selected-level="selectedLevel"
      :has-favorites="favoritedVocabularyInDeck.length > 0 || activeDeck === 'favorites'"
      :has-kanji-favorites="favoritedKanjiInDeck.length > 0 || activeDeck === 'kanji-favorites'"
      @select="onSelectSpecialDeck"
      @select-level="onSelectLevel"
    />

    <CategoryFilter
      v-if="selectedLevel && !activeDeck"
      :available-categories="availableCategories"
      :selected-categories="selectedCategories"
      :category-counts="categoryCounts"
      @update:selected-categories="onCategoriesChange"
    />

    <div v-if="currentBatch.length === 0" class="text-center py-16" style="color: var(--color-text-muted);">
      <div class="text-4xl mb-3">📭</div>
      <p>No cards in this deck yet.</p>
      <p v-if="activeDeck === 'favorites'" class="text-sm mt-1">Favorite vocabulary words to see them here.</p>
      <p v-else-if="activeDeck === 'kanji-favorites'" class="text-sm mt-1">Favorite kanji to see them here.</p>
      <p v-else-if="selectedLevel && selectedCategories.length > 0" class="text-sm mt-1">No words found for the selected categories.</p>
    </div>

    <template v-else>
      <div class="flex items-center gap-3">
        <div class="flex-1 h-2 rounded-full overflow-hidden" style="background: var(--color-surface-2);">
          <div
            class="h-full transition-all duration-300"
            style="background: var(--color-accent);"
            :style="{ width: `${knownPercent}%` }"
          />
        </div>
        <span class="text-sm font-medium whitespace-nowrap" style="color: var(--color-text-muted);">
          {{ knownCount }} / {{ currentBatch.length }} known
        </span>
      </div>

      <div class="flex items-center justify-between text-sm" style="color: var(--color-text-muted);">
        <span>Card {{ currentIndex + 1 }} of {{ currentBatch.length }}</span>
        <button
          class="text-xs px-2 py-1 rounded border transition-colors hover:bg-primary/10"
          style="border-color: var(--color-border);"
          @click="reshufflePool"
        >Shuffle</button>
      </div>

      <div
        ref="cardContainer"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <FlashCard
          v-if="currentCard"
          :card="currentCard"
          :type="deckType"
          :scene-height="320"
        />
      </div>

      <div class="flex gap-3 justify-center">
        <button
          class="flex-1 max-w-[160px] py-3 rounded-xl border font-semibold text-sm transition-colors"
          :class="isCurrentKnown ? 'hover:bg-red-500/10 hover:border-red-400' : 'border-red-400 bg-red-500/20 text-red-600'"
          style="border-color: var(--color-border);"
          @click="markCard(false)"
        >
          ✗ Needs Practice
        </button>
        <button
          class="flex-1 max-w-[160px] py-3 rounded-xl border font-semibold text-sm transition-colors"
          :class="isCurrentKnown ? 'border-green-500 bg-green-500/20 text-green-600' : 'hover:bg-green-500/10 hover:border-green-400'"
          style="border-color: var(--color-border);"
          @click="markCard(true)"
        >
          ✓ Known
        </button>
      </div>

      <div v-if="activeDeck !== 'favorites' && activeDeck !== 'kanji-favorites'" class="flex justify-center">
        <button
          class="px-6 py-2 rounded-xl border text-sm font-semibold transition-colors"
          :class="isCurrentFavorited
            ? 'border-primary bg-primary/20 text-primary'
            : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="toggleFavorite"
        >
          {{ isCurrentFavorited ? '♥ Favorited' : '♡ Favorite' }}
        </button>
      </div>

      <div class="flex gap-3 justify-center">
        <button
          class="px-8 py-3 rounded-xl border font-semibold transition-colors hover:bg-primary/10 disabled:opacity-30"
          style="border-color: var(--color-border);"
          :disabled="currentIndex === 0"
          @click="prev"
        >← Prev</button>
        <button
          class="px-8 py-3 rounded-xl border font-semibold transition-colors hover:bg-primary/10 disabled:opacity-30"
          style="border-color: var(--color-border);"
          :disabled="currentIndex === currentBatch.length - 1"
          @click="next"
        >Next →</button>
      </div>

      <!-- Continue / exhausted message — shown on last card of batch -->
      <template v-if="currentIndex === currentBatch.length - 1">
        <div v-if="hasMore" class="flex justify-center">
          <button
            class="px-8 py-3 rounded-xl font-semibold text-sm transition-colors"
            style="background: var(--color-primary); color: white;"
            @click="continueSession"
          >
            Continue → next {{ nextBatchSize }} words
          </button>
        </div>
        <div
          v-else
          class="text-center text-sm py-2"
          style="color: var(--color-text-muted);"
        >
          🎉 You've completed all cards in this selection!
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProgressStore } from '@/stores/progress'
import n5Vocabulary from '@/data/n5_vocabulary.js'
import n4Vocabulary from '@/data/n4_vocabulary.js'
import kanjiData from '@/data/kanji.js'
import DeckSelector from '@/components/flashcard/DeckSelector.vue'
import CategoryFilter from '@/components/flashcard/CategoryFilter.vue'
import FlashCard from '@/components/flashcard/FlashCard.vue'

const progress = useProgressStore()

// 'kanji-n5' | 'kanji-n4' | 'kanji-favorites' | 'favorites' | null
const activeDeck = ref(null)
// null = mixed mode; 'N5' | 'N4' = level mode
const selectedLevel = ref(null)
const selectedCategories = ref([])
const batchOffset = ref(0)
const shuffledPool = ref([])
const currentIndex = ref(0)
let touchStartX = 0

const kanjiN5 = kanjiData.filter(k => k.jlpt === 'N5')
const kanjiN4 = kanjiData.filter(k => k.jlpt === 'N4')
const vocabByLevel = { N5: n5Vocabulary, N4: n4Vocabulary }

const deckType = computed(() =>
  activeDeck.value?.startsWith('kanji') ? 'kanji' : 'vocabulary'
)

const favoritedVocabularyInDeck = computed(() =>
  [...n5Vocabulary, ...n4Vocabulary].filter(w =>
    progress.favoritedVocabulary.includes(`${w.expression}::${w.reading}`)
  )
)

const favoritedKanjiInDeck = computed(() =>
  kanjiData.filter(k => progress.favoritedKanji.includes(k.kanji))
)

const availableCategories = computed(() => {
  if (!selectedLevel.value) return []
  const words = vocabByLevel[selectedLevel.value]
  return [...new Set(words.map(w => w.category))].sort()
})

const categoryCounts = computed(() => {
  if (!selectedLevel.value) return {}
  const words = vocabByLevel[selectedLevel.value]
  return words.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] ?? 0) + 1
    return acc
  }, {})
})

function fisherYates(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sample(arr, n) {
  return fisherYates(arr).slice(0, n)
}

function buildPool() {
  if (activeDeck.value === 'kanji-n5') return fisherYates(kanjiN5)
  if (activeDeck.value === 'kanji-n4') return fisherYates(kanjiN4)
  if (activeDeck.value === 'kanji-favorites') return [...favoritedKanjiInDeck.value]
  if (activeDeck.value === 'favorites') return [...favoritedVocabularyInDeck.value]

  if (!selectedLevel.value) {
    return [...sample(n5Vocabulary, 10), ...sample(n4Vocabulary, 10)]
  }

  let words = vocabByLevel[selectedLevel.value]
  if (selectedCategories.value.length > 0) {
    words = words.filter(w => selectedCategories.value.includes(w.category))
  }
  return fisherYates(words)
}

watch(
  [activeDeck, selectedLevel, selectedCategories,
   () => progress.favoritedVocabulary.length,
   () => progress.favoritedKanji.length],
  () => {
    shuffledPool.value = buildPool()
    batchOffset.value = 0
    currentIndex.value = 0
  },
  { immediate: true }
)

const isSpecialDeck = computed(() =>
  activeDeck.value === 'favorites' || activeDeck.value?.startsWith('kanji')
)

const isMixedMode = computed(() => !activeDeck.value && !selectedLevel.value)

const currentBatch = computed(() => {
  if (isSpecialDeck.value || isMixedMode.value) return shuffledPool.value
  return shuffledPool.value.slice(batchOffset.value, batchOffset.value + 20)
})

const hasMore = computed(() =>
  !isSpecialDeck.value && !isMixedMode.value &&
  batchOffset.value + 20 < shuffledPool.value.length
)

const nextBatchSize = computed(() =>
  Math.min(20, shuffledPool.value.length - batchOffset.value - 20)
)

const currentCard = computed(() => currentBatch.value[currentIndex.value])

function cardId(card) {
  if (deckType.value === 'kanji') return card.kanji
  return `${card.expression}::${card.reading}`
}

const isCurrentKnown = computed(() => {
  if (!currentCard.value) return false
  return progress.flashcardKnown.includes(cardId(currentCard.value))
})

const isCurrentFavorited = computed(() => {
  if (!currentCard.value) return false
  if (deckType.value === 'kanji') return progress.favoritedKanji.includes(currentCard.value.kanji)
  return progress.favoritedVocabulary.includes(cardId(currentCard.value))
})

function toggleFavorite() {
  if (!currentCard.value) return
  if (deckType.value === 'kanji') progress.toggleFavoriteKanji(currentCard.value.kanji)
  else progress.toggleFavoriteVocabulary(cardId(currentCard.value))
}

const knownCount = computed(() =>
  currentBatch.value.filter(card =>
    progress.flashcardKnown.includes(cardId(card))
  ).length
)

const knownPercent = computed(() =>
  currentBatch.value.length > 0
    ? Math.round((knownCount.value / currentBatch.value.length) * 100)
    : 0
)

function onSelectLevel(level) {
  activeDeck.value = null
  selectedLevel.value = level
  selectedCategories.value = []
}

function onSelectSpecialDeck(deckId) {
  selectedLevel.value = null
  selectedCategories.value = []
  activeDeck.value = deckId
}

function onCategoriesChange(cats) {
  selectedCategories.value = cats
}

function reshufflePool() {
  shuffledPool.value = buildPool()
  batchOffset.value = 0
  currentIndex.value = 0
}

function continueSession() {
  batchOffset.value += 20
  currentIndex.value = 0
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < currentBatch.value.length - 1) currentIndex.value++
}

function markCard(known) {
  if (!currentCard.value) return
  progress.recordFlashcardKnown(cardId(currentCard.value), known)
  if (currentIndex.value < currentBatch.value.length - 1) {
    setTimeout(() => { currentIndex.value++ }, 300)
  }
}

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (dx < -50) next()
  else if (dx > 50) prev()
}
</script>
