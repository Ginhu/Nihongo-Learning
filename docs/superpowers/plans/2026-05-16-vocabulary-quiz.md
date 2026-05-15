# Vocabulary Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/vocabulary` route with an active multiple-choice guessing game, and move the existing kanji browser to `/kanji-dictionary`.

**Architecture:** Mirror the flashcards select → session pattern. `VocabularySelectView` collects type/level/direction/difficulty/count/categories and pushes to `VocabularySessionView` via query params. `VocabularyView.vue` is renamed `KanjiDictionaryView.vue` with no logic changes.

**Tech Stack:** Vue 3 Composition API (`<script setup>`), Vite, Pinia, Vue Router (hash mode), Tailwind CSS v3

---

## File Map

| Action | Path |
|---|---|
| Rename (no changes) | `src/views/VocabularyView.vue` → `src/views/KanjiDictionaryView.vue` |
| Modify | `src/router/index.js` |
| Modify | `src/components/layout/AppSidebar.vue` |
| Modify | `src/components/layout/AppBottomNav.vue` |
| Modify | `src/stores/progress.js` |
| Create | `src/components/vocabulary/VocabQuestionCard.vue` |
| Create | `src/components/vocabulary/VocabTipPanel.vue` |
| Create | `src/views/VocabularySelectView.vue` |
| Create | `src/views/VocabularySessionView.vue` |

---

## Task 1: Rename Kanji Dictionary view, update router and nav

**Files:**
- Rename: `src/views/VocabularyView.vue` → `src/views/KanjiDictionaryView.vue`
- Modify: `src/router/index.js`
- Modify: `src/components/layout/AppSidebar.vue`
- Modify: `src/components/layout/AppBottomNav.vue`

- [ ] **Step 1: Create the feature branch**

```bash
git checkout -b feat/vocabulary-quiz
```

- [ ] **Step 2: Rename the file**

```bash
git mv src/views/VocabularyView.vue src/views/KanjiDictionaryView.vue
```

- [ ] **Step 3: Replace the full content of `src/router/index.js`**

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/quiz',
    name: 'quiz-select',
    component: () => import('@/views/QuizSelectView.vue')
  },
  {
    path: '/quiz/:mode',
    name: 'quiz-session',
    component: () => import('@/views/QuizSessionView.vue')
  },
  {
    path: '/flashcards',
    name: 'flashcards',
    component: () => import('@/views/FlashcardSelectView.vue')
  },
  {
    path: '/flashcards/session',
    name: 'flashcards-session',
    component: () => import('@/views/FlashcardsSessionView.vue')
  },
  {
    path: '/vocabulary',
    name: 'vocabulary',
    component: () => import('@/views/VocabularySelectView.vue')
  },
  {
    path: '/vocabulary/session',
    name: 'vocabulary-session',
    component: () => import('@/views/VocabularySessionView.vue')
  },
  {
    path: '/kanji-dictionary',
    name: 'kanji-dictionary',
    component: () => import('@/views/KanjiDictionaryView.vue')
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('@/views/ProgressView.vue')
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
```

- [ ] **Step 4: Replace the `links` array in `src/components/layout/AppSidebar.vue`**

Replace the `links` array (lines 36–42) with:

```js
const links = [
  { name: 'home',             to: '/',                  icon: '🏠', label: 'Home' },
  { name: 'quiz-select',      to: '/quiz',               icon: '🎯', label: 'Quiz' },
  { name: 'flashcards',       to: '/flashcards',         icon: '🃏', label: 'Flashcards' },
  { name: 'vocabulary',       to: '/vocabulary',         icon: '🎮', label: 'Vocabulary Quiz' },
  { name: 'kanji-dictionary', to: '/kanji-dictionary',   icon: '📖', label: 'Kanji Dictionary' },
  { name: 'progress',         to: '/progress',           icon: '📊', label: 'Progress' },
]
```

The active-link highlight uses `route.name === link.name`. For vocabulary-session to also highlight the "Vocabulary Quiz" link, update the `:class` binding in the `RouterLink` inside `AppSidebar.vue`:

Replace:
```js
:class="[route.name === link.name
  ? 'bg-primary text-white'
  : 'hover:bg-primary/10']"
```
With:
```js
:class="[(route.name === link.name || (link.name === 'vocabulary' && route.name === 'vocabulary-session'))
  ? 'bg-primary text-white'
  : 'hover:bg-primary/10']"
```

- [ ] **Step 5: Replace the `links` array in `src/components/layout/AppBottomNav.vue`**

Replace the `links` array (lines 25–31) with:

```js
const links = [
  { name: 'home',             to: '/',                  icon: '🏠', label: 'Home' },
  { name: 'quiz-select',      to: '/quiz',               icon: '🎯', label: 'Quiz' },
  { name: 'flashcards',       to: '/flashcards',         icon: '🃏', label: 'Cards' },
  { name: 'vocabulary',       to: '/vocabulary',         icon: '🎮', label: 'Words' },
  { name: 'kanji-dictionary', to: '/kanji-dictionary',   icon: '📖', label: 'Kanji' },
  { name: 'progress',         to: '/progress',           icon: '📊', label: 'Progress' },
]
```

Also update the active-link `:class` binding in `AppBottomNav.vue` to highlight Words when on the session screen:

Replace:
```js
:class="[route.name === link.name ? 'text-primary' : '']"
```
With:
```js
:class="[(route.name === link.name || (link.name === 'vocabulary' && route.name === 'vocabulary-session')) ? 'text-primary' : '']"
```

- [ ] **Step 6: Verify the app builds**

```bash
npm run build
```

Expected: build succeeds with no errors. The `/vocabulary` route will show a blank page (view not created yet) — that's fine.

- [ ] **Step 7: Commit**

```bash
git add src/views/KanjiDictionaryView.vue src/router/index.js src/components/layout/AppSidebar.vue src/components/layout/AppBottomNav.vue
git commit -m "feat: rename VocabularyView to KanjiDictionaryView, add new routes and nav entries"
```

---

## Task 2: Add `recordVocabQuizResult` to progress store

**Files:**
- Modify: `src/stores/progress.js`

- [ ] **Step 1: Add the new action inside the store function body in `src/stores/progress.js`**

Add after the existing `recordQuizResult` function (after line 66):

```js
function recordVocabQuizResult(mode, score, total, xpTotal) {
  quizHistory.value.unshift({ mode, score, total, date: new Date().toISOString() })
  if (quizHistory.value.length > 50) quizHistory.value.pop()
  const newLevel = addXp(xpTotal)
  checkStreak()
  return { xpGained: xpTotal, newLevel }
}
```

- [ ] **Step 2: Export the new action from the return statement**

In the `return` statement (currently line 116–121), add `recordVocabQuizResult` to the returned object:

```js
return {
  xp, level, streak, lastPlayedDate,
  quizHistory, characterStats, flashcardKnown, favoritedKanji, favoritedVocabulary,
  levelTitle, weakCharacters,
  addXp, recordQuizResult, recordVocabQuizResult, recordFlashcardKnown,
  toggleFavoriteKanji, toggleFavoriteVocabulary, checkStreak
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/stores/progress.js
git commit -m "feat: add recordVocabQuizResult to progress store"
```

---

## Task 3: VocabQuestionCard component

**Files:**
- Create: `src/components/vocabulary/VocabQuestionCard.vue`

This component displays the question prompt. It receives the current item, type, and direction and renders accordingly.

- [ ] **Step 1: Create `src/components/vocabulary/VocabQuestionCard.vue`**

```vue
<template>
  <div class="text-center py-8 min-h-[140px] flex flex-col items-center justify-center">

    <!-- Kanji, word→meaning: show kanji + readings -->
    <template v-if="type === 'kanji' && direction === 'word-meaning'">
      <div class="text-7xl font-bold mb-3" style="color: var(--color-text);">{{ item.kanji }}</div>
      <div class="text-sm" style="color: var(--color-text-muted);">
        <span v-if="item.onyomi.length">音: {{ item.onyomi.join('・') }}</span>
        <span v-if="item.onyomi.length && item.kunyomi.length"> · </span>
        <span v-if="item.kunyomi.length">訓: {{ item.kunyomi.join('・') }}</span>
      </div>
    </template>

    <!-- Vocab, word→meaning: show expression + reading -->
    <template v-else-if="type === 'vocab' && direction === 'word-meaning'">
      <div class="text-5xl font-bold mb-2" style="color: var(--color-text);">{{ item.expression }}</div>
      <div class="text-xl" style="color: var(--color-text-muted);">{{ item.reading }}</div>
    </template>

    <!-- Both types, meaning→word: show the English meaning -->
    <template v-else>
      <div class="text-2xl font-semibold px-4 leading-snug" style="color: var(--color-text);">
        {{ type === 'kanji' ? item.meaning[0] : item.meaning }}
      </div>
      <div class="text-xs mt-2" style="color: var(--color-text-muted);">— What is this in Japanese?</div>
    </template>

  </div>
</template>

<script setup>
defineProps({
  item:      { type: Object,  required: true },
  type:      { type: String,  required: true }, // 'vocab' | 'kanji'
  direction: { type: String,  required: true }, // 'word-meaning' | 'meaning-word'
})
</script>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/vocabulary/VocabQuestionCard.vue
git commit -m "feat: add VocabQuestionCard component"
```

---

## Task 4: VocabTipPanel component

**Files:**
- Create: `src/components/vocabulary/VocabTipPanel.vue`

Kanji-only. Shows Tip 1/2/3 buttons (up to `examples.length`). Tips must be revealed in order. Each revealed tip shows the example. Buttons disabled after answering.

- [ ] **Step 1: Create `src/components/vocabulary/VocabTipPanel.vue`**

```vue
<template>
  <div v-if="examples && examples.length > 0" class="mt-4">

    <!-- Tip buttons -->
    <div class="flex gap-2 flex-wrap mb-3">
      <button
        v-for="(_, i) in examples"
        :key="i"
        :disabled="answered || i !== tipsUsed"
        class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
        :class="{
          'opacity-50 cursor-default':                    i < tipsUsed,
          'border-primary/60 hover:bg-primary/10':        i === tipsUsed && !answered,
          'opacity-30 cursor-not-allowed border-border':  i > tipsUsed || answered
        }"
        style="border-color: var(--color-border);"
        @click="onUseTip"
      >
        Tip {{ i + 1 }}
      </button>
    </div>

    <!-- Revealed examples -->
    <div
      v-for="i in tipsUsed"
      :key="i"
      class="text-sm p-3 rounded-xl mb-2"
      style="background: var(--color-surface-2); color: var(--color-text-muted);"
    >
      <span class="font-semibold" style="color: var(--color-text);">{{ examples[i - 1].word }}</span>
      ({{ examples[i - 1].reading }}) — {{ examples[i - 1].meaning }}
    </div>

  </div>
</template>

<script setup>
defineProps({
  examples:  { type: Array,   required: true },
  tipsUsed:  { type: Number,  required: true }, // 0–3
  answered:  { type: Boolean, default: false },
})

const emit = defineEmits(['use-tip'])

function onUseTip() {
  emit('use-tip')
}
</script>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/vocabulary/VocabTipPanel.vue
git commit -m "feat: add VocabTipPanel component"
```

---

## Task 5: VocabularySelectView

**Files:**
- Create: `src/views/VocabularySelectView.vue`

Selection screen at `/vocabulary`. Mirrors `FlashcardSelectView` with additional Direction and Difficulty sections.

- [ ] **Step 1: Create `src/views/VocabularySelectView.vue`**

```vue
<template>
  <div class="max-w-lg mx-auto px-4 py-6 flex flex-col gap-8">

    <div>
      <h1 class="text-2xl font-bold mb-1">Vocabulary Quiz</h1>
      <p class="text-sm" style="color: var(--color-text-muted);">
        Test your knowledge. Guess the meaning — or the word.
      </p>
    </div>

    <!-- Type -->
    <div>
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">Type</div>
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
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">Level</div>
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
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">Direction</div>
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
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">Difficulty</div>
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
        Categories <span class="normal-case font-normal">(optional)</span>
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
      <div class="text-xs font-semibold mb-3 uppercase tracking-wide" style="color: var(--color-text-muted);">Questions per round</div>
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
      :disabled="poolSize < 2"
      @click="startSession"
    >Start →</button>

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

const router   = useRouter()
const progress = useProgressStore()

const selectedType       = ref('vocab')
const selectedLevel      = ref('all')
const selectedDirection  = ref('word-meaning')
const selectedDifficulty = ref('normal')
const selectedCategories = ref([])
const selectedCount      = ref('all')

const types = [
  { value: 'vocab', label: 'Vocabulary' },
  { value: 'kanji', label: 'Kanji' },
]

const directions = [
  { value: 'word-meaning', label: 'Word → Meaning' },
  { value: 'meaning-word', label: 'Meaning → Word' },
]

const difficulties = [
  { value: 'easy',   label: 'Easy' },
  { value: 'normal', label: 'Normal' },
  { value: 'hard',   label: 'Hard' },
]

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
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, navigate to `/vocabulary`. Confirm:
- All five sections render
- Type toggle resets level when switching
- Difficulty subtitle shows "2 / 4 / 6 options"
- Categories appear only for Vocab + N5/N4
- Count picker updates when level/type/category changes
- Start button pushes to `#/vocabulary/session?...` (page will show "No active session" until Task 6 is done)

- [ ] **Step 3: Commit**

```bash
git add src/views/VocabularySelectView.vue
git commit -m "feat: add VocabularySelectView with type/level/direction/difficulty/category/count selection"
```

---

## Task 6: VocabularySessionView

**Files:**
- Create: `src/views/VocabularySessionView.vue`

The full game loop. Reads all config from `route.query`, builds and shuffles the pool, generates per-question options, tracks tips and XP, auto-advances after answer, shows end screen.

- [ ] **Step 1: Create `src/views/VocabularySessionView.vue`**

```vue
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
          <div class="text-3xl font-black text-white mb-3">Level Up!</div>
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
          :examples="currentQ.item.examples ?? []"
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
        Correct: <strong style="color: var(--color-text);">{{ currentQ.correctAnswer }}</strong>
      </div>

    </template>

    <!-- No session fallback -->
    <div v-else class="text-center py-10">
      <p style="color: var(--color-text-muted);">No active session.</p>
      <button
        class="mt-4 px-6 py-2 rounded-xl bg-primary text-white font-semibold"
        @click="router.push({ name: 'vocabulary' })"
      >Choose a quiz</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProgressStore } from '@/stores/progress'
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
    return type === 'kanji' ? item.meaning[0] : item.meaning
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

const currentIndex  = ref(0)
const answered      = ref(false)
const selectedAnswer = ref(null)
const tipsUsed      = ref(0)
const score         = ref(0)
const totalXp       = ref(0)
const startTime     = Date.now()

const showEndScreen = ref(false)
const sessionResult = ref(null)
const showLevelUp   = ref(false)
const levelUpData   = ref({ level: 1, title: '' })

let advanceTimer = null

const currentQ = computed(() => questions.value[currentIndex.value])

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
  if (answered.value || tipsUsed.value >= (currentQ.value.item.examples?.length ?? 0)) return
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
  const fresh = buildQuestions(pool)
  questions.value    = fresh
  currentIndex.value = 0
  answered.value     = false
  selectedAnswer.value = null
  tipsUsed.value     = 0
  score.value        = 0
  totalXp.value      = 0
  showEndScreen.value = false
  sessionResult.value = null
}

onUnmounted(() => clearTimeout(advanceTimer))
</script>
```

- [ ] **Step 2: Verify in browser — golden path**

Run `npm run dev`. Navigate to `/vocabulary`:
1. Select Vocabulary → All → Word → Meaning → Normal → 10 → Start
2. A question appears showing a Japanese word + reading
3. Four answer buttons render
4. Tap correct answer → turns green → auto-advances after ~1s
5. Tap wrong answer → turns red, correct turns green → auto-advances after ~1.5s
6. After 10 questions → end screen with score, time, XP

- [ ] **Step 3: Verify kanji + tips**

1. Back to selection → select Kanji → N5 → Word → Meaning → Normal → 10 → Start
2. A kanji appears with onyomi/kunyomi
3. "Tip 1", "Tip 2", "Tip 3" buttons appear below the card
4. Tap Tip 1 → example reveals, Tip 1 button dims, Tip 2 becomes active
5. Answer → all tip buttons disable → auto-advance
6. Complete session → end screen shows reduced XP if tips were used

- [ ] **Step 4: Verify meaning→word direction**

1. Selection → Vocabulary → N5 → Meaning → Word → Normal → 10 → Start
2. Question shows English meaning
3. Options show `expression (reading)` strings

- [ ] **Step 5: Verify no-query redirect**

Navigate directly to `/#/vocabulary/session` with no query params — should show "No active session" with a link back to selection.

- [ ] **Step 6: Commit**

```bash
git add src/views/VocabularySessionView.vue
git commit -m "feat: add VocabularySessionView with guessing game, tips, XP, and auto-advance"
```

---

## Task 7: Final integration — merge to main

- [ ] **Step 1: Full smoke test**

Run `npm run dev` and verify:
- `/vocabulary` → selection screen
- `/vocabulary/session` (from Start) → game works end-to-end
- `/kanji-dictionary` → kanji grid + detail modal unchanged
- Sidebar shows "Vocabulary Quiz" (🎮) and "Kanji Dictionary" (📖)
- Bottom nav shows "Words" (🎮) and "Kanji" (📖)
- Level-up overlay fires when crossing an XP threshold
- XP appears on the Progress page after completing a round

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: no errors or warnings about missing imports.

- [ ] **Step 3: Push feature branch and merge**

```bash
git push origin feat/vocabulary-quiz
git checkout main
git merge --no-ff feat/vocabulary-quiz -m "feat: vocabulary quiz — guessing game with tips and XP"
git push origin main
git branch -d feat/vocabulary-quiz
git push origin --delete feat/vocabulary-quiz
```

- [ ] **Step 4: Update CLAUDE.md**

In `CLAUDE.md`, add a row to the Completed Phases table:

```
| `feat/vocabulary-quiz` | ✅ merged to main | Vocabulary quiz game at `/vocabulary`: select type/level/direction/difficulty/count/categories; multiple-choice guessing game with auto-advance; kanji tips (Tip 1/2/3) with tiered XP; kanji browser moved to `/kanji-dictionary` |
```

And append to the Changelog section:

```markdown
### 2026-05-16 — feat/vocabulary-quiz
- `VocabularySelectView.vue` (new): selection screen at `/vocabulary` — type (Vocab/Kanji), level, direction (Word→Meaning / Meaning→Word), difficulty (Easy 2 / Normal 4 / Hard 6 options), categories (vocab only), count per round
- `VocabularySessionView.vue` (new): game session at `/vocabulary/session` — multiple-choice with auto-advance (1s correct / 1.5s wrong); level-up overlay; `QuizEndScreen` reuse
- `VocabQuestionCard.vue` (new): renders prompt based on type × direction
- `VocabTipPanel.vue` (new): kanji-only sequential tip reveal with tiered XP (100% / 80% / 40% / 10%)
- `KanjiDictionaryView.vue` (renamed from `VocabularyView.vue`): kanji browser at `/kanji-dictionary`, no logic changes
- Progress store: `recordVocabQuizResult(mode, score, total, xpTotal)` added
- Nav: "Vocabulary Quiz" + "Kanji Dictionary" entries in sidebar and bottom nav
```
