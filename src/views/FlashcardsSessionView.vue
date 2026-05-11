<template>
  <div class="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

    <button
      class="self-start text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
      style="color: var(--color-text-muted);"
      @click="router.push({ name: 'flashcards' })"
    >
      ← Back
    </button>

    <div v-if="!isConfigValid || currentBatch.length === 0" class="text-center py-16" style="color: var(--color-text-muted);">
      <div class="text-4xl mb-3">📭</div>
      <p>No cards in this deck yet.</p>
      <p v-if="queryLevel === 'favorites' || queryLevel === 'kanji-favorites'" class="text-sm mt-1">
        Favorite some cards to see them here.
      </p>
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
        >✗ Needs Practice</button>
        <button
          class="flex-1 max-w-[160px] py-3 rounded-xl border font-semibold text-sm transition-colors"
          :class="isCurrentKnown ? 'border-green-500 bg-green-500/20 text-green-600' : 'hover:bg-green-500/10 hover:border-green-400'"
          style="border-color: var(--color-border);"
          @click="markCard(true)"
        >✓ Known</button>
      </div>

      <div v-if="queryLevel !== 'favorites' && queryLevel !== 'kanji-favorites'" class="flex justify-center">
        <button
          class="px-6 py-2 rounded-xl border text-sm font-semibold transition-colors"
          :class="isCurrentFavorited ? 'border-primary bg-primary/20 text-primary' : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="toggleFavorite"
        >{{ isCurrentFavorited ? '♥ Favorited' : '♡ Favorite' }}</button>
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
    </template>

    <BatchResultModal
      v-if="showModal"
      :batch-known="batchKnown"
      :batch-practice="batchPractice"
      :has-more="hasMore"
      @continue="continueSession"
      @back="router.push({ name: 'flashcards' })"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProgressStore } from '@/stores/progress'
import n5Vocabulary from '@/data/n5_vocabulary.js'
import n4Vocabulary from '@/data/n4_vocabulary.js'
import kanjiN5Data from '@/data/n5_kanji.js'
import kanjiN4Data from '@/data/n4_kanji.js'
import FlashCard from '@/components/flashcard/FlashCard.vue'
import BatchResultModal from '@/components/flashcard/BatchResultModal.vue'

const route = useRoute()
const router = useRouter()
const progress = useProgressStore()

const isConfigValid = !!route.query.type

onMounted(() => {
  if (!isConfigValid) router.replace({ name: 'flashcards' })
})

// Parse query — all values are fixed for the lifetime of this session
const queryType  = route.query.type  ?? 'vocab'  // 'vocab' | 'kanji'
const queryLevel = route.query.level ?? 'all'     // 'all' | 'N5' | 'N4' | 'favorites' | 'kanji-favorites'
const queryCount = route.query.count              // number string | 'all' | undefined
const queryCategories = route.query.categories
  ? route.query.categories.split(',')
  : []

const isKanji  = queryType === 'kanji'
const deckType = isKanji ? 'kanji' : 'vocabulary'
const batchSize = !queryCount || queryCount === 'all' ? Infinity : Number(queryCount)

// Session state
const shuffledPool  = ref([])
const batchOffset   = ref(0)
const currentIndex  = ref(0)
const batchKnown    = ref(0)
const batchPractice = ref(0)
const showModal     = ref(false)
let touchStartX = 0

function fisherYates(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPool() {
  if (queryLevel === 'kanji-favorites') {
    return [...kanjiN5Data, ...kanjiN4Data].filter(k =>
      progress.favoritedKanji.includes(k.kanji)
    )
  }
  if (queryLevel === 'favorites') {
    return [...n5Vocabulary, ...n4Vocabulary].filter(w =>
      progress.favoritedVocabulary.includes(`${w.expression}::${w.reading}`)
    )
  }
  if (isKanji) {
    const pool = queryLevel === 'N5' ? [...kanjiN5Data]
               : queryLevel === 'N4' ? [...kanjiN4Data]
               : [...kanjiN5Data, ...kanjiN4Data]
    return fisherYates(pool)
  }
  let words = queryLevel === 'N5' ? [...n5Vocabulary]
            : queryLevel === 'N4' ? [...n4Vocabulary]
            : [...n5Vocabulary, ...n4Vocabulary]
  if (queryCategories.length > 0) {
    words = words.filter(w => queryCategories.includes(w.category))
  }
  return fisherYates(words)
}

// Build pool once on mount
shuffledPool.value = buildPool()

const currentBatch = computed(() =>
  shuffledPool.value.slice(batchOffset.value, batchOffset.value + batchSize)
)

const hasMore = computed(() =>
  batchSize !== Infinity && batchOffset.value + batchSize < shuffledPool.value.length
)

const currentCard = computed(() => currentBatch.value[currentIndex.value])

function cardId(card) {
  if (isKanji) return card.kanji
  return `${card.expression}::${card.reading}`
}

const isCurrentKnown = computed(() =>
  !!currentCard.value && progress.flashcardKnown.includes(cardId(currentCard.value))
)

const isCurrentFavorited = computed(() => {
  if (!currentCard.value) return false
  if (isKanji) return progress.favoritedKanji.includes(currentCard.value.kanji)
  return progress.favoritedVocabulary.includes(cardId(currentCard.value))
})

function toggleFavorite() {
  if (!currentCard.value) return
  if (isKanji) progress.toggleFavoriteKanji(currentCard.value.kanji)
  else progress.toggleFavoriteVocabulary(cardId(currentCard.value))
}

const knownCount = computed(() =>
  currentBatch.value.filter(c => progress.flashcardKnown.includes(cardId(c))).length
)

const knownPercent = computed(() =>
  currentBatch.value.length > 0
    ? Math.round((knownCount.value / currentBatch.value.length) * 100)
    : 0
)

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < currentBatch.value.length - 1) currentIndex.value++
}

function markCard(known) {
  if (!currentCard.value) return
  progress.recordFlashcardKnown(cardId(currentCard.value), known)
  if (known) batchKnown.value++
  else batchPractice.value++

  if (currentIndex.value === currentBatch.value.length - 1) {
    showModal.value = true
  } else {
    setTimeout(() => { currentIndex.value++ }, 300)
  }
}

function continueSession() {
  batchOffset.value += batchSize
  currentIndex.value = 0
  batchKnown.value = 0
  batchPractice.value = 0
  showModal.value = false
}

function reshufflePool() {
  shuffledPool.value = buildPool()
  batchOffset.value = 0
  currentIndex.value = 0
  batchKnown.value = 0
  batchPractice.value = 0
  showModal.value = false
}

function onTouchStart(e) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (dx < -50) next()
  else if (dx > 50) prev()
}
</script>
