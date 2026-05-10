# Phase 4 — Progress & Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Progress page — XP bar, streak badge, accuracy charts per script type, weak characters grid, and recent quiz history list.

**Architecture:** ProgressView assembles four focused child components. Each component reads directly from `useProgressStore` — no props needed for store data. AccuracyChart and WeakCharacters import the three data files to map character keys to their script group / display hint. All store data (`xp`, `level`, `levelTitle`, `streak`, `quizHistory`, `characterStats`, `weakCharacters`) is already populated by the quiz and flashcard features.

**Tech Stack:** Vue 3 Composition API, Pinia (`useProgressStore`), Tailwind CSS, CSS transition for bar animations

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/progress/XpBar.vue` | Modify | XP progress bar + level number + level title |
| `src/components/progress/StreakBadge.vue` | Modify | Flame icon + day streak count |
| `src/components/progress/AccuracyChart.vue` | Modify | 3 horizontal CSS bars — hiragana / katakana / kanji group accuracy |
| `src/components/progress/WeakCharacters.vue` | Modify | 5 lowest-accuracy character cards with romaji/meaning hint |
| `src/views/ProgressView.vue` | Modify | Assembles all components + quiz history list (last 10) |

---

## Task 1: Create feat/progress branch

- [ ] **Create and switch to feat/progress branch**

```bash
git checkout main && git checkout -b feat/progress
```

Expected: `Switched to a new branch 'feat/progress'`

---

## Task 2: Implement XpBar.vue

**Files:**
- Modify: `src/components/progress/XpBar.vue`

Level formula: `floor(xp / 500) + 1`, cap 10. XP within the current level = `xp % 500`. Progress bar width = `(xp % 500) / 500 * 100`%. At level 10 (max), show full bar and "MAX".

- [ ] **Replace XpBar.vue**

```vue
<template>
  <div class="rounded-xl p-4" style="background: var(--color-surface);">
    <div class="flex justify-between items-baseline mb-2">
      <div>
        <span class="text-lg font-bold">Level {{ progress.level }}</span>
        <span class="ml-2 text-sm" style="color: var(--color-text-muted);">{{ progress.levelTitle }}</span>
      </div>
      <span class="text-sm" style="color: var(--color-text-muted);">
        {{ isMaxLevel ? 'MAX' : `${xpInLevel} / 500 XP` }}
      </span>
    </div>

    <div class="h-3 rounded-full overflow-hidden" style="background: var(--color-surface-2);">
      <div
        class="h-full rounded-full transition-all duration-500"
        style="background: var(--color-accent);"
        :style="{ width: xpPercent + '%' }"
      />
    </div>

    <div class="mt-1 text-xs text-right" style="color: var(--color-text-muted);">
      {{ progress.xp }} XP total
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

const isMaxLevel = computed(() => progress.level >= 10)
const xpInLevel  = computed(() => progress.xp % 500)
const xpPercent  = computed(() =>
  isMaxLevel.value ? 100 : Math.round((xpInLevel.value / 500) * 100)
)
</script>
```

---

## Task 3: Implement StreakBadge.vue

**Files:**
- Modify: `src/components/progress/StreakBadge.vue`

- [ ] **Replace StreakBadge.vue**

```vue
<template>
  <div class="rounded-xl p-4 flex items-center gap-4" style="background: var(--color-surface);">
    <span class="text-4xl leading-none" role="img" aria-label="streak fire">🔥</span>
    <div>
      <div class="text-3xl font-bold leading-none">{{ progress.streak }}</div>
      <div class="text-sm mt-1" style="color: var(--color-text-muted);">
        {{ progress.streak === 1 ? 'day streak' : 'day streak' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProgressStore } from '@/stores/progress'
const progress = useProgressStore()
</script>
```

---

## Task 4: Implement AccuracyChart.vue

**Files:**
- Modify: `src/components/progress/AccuracyChart.vue`

Imports all three data arrays to build character sets. For each group, sums `correct` and `correct + incorrect` across all `characterStats` entries whose key belongs to that group. Returns `null` if zero attempts (shows "No data" instead of a bar).

- [ ] **Replace AccuracyChart.vue**

```vue
<template>
  <div class="rounded-xl p-4 space-y-4" style="background: var(--color-surface);">
    <h3 class="font-semibold text-sm" style="color: var(--color-text-muted);">ACCURACY BY SCRIPT</h3>

    <div v-for="bar in bars" :key="bar.label" class="space-y-1">
      <div class="flex justify-between text-sm">
        <span class="font-medium">{{ bar.label }}</span>
        <span style="color: var(--color-text-muted);">
          {{ bar.acc !== null ? bar.acc + '%' : 'No data yet' }}
        </span>
      </div>
      <div class="h-3 rounded-full overflow-hidden" style="background: var(--color-surface-2);">
        <div
          class="h-full rounded-full transition-all duration-500"
          style="background: var(--color-primary);"
          :style="{ width: (bar.acc ?? 0) + '%' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import hiraganaData from '@/data/hiragana.js'
import katakanaData from '@/data/katakana.js'
import kanjiData    from '@/data/kanji.js'

const progress = useProgressStore()

const hiraganaSet = new Set(hiraganaData.map(h => h.kana))
const katakanaSet = new Set(katakanaData.map(k => k.kana))
const kanjiSet    = new Set(kanjiData.map(k => k.kanji))

function groupAccuracy(charSet) {
  let correct = 0, total = 0
  for (const [key, s] of Object.entries(progress.characterStats)) {
    if (charSet.has(key)) {
      correct += s.correct
      total   += s.correct + s.incorrect
    }
  }
  return total === 0 ? null : Math.round((correct / total) * 100)
}

const bars = computed(() => [
  { label: 'Hiragana', acc: groupAccuracy(hiraganaSet) },
  { label: 'Katakana', acc: groupAccuracy(katakanaSet) },
  { label: 'Kanji',    acc: groupAccuracy(kanjiSet)    },
])
</script>
```

---

## Task 5: Implement WeakCharacters.vue

**Files:**
- Modify: `src/components/progress/WeakCharacters.vue`

`progressStore.weakCharacters` returns `[{ key, accuracy }]` (up to 5, min 3 attempts, sorted asc by accuracy). We look up a display hint — romaji for kana, first meaning for kanji — using lookup maps built from the data files.

- [ ] **Replace WeakCharacters.vue**

```vue
<template>
  <div class="rounded-xl p-4" style="background: var(--color-surface);">
    <h3 class="font-semibold text-sm mb-3" style="color: var(--color-text-muted);">WEAK CHARACTERS</h3>

    <div v-if="weakChars.length === 0" class="text-sm" style="color: var(--color-text-muted);">
      Keep practicing — weak characters appear after 3+ attempts on each.
    </div>

    <div v-else class="grid grid-cols-5 gap-2">
      <div
        v-for="c in weakChars"
        :key="c.key"
        class="flex flex-col items-center gap-1 p-2 rounded-lg border text-center"
        style="background: var(--color-surface-2); border-color: var(--color-border);"
      >
        <div class="text-2xl font-bold leading-none">{{ c.key }}</div>
        <div class="text-xs leading-tight" style="color: var(--color-text-muted);">{{ c.hint }}</div>
        <div class="text-xs font-semibold" style="color: var(--color-primary);">{{ c.percent }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import hiraganaData from '@/data/hiragana.js'
import katakanaData from '@/data/katakana.js'
import kanjiData    from '@/data/kanji.js'

const progress = useProgressStore()

const kanaLookup  = new Map([
  ...hiraganaData.map(h => [h.kana,   h.romaji]),
  ...katakanaData.map(k => [k.kana,   k.romaji]),
])
const kanjiLookup = new Map(kanjiData.map(k => [k.kanji, k.meaning[0]]))

const weakChars = computed(() =>
  progress.weakCharacters.map(({ key, accuracy }) => ({
    key,
    hint:    kanaLookup.get(key) ?? kanjiLookup.get(key) ?? '',
    percent: Math.round(accuracy * 100),
  }))
)
</script>
```

---

## Task 6: Implement ProgressView.vue

**Files:**
- Modify: `src/views/ProgressView.vue`

Assembles the four child components and appends the quiz history list (last 10 entries). `formatDate` uses `toLocaleDateString` with `{ month: 'short', day: 'numeric' }`.

- [ ] **Replace ProgressView.vue**

```vue
<template>
  <div class="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
    <h1 class="text-2xl font-bold">Progress</h1>

    <!-- XP + Streak -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <XpBar />
      <StreakBadge />
    </div>

    <!-- Accuracy charts -->
    <AccuracyChart />

    <!-- Weak characters -->
    <WeakCharacters />

    <!-- Quiz history -->
    <div class="rounded-xl p-4" style="background: var(--color-surface);">
      <h3 class="font-semibold text-sm mb-3" style="color: var(--color-text-muted);">RECENT QUIZZES</h3>

      <div v-if="recentHistory.length === 0" class="text-sm" style="color: var(--color-text-muted);">
        No quizzes completed yet. Start a quiz to see your history!
      </div>

      <div v-else>
        <div
          v-for="(h, i) in recentHistory"
          :key="i"
          class="flex items-center justify-between py-2 text-sm border-b last:border-b-0"
          style="border-color: var(--color-border);"
        >
          <div>
            <span class="font-semibold capitalize">{{ h.mode }}</span>
            <span class="ml-2" style="color: var(--color-text-muted);">{{ formatDate(h.date) }}</span>
          </div>
          <div>
            <span class="font-semibold">{{ h.score }}/{{ h.total }}</span>
            <span class="ml-1" style="color: var(--color-text-muted);">
              ({{ Math.round((h.score / h.total) * 100) }}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import XpBar         from '@/components/progress/XpBar.vue'
import StreakBadge   from '@/components/progress/StreakBadge.vue'
import AccuracyChart from '@/components/progress/AccuracyChart.vue'
import WeakCharacters from '@/components/progress/WeakCharacters.vue'

const progress = useProgressStore()

const recentHistory = computed(() => progress.quizHistory.slice(0, 10))

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
```

---

## Task 7: Build verification

- [ ] **Run production build**

```bash
npm run build
```

Expected: No errors. `ProgressView` chunk appears in output.

- [ ] **Verify in dev server**

```bash
npm run dev
```

Check:
1. Navigate to `/progress` — page renders with "Level 1 Beginner" XP bar, streak badge, three accuracy bars, weak characters section, empty quiz history
2. Complete a quiz → return to progress → quiz history shows the entry, XP bar updated, accuracy bars show data
3. XP bar fill matches `xp % 500 / 500`
4. Accuracy bar for a script type shows a percentage after attempting that type

---

## Task 8: Commit, push, merge to main

- [ ] **Stage and commit**

```bash
git add src/components/progress/XpBar.vue src/components/progress/StreakBadge.vue src/components/progress/AccuracyChart.vue src/components/progress/WeakCharacters.vue src/views/ProgressView.vue
git commit -m "$(cat <<'EOF'
feat: implement progress & stats page

XP bar with level/title, day streak badge, accuracy charts per script
type (hiragana/katakana/kanji), weak characters grid with romaji/meaning
hints, and recent quiz history list. All data sourced from progressStore.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Push and merge**

```bash
git push -u origin feat/progress
git checkout main
git merge feat/progress --no-ff -m "merge: feat/progress → main"
git push origin main
```
