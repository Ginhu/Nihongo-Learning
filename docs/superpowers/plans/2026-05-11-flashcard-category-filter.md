# Flashcard Category Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add category filtering, 20-card batch sessions with Continue, and enriched card back (pos + jlpt) to the vocabulary flashcard section.

**Architecture:** A new `CategoryFilter.vue` handles the collapsible multi-select UI. `DeckSelector.vue` gains level-toggle behavior (N5/N4 deselectable, emits `select-level`). `FlashcardsView` owns all filter state (`selectedLevel`, `selectedCategories`, `batchOffset`) and builds a shuffled `sessionPool` from which `currentBatch` is sliced. `FlashCard.vue` vocabulary back gets two new pill badges.

**Tech Stack:** Vue 3 Composition API (`<script setup>`), Pinia, Tailwind CSS v3, CSS variables from `main.css`

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/components/flashcard/CategoryFilter.vue` | Collapsible multi-select category chips with word counts |
| Modify | `src/components/flashcard/DeckSelector.vue` | Level toggles for N5/N4 vocab (deselectable), new `select-level` emit |
| Modify | `src/views/FlashcardsView.vue` | Filter state, session pool, batch/Continue logic, wires both components |
| Modify | `src/components/flashcard/FlashCard.vue` | pos badge + jlpt tag on vocabulary back face |

---

## Task 1: Create `CategoryFilter.vue`

**Files:**
- Create: `src/components/flashcard/CategoryFilter.vue`

- [ ] **Step 1: Create the file with this exact content**

```vue
<template>
  <div v-if="availableCategories.length > 0" class="flex flex-col gap-2">
    <button
      class="flex items-center gap-2 text-sm font-medium self-start px-3 py-1.5 rounded-lg border transition-colors hover:bg-primary/10"
      style="border-color: var(--color-border); color: var(--color-text-muted);"
      @click="open = !open"
    >
      <span>{{ open ? '▲' : '▼' }}</span>
      Filter by category
      <span
        v-if="selectedCategories.length > 0"
        class="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
        style="background: var(--color-primary); color: white;"
      >
        {{ selectedCategories.length }}
      </span>
    </button>

    <div v-if="open" class="flex flex-wrap gap-2">
      <button
        v-for="cat in availableCategories"
        :key="cat"
        class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
        :class="selectedCategories.includes(cat)
          ? 'bg-primary text-white border-primary'
          : 'hover:bg-primary/10'"
        style="border-color: var(--color-border);"
        @click="toggle(cat)"
      >
        {{ formatCategory(cat) }} ({{ categoryCounts[cat] ?? 0 }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  availableCategories: { type: Array, required: true },
  selectedCategories:  { type: Array, required: true },
  categoryCounts:      { type: Object, required: true }
})

const emit = defineEmits(['update:selectedCategories'])

const open = ref(false)

function formatCategory(key) {
  return key
    .replace(/_and_/g, ' & ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function toggle(cat) {
  const next = props.selectedCategories.includes(cat)
    ? props.selectedCategories.filter(c => c !== cat)
    : [...props.selectedCategories, cat]
  emit('update:selectedCategories', next)
}
</script>
```

- [ ] **Step 2: Verify in browser**

Start the dev server if not running: `npm run dev`

Navigate to `/flashcards`. The component is not wired yet — this step just ensures no import errors exist when it's added in Task 3. No visual change expected yet.

- [ ] **Step 3: Commit**

```bash
git checkout -b feat/flashcard-category-filter
git add src/components/flashcard/CategoryFilter.vue
git commit -m "feat: add CategoryFilter component with collapsible multi-select chips"
```

---

## Task 2: Update `DeckSelector.vue`

**Files:**
- Modify: `src/components/flashcard/DeckSelector.vue`

Current behavior: vocab buttons emit `select` with `'vocab-n5'` / `'vocab-n4'`.  
New behavior: vocab buttons are level toggles — clicking the active level emits `select-level` with `null`; clicking an inactive level emits `select-level` with `'N5'` or `'N4'`. Kanji/favorites keep the existing `select` emit.

- [ ] **Step 1: Replace the full file content**

```vue
<template>
  <div class="flex flex-col gap-3">
    <div>
      <div class="text-xs font-semibold mb-1.5 uppercase tracking-wide" style="color: var(--color-text-muted);">Vocabulary</div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="lvl in vocabLevels"
          :key="lvl.id"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="selectedLevel === lvl.id
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="$emit('select-level', selectedLevel === lvl.id ? null : lvl.id)"
        >
          {{ lvl.label }}
        </button>
        <button
          v-if="hasFavorites"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="activeDeck === 'favorites'
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="$emit('select', 'favorites')"
        >
          ★ Favorites
        </button>
      </div>
    </div>

    <div>
      <div class="text-xs font-semibold mb-1.5 uppercase tracking-wide" style="color: var(--color-text-muted);">Kanji</div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="deck in kanjiDecks"
          :key="deck.id"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="activeDeck === deck.id
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="$emit('select', deck.id)"
        >
          {{ deck.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeDeck:        { type: String, default: null },
  selectedLevel:     { type: String, default: null },
  hasFavorites:      { type: Boolean, default: false },
  hasKanjiFavorites: { type: Boolean, default: false }
})

defineEmits(['select', 'select-level'])

const vocabLevels = [
  { id: 'N5', label: 'N5' },
  { id: 'N4', label: 'N4' },
]

const kanjiDecks = computed(() => [
  { id: 'kanji-n5', label: 'N5' },
  { id: 'kanji-n4', label: 'N4' },
  ...(props.hasKanjiFavorites ? [{ id: 'kanji-favorites', label: '★ Favorites' }] : [])
])
</script>
```

- [ ] **Step 2: Verify in browser**

Navigate to `/flashcards`. The deck selector should render. The N5/N4 vocab buttons will not highlight correctly yet (FlashcardsView still passes the old props). Kanji buttons and Favorites should still work. No errors in console.

- [ ] **Step 3: Commit**

```bash
git add src/components/flashcard/DeckSelector.vue
git commit -m "feat: DeckSelector vocab buttons become level toggles with select-level emit"
```

---

## Task 3: Rewrite `FlashcardsView.vue` state and template

**Files:**
- Modify: `src/views/FlashcardsView.vue`

This is the largest change. Replace the full file.

Key decisions:
- `activeDeck` now only holds kanji/favorites deck IDs or `null` (not `'vocab-n5'`/`'vocab-n4'`)
- `selectedLevel` (`null | 'N5' | 'N4'`) drives vocab mode
- When user selects a level, `activeDeck` is set to `null`; when user selects a kanji/favorites deck, `selectedLevel` is set to `null`
- `shuffledPool` is a ref updated by a watcher; `currentBatch` slices it
- Mixed mode (both null) = 10 random N5 + 10 random N4, always exactly 20, no Continue

- [ ] **Step 1: Replace the full file content**

```vue
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
          v-else-if="batchOffset > 0"
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
```

- [ ] **Step 2: Verify in browser — mixed mode (default)**

Navigate to `/flashcards`. No level button should be highlighted. Should see 20 cards (10 N5 + 10 N4 mixed). No category filter visible. Prev/Next work. Known/Needs Practice works.

- [ ] **Step 3: Verify — N5 level mode**

Click N5. N5 button highlights. Category filter toggle appears. No categories selected → shows first 20 cards of shuffled N5 pool. At card 20: "Continue → next X words" button appears. Click Continue → next 20 loads, index resets to 1.

- [ ] **Step 4: Verify — category filter**

With N5 selected, click "Filter by category". Chips appear with category names and counts. Select "Time & Calendar". Cards filter to only time/calendar words. If ≤ 20 words: no Continue. If > 20: Continue appears at last card.

- [ ] **Step 5: Verify — multi-category**

Select both "Time & Calendar" and "Food & Drink". Cards from both categories appear in the deck.

- [ ] **Step 6: Verify — level switch resets categories**

With N5 + categories selected, click N4. Categories reset, N4 words load.

- [ ] **Step 7: Verify — kanji and favorites unchanged**

Click Kanji N5, Kanji N4, ★ Favorites (if favorited). All work as before. Category filter hidden.

- [ ] **Step 8: Commit**

```bash
git add src/views/FlashcardsView.vue
git commit -m "feat: category filter, batch sessions, and Continue button in FlashcardsView"
```

---

## Task 4: Update `FlashCard.vue` vocabulary back face

**Files:**
- Modify: `src/components/flashcard/FlashCard.vue`

Add a `pos` pill badge and a `jlpt` tag below the meaning on the vocabulary back face.

- [ ] **Step 1: Replace only the vocabulary back template block**

Find this block in `FlashCard.vue` (lines 62–75):

```vue
        <template v-else-if="type === 'vocabulary'">
          <div
            class="font-bold text-center select-none"
            style="font-size: clamp(32px, 8vw, 56px); line-height: 1.2;"
          >
            {{ card.expression }}
          </div>
          <div class="mt-3 text-xl font-medium" style="color: var(--color-text-muted);">
            {{ card.reading }}
          </div>
          <div class="mt-6 text-2xl font-semibold text-center">
            {{ card.meaning }}
          </div>
        </template>
```

Replace it with:

```vue
        <template v-else-if="type === 'vocabulary'">
          <div
            class="font-bold text-center select-none"
            style="font-size: clamp(32px, 8vw, 56px); line-height: 1.2;"
          >
            {{ card.expression }}
          </div>
          <div class="mt-3 text-xl font-medium" style="color: var(--color-text-muted);">
            {{ card.reading }}
          </div>
          <div class="mt-6 text-2xl font-semibold text-center">
            {{ card.meaning }}
          </div>
          <div class="mt-4 flex gap-2 justify-center flex-wrap">
            <span
              v-if="card.pos"
              class="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
              style="background: var(--color-surface-2); color: var(--color-text-muted);"
            >
              {{ card.pos }}
            </span>
            <span
              v-if="card.jlpt"
              class="px-2.5 py-1 rounded-full text-xs font-semibold border"
              style="border-color: var(--color-accent); color: var(--color-accent);"
            >
              {{ card.jlpt }}
            </span>
          </div>
        </template>
```

- [ ] **Step 2: Verify in browser**

Navigate to `/flashcards`, select N5. Flip any card. Back face should show: expression (large), reading (muted), meaning (bold), then two pills: one showing part of speech (e.g., "noun") and one showing "N5" with an accent color border. Kanji cards are unaffected.

- [ ] **Step 3: Commit**

```bash
git add src/components/flashcard/FlashCard.vue
git commit -m "feat: add pos badge and jlpt tag to vocabulary flashcard back"
```

---

## Task 5: Final QA and merge

- [ ] **Step 1: Full end-to-end walkthrough**

Check each scenario:
- Page load: mixed mode, 20 cards, no level highlighted, no category filter
- N5: 20 cards, category toggle visible, progress bar shows X/20
- N5 + category with > 20 words: Continue button at card 20, loads next batch
- N5 + category with ≤ 20 words: no Continue, completes normally
- N5 + multi-category: union of both category word sets
- Level switch: categories reset, new pool
- Clicking active N5 again: returns to mixed mode, category filter disappears
- Favorites (vocab): unchanged behavior
- Kanji N5/N4/Favorites: unchanged behavior
- Flip vocabulary card: pos and jlpt pills visible on back

- [ ] **Step 2: Check dark mode**

Toggle dark mode. All new UI (category chips, Continue button, pills) should respect CSS variables.

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git merge --no-ff feat/flashcard-category-filter -m "feat: vocabulary category filter, batch sessions, enriched card back"
git branch -d feat/flashcard-category-filter
git push origin main
git push origin --delete feat/flashcard-category-filter
```

- [ ] **Step 4: Update CLAUDE.md**

In the Completed Phases table, add a row for `feat/flashcard-category-filter`. Append a dated entry to the Changelog section. (CLAUDE.md is gitignored — do not commit it.)
