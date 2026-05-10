# Phase 3 — Vocabulary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the kanji vocabulary browser — filterable/searchable grid of all 56 kanji, detail modal with readings and examples, and "Add to Flashcard Deck" toggle that persists to `progressStore.favoritedKanji`.

**Architecture:** VocabularyView owns all filter/search/selection state. KanjiCard is a pure presentational card for the grid. KanjiDetailModal receives the selected kanji and isFavorited as props, emits `close` and `toggle-favorite`. The progress store already has `toggleFavoriteKanji(kanjiChar)` and `favoritedKanji` state — no store changes needed.

**Tech Stack:** Vue 3 Composition API, Pinia (`useProgressStore`), Tailwind CSS, `<Teleport>` for modal

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/vocabulary/KanjiCard.vue` | Modify | Grid card — kanji char, meaning, JLPT badge, stroke count |
| `src/components/vocabulary/KanjiDetailModal.vue` | Modify | Full-screen overlay modal — readings, examples, favorite toggle |
| `src/views/VocabularyView.vue` | Modify | Filter/search state, grid layout, modal open/close |

---

## Task 1: Create feat/vocabulary branch

- [ ] **Create and switch to feat/vocabulary branch**

```bash
git checkout main && git checkout -b feat/vocabulary
```

Expected: `Switched to a new branch 'feat/vocabulary'`

---

## Task 2: Implement KanjiCard.vue

**Files:**
- Modify: `src/components/vocabulary/KanjiCard.vue`

- [ ] **Replace KanjiCard.vue with full implementation**

```vue
<template>
  <button
    class="w-full rounded-xl border p-4 flex flex-col items-center gap-2 transition-colors hover:bg-primary/5 text-left cursor-pointer"
    style="background: var(--color-surface); border-color: var(--color-border);"
    @click="$emit('click')"
  >
    <!-- JLPT badge (top-right) -->
    <span
      class="self-end text-xs font-bold px-2 py-0.5 rounded-full"
      :class="kanji.jlpt === 'N5' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
    >{{ kanji.jlpt }}</span>

    <!-- Large kanji character -->
    <div class="font-bold select-none" style="font-size: clamp(48px, 10vw, 72px); line-height: 1;">
      {{ kanji.kanji }}
    </div>

    <!-- Primary meanings (first 2) -->
    <div class="text-sm text-center" style="color: var(--color-text-muted);">
      {{ kanji.meaning.slice(0, 2).join(', ') }}
    </div>

    <!-- Stroke count -->
    <div class="text-xs" style="color: var(--color-text-muted);">
      {{ kanji.strokeCount }} strokes
    </div>
  </button>
</template>

<script setup>
defineProps({
  kanji: { type: Object, required: true }
})
defineEmits(['click'])
</script>
```

---

## Task 3: Implement KanjiDetailModal.vue

**Files:**
- Modify: `src/components/vocabulary/KanjiDetailModal.vue`

The modal uses `<Teleport to="body">` so it renders outside the normal DOM tree, avoiding z-index and overflow issues. It only renders when `kanji` prop is non-null. Clicking the backdrop (`@click.self`) closes it.

- [ ] **Replace KanjiDetailModal.vue with full implementation**

```vue
<template>
  <Teleport to="body">
    <div
      v-if="kanji"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style="background: rgba(0,0,0,0.5);"
      @click.self="$emit('close')"
    >
      <div
        class="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
        style="background: var(--color-surface);"
      >
        <!-- Header row: big kanji + meanings + close button -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="font-bold" style="font-size: 72px; line-height: 1;">{{ kanji.kanji }}</div>
            <div class="text-lg font-semibold mt-1">{{ kanji.meaning.join(', ') }}</div>
          </div>
          <button
            class="text-2xl p-1 rounded-lg transition-colors hover:bg-primary/10"
            style="color: var(--color-text-muted);"
            @click="$emit('close')"
          >✕</button>
        </div>

        <!-- JLPT badge + stroke count -->
        <div class="flex gap-2 mb-4">
          <span
            class="text-xs font-bold px-2 py-1 rounded-full"
            :class="kanji.jlpt === 'N5' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
          >{{ kanji.jlpt }}</span>
          <span
            class="text-xs px-2 py-1 rounded-full"
            style="background: var(--color-surface-2); color: var(--color-text-muted);"
          >{{ kanji.strokeCount }} strokes</span>
        </div>

        <!-- Readings -->
        <div class="space-y-2 mb-4 text-sm">
          <div v-if="kanji.onyomi.length">
            <span class="font-semibold">On'yomi: </span>
            <span style="color: var(--color-text-muted);">{{ kanji.onyomi.join('、') }}</span>
          </div>
          <div v-if="kanji.kunyomi.length">
            <span class="font-semibold">Kun'yomi: </span>
            <span style="color: var(--color-text-muted);">{{ kanji.kunyomi.join('、') }}</span>
          </div>
        </div>

        <!-- Example words -->
        <div v-if="kanji.examples?.length" class="mb-4">
          <div class="text-sm font-semibold mb-2">Examples</div>
          <div class="space-y-2">
            <div
              v-for="ex in kanji.examples"
              :key="ex.word"
              class="p-3 rounded-lg text-sm"
              style="background: var(--color-surface-2);"
            >
              <span class="font-bold text-base">{{ ex.word }}</span>
              <span class="ml-2" style="color: var(--color-text-muted);">{{ ex.reading }}</span>
              <div style="color: var(--color-text-muted);">{{ ex.meaning }}</div>
            </div>
          </div>
        </div>

        <!-- Add / Remove from Flashcard Deck -->
        <button
          class="w-full py-3 rounded-xl font-semibold text-sm border transition-colors"
          :class="isFavorited
            ? 'border-primary text-primary hover:bg-primary/10'
            : 'bg-primary text-white hover:bg-primary/90 border-primary'"
          @click="$emit('toggle-favorite')"
        >
          {{ isFavorited ? '★ Remove from Flashcard Deck' : '☆ Add to Flashcard Deck' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  kanji:       { type: Object,  default: null },
  isFavorited: { type: Boolean, default: false }
})
defineEmits(['close', 'toggle-favorite'])
</script>
```

---

## Task 4: Implement VocabularyView.vue

**Files:**
- Modify: `src/views/VocabularyView.vue`

Notes:
- `kanjiData` is imported from `@/data/kanji.js` (56 entries filled in Phase 2)
- `progress.toggleFavoriteKanji(kanjiChar)` and `progress.favoritedKanji` are already in the progress store
- Search matches on the raw kanji character OR any English meaning (case-insensitive)
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`

- [ ] **Replace VocabularyView.vue with full implementation**

```vue
<template>
  <div class="px-4 py-6">

    <!-- Filters row -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <!-- Search -->
      <input
        v-model="search"
        type="text"
        placeholder="Search by kanji or meaning..."
        class="flex-1 px-4 py-2 rounded-xl border text-sm outline-none focus:border-primary transition-colors"
        style="background: var(--color-surface); border-color: var(--color-border); color: var(--color-text);"
      />

      <!-- JLPT filter chips -->
      <div class="flex gap-2 flex-shrink-0">
        <button
          v-for="lvl in ['all', 'N5', 'N4']"
          :key="lvl"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="jlptFilter === lvl ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="jlptFilter = lvl"
        >{{ lvl === 'all' ? 'All' : lvl }}</button>
      </div>
    </div>

    <!-- Result count -->
    <div class="text-sm mb-4" style="color: var(--color-text-muted);">
      {{ filteredKanji.length }} kanji
    </div>

    <!-- Kanji grid -->
    <div v-if="filteredKanji.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <KanjiCard
        v-for="k in filteredKanji"
        :key="k.kanji"
        :kanji="k"
        @click="selectedKanji = k"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16" style="color: var(--color-text-muted);">
      <div class="text-4xl mb-3">🔍</div>
      <p>No kanji found{{ search ? ` for "${search}"` : '' }}.</p>
    </div>

    <!-- Detail modal -->
    <KanjiDetailModal
      :kanji="selectedKanji"
      :is-favorited="selectedKanji ? progress.favoritedKanji.includes(selectedKanji.kanji) : false"
      @close="selectedKanji = null"
      @toggle-favorite="onToggleFavorite"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import kanjiData from '@/data/kanji.js'
import KanjiCard from '@/components/vocabulary/KanjiCard.vue'
import KanjiDetailModal from '@/components/vocabulary/KanjiDetailModal.vue'

const progress = useProgressStore()

const search = ref('')
const jlptFilter = ref('all')
const selectedKanji = ref(null)

const filteredKanji = computed(() => {
  let list = kanjiData
  if (jlptFilter.value !== 'all') {
    list = list.filter(k => k.jlpt === jlptFilter.value)
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(k =>
      k.kanji.includes(search.value.trim()) ||
      k.meaning.some(m => m.toLowerCase().includes(q))
    )
  }
  return list
})

function onToggleFavorite() {
  if (!selectedKanji.value) return
  progress.toggleFavoriteKanji(selectedKanji.value.kanji)
}
</script>
```

---

## Task 5: Build verification

- [ ] **Run production build**

```bash
npm run build
```

Expected: No errors. `VocabularyView` and `KanjiDetailModal` chunks appear in output.

- [ ] **Start dev server and smoke-test**

```bash
npm run dev
```

Open browser. Verify:
1. Navigate to `/vocabulary` → grid of kanji cards appears (56 total)
2. Each card shows: large kanji character, JLPT badge (green N5 / blue N4), meaning, stroke count
3. Search box: type "fire" → only 火 card remains. Clear → all cards reappear.
4. JLPT filter: click N5 → only N5 kanji shown. Click N4 → only N4 kanji. Click All → all back.
5. Click a kanji card → detail modal opens. Shows kanji, all meanings, On'yomi, Kun'yomi, example word(s).
6. Modal: "☆ Add to Flashcard Deck" button — click it → button text changes to "★ Remove from Flashcard Deck"
7. Close modal. Navigate to Flashcards → Favorites tab appears, contains the added kanji.
8. Re-open vocabulary modal for same kanji → "★ Remove from Flashcard Deck". Click → removed from favorites.
9. Click modal backdrop (outside the card) → modal closes.

If any step fails, fix before reporting DONE.

---

## Task 6: Commit, push, merge to main

- [ ] **Stage all changes**

```bash
git add src/components/vocabulary/KanjiCard.vue src/components/vocabulary/KanjiDetailModal.vue src/views/VocabularyView.vue
```

- [ ] **Commit**

```bash
git commit -m "$(cat <<'EOF'
feat: implement vocabulary browser

Kanji grid with JLPT filter chips and search (by character or meaning).
Detail modal shows onyomi, kunyomi, examples, and favorite toggle.
Toggling a kanji into/out of the favorites deck persists to
progressStore.favoritedKanji and surfaces as the Favorites deck
in the flashcard view.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Push and merge**

```bash
git push -u origin feat/vocabulary
git checkout main
git merge feat/vocabulary --no-ff -m "merge: feat/vocabulary → main"
git push origin main
```
