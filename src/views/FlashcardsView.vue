<template>
  <div class="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

    <DeckSelector
      :active-deck="activeDeck"
      :has-favorites="favoritedKanjiInDeck.length > 0 || activeDeck === 'favorites'"
      @select="switchDeck"
    />

    <div v-if="deck.length === 0" class="text-center py-16" style="color: var(--color-text-muted);">
      <div class="text-4xl mb-3">📭</div>
      <p>No cards in this deck yet.</p>
      <p v-if="activeDeck === 'favorites'" class="text-sm mt-1">Add kanji from the Vocabulary page.</p>
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
          {{ knownCount }} / {{ deck.length }} known
        </span>
      </div>

      <div class="flex items-center justify-between text-sm" style="color: var(--color-text-muted);">
        <span>Card {{ currentIndex + 1 }} of {{ deck.length }}</span>
        <button
          class="text-xs px-2 py-1 rounded border transition-colors hover:bg-primary/10"
          style="border-color: var(--color-border);"
          @click="shuffle"
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
          :disabled="currentIndex === deck.length - 1"
          @click="next"
        >Next →</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import hiragana from '@/data/hiragana.js'
import katakana from '@/data/katakana.js'
import kanji from '@/data/kanji.js'
import DeckSelector from '@/components/flashcard/DeckSelector.vue'
import FlashCard from '@/components/flashcard/FlashCard.vue'

const progress = useProgressStore()

const activeDeck = ref('hiragana')
const currentIndex = ref(0)
const shuffledOrder = ref(null) // null = use natural order; array = shuffled indices
let touchStartX = 0

const deckMap = {
  hiragana:   hiragana,
  katakana:   katakana,
  'kanji-n5': kanji.filter(k => k.jlpt === 'N5'),
  'kanji-n4': kanji.filter(k => k.jlpt === 'N4'),
}

const favoritedKanjiInDeck = computed(() =>
  kanji.filter(k => progress.favoritedKanji.includes(k.kanji))
)

const rawDeck = computed(() => {
  if (activeDeck.value === 'favorites') return favoritedKanjiInDeck.value
  return deckMap[activeDeck.value] ?? []
})

const deck = computed(() => {
  if (!shuffledOrder.value) return rawDeck.value
  return shuffledOrder.value.map(i => rawDeck.value[i]).filter(Boolean)
})

const deckType = computed(() => {
  if (activeDeck.value === 'hiragana') return 'hiragana'
  if (activeDeck.value === 'katakana') return 'katakana'
  return 'kanji'
})

const currentCard = computed(() => deck.value[currentIndex.value])

function cardId(card) {
  return deckType.value === 'kanji' ? card.kanji : card.kana
}

const isCurrentKnown = computed(() => {
  if (!currentCard.value) return false
  return progress.flashcardKnown.includes(cardId(currentCard.value))
})

const knownCount = computed(() =>
  deck.value.filter(card => {
    const id = deckType.value === 'kanji' ? card.kanji : card.kana
    return progress.flashcardKnown.includes(id)
  }).length
)

const knownPercent = computed(() =>
  deck.value.length > 0 ? Math.round((knownCount.value / deck.value.length) * 100) : 0
)

function switchDeck(deckId) {
  activeDeck.value = deckId
  currentIndex.value = 0
  shuffledOrder.value = null
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < deck.value.length - 1) currentIndex.value++
}

function markCard(known) {
  if (!currentCard.value) return
  progress.recordFlashcardKnown(cardId(currentCard.value), known)
  if (currentIndex.value < deck.value.length - 1) {
    setTimeout(() => { currentIndex.value++ }, 300)
  }
}

function shuffle() {
  const n = rawDeck.value.length
  const order = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]]
  }
  shuffledOrder.value = order
  currentIndex.value = 0
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
