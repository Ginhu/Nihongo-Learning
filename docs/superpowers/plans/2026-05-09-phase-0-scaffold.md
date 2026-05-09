# Phase 0 — Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the full project scaffold — Vite + Vue 3 + Tailwind CSS v3 + Pinia + Vue Router — with all empty component/view/store/data shells, CSS variables, GitHub Actions deploy workflow, and a clean push to `main`.

**Architecture:** Hash-mode SPA (required for GitHub Pages). `App.vue` owns the responsive layout shell (left sidebar ≥768px, bottom tab bar <768px). All feature shells are empty but valid Vue SFCs so the build passes from day one. Each subsequent feature branch fills in its shells without touching routing or layout.

**Tech Stack:** Vue 3.5, Vite 6, Tailwind CSS 3, Pinia 2, Vue Router 4, GitHub Actions + peaceiris/actions-gh-pages

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Dependencies and npm scripts |
| `vite.config.js` | Vite config + GitHub Pages base path |
| `index.html` | HTML entry point |
| `.gitignore` | Node + Vite ignores |
| `postcss.config.js` | PostCSS for Tailwind |
| `tailwind.config.js` | Tailwind content paths + custom theme tokens |
| `src/assets/main.css` | Tailwind directives + all CSS custom properties |
| `src/main.js` | App bootstrap — registers Router and Pinia |
| `src/App.vue` | Root layout: sidebar + bottom nav + `<RouterView>` |
| `src/router/index.js` | All six named routes, hash history |
| `src/stores/settings.js` | `useSettingsStore` — quizLength, romajiVisible, soundEnabled, theme |
| `src/stores/progress.js` | `useProgressStore` — xp, level, streak, characterStats, flashcardKnown, favoritedKanji |
| `src/stores/quiz.js` | `useQuizStore` — session state, no persistence |
| `src/data/hiragana.js` | Empty array export (filled in feat/quiz) |
| `src/data/katakana.js` | Empty array export (filled in feat/quiz) |
| `src/data/kanji.js` | Empty array export (filled in feat/vocabulary) |
| `src/views/HomeView.vue` | Placeholder home/dashboard |
| `src/views/QuizSelectView.vue` | Placeholder quiz mode selector |
| `src/views/QuizSessionView.vue` | Placeholder active quiz |
| `src/views/FlashcardsView.vue` | Placeholder flashcards |
| `src/views/VocabularyView.vue` | Placeholder vocabulary browser |
| `src/views/ProgressView.vue` | Placeholder progress/stats |
| `src/components/layout/AppSidebar.vue` | Desktop left nav shell |
| `src/components/layout/AppBottomNav.vue` | Mobile bottom tab bar shell |
| `src/components/layout/RomajiToggle.vue` | Global romaji on/off button shell |
| `src/components/quiz/QuizModeCard.vue` | Shell |
| `src/components/quiz/QuizQuestion.vue` | Shell |
| `src/components/quiz/QuizAnswerGrid.vue` | Shell |
| `src/components/quiz/QuizEndScreen.vue` | Shell |
| `src/components/flashcard/FlashCard.vue` | Shell |
| `src/components/flashcard/DeckSelector.vue` | Shell |
| `src/components/progress/XpBar.vue` | Shell |
| `src/components/progress/StreakBadge.vue` | Shell |
| `src/components/progress/AccuracyChart.vue` | Shell |
| `src/components/progress/WeakCharacters.vue` | Shell |
| `src/components/vocabulary/KanjiCard.vue` | Shell |
| `src/components/vocabulary/KanjiDetailModal.vue` | Shell |
| `.github/workflows/deploy.yml` | Build + deploy to `gh-pages` on push to `main` |

---

## Task 1: Create feature branch

- [ ] **Create and switch to feat/scaffold branch**

```bash
git checkout -b feat/scaffold
```

Expected: `Switched to a new branch 'feat/scaffold'`

---

## Task 2: Create project config files

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `.gitignore`
- Create: `postcss.config.js`
- Create: `tailwind.config.js`

- [ ] **Create `package.json`**

```json
{
  "name": "nihongo-learning",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "pinia": "^2.2.0",
    "vue": "^3.5.0",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  base: '/Nihongo-Learning/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

- [ ] **Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/Nihongo-Learning/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>日本語マスター</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Create `.gitignore`**

```
node_modules
dist
.DS_Store
*.local
.env
```

- [ ] **Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

- [ ] **Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        accent: '#F4A261'
      },
      fontFamily: {
        sans: [
          'system-ui', '-apple-system', 'BlinkMacSystemFont',
          '"Segoe UI"', 'Roboto', '"Hiragino Sans"',
          '"Noto Sans CJK JP"', 'sans-serif'
        ]
      }
    }
  },
  plugins: []
}
```

---

## Task 3: Install dependencies

**Files:** `node_modules/`, `package-lock.json`

- [ ] **Install npm packages**

```bash
npm install
```

Expected: Packages installed, no errors. `node_modules/` created.

- [ ] **Verify key packages present**

```bash
npm list vue vue-router pinia vite tailwindcss
```

Expected: All five packages listed with version numbers.

---

## Task 4: Create CSS custom properties and base styles

**Files:**
- Create: `src/assets/main.css`

- [ ] **Create `src/assets/main.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #ffffff;
  --color-surface: #f3f4f6;
  --color-surface-2: #e5e7eb;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-primary: #E63946;
  --color-accent: #F4A261;
}

.dark {
  --color-bg: #0f0f0f;
  --color-surface: #1a1a1a;
  --color-surface-2: #262626;
  --color-text: #f9fafb;
  --color-text-muted: #9ca3af;
  --color-border: #2d2d2d;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: theme('fontFamily.sans');
  transition: background-color 0.2s, color 0.2s;
}

* {
  box-sizing: border-box;
}
```

---

## Task 5: Create Vue Router

**Files:**
- Create: `src/router/index.js`

- [ ] **Create `src/router/index.js`**

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
    component: () => import('@/views/FlashcardsView.vue')
  },
  {
    path: '/vocabulary',
    name: 'vocabulary',
    component: () => import('@/views/VocabularyView.vue')
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

---

## Task 6: Create Pinia stores (shells)

**Files:**
- Create: `src/stores/settings.js`
- Create: `src/stores/progress.js`
- Create: `src/stores/quiz.js`

- [ ] **Create `src/stores/settings.js`**

```js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'nihongo-settings'

export const useSettingsStore = defineStore('settings', () => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

  const quizLength = ref(saved.quizLength ?? 10)
  const romajiVisible = ref(saved.romajiVisible ?? true)
  const soundEnabled = ref(saved.soundEnabled ?? true)
  const theme = ref(saved.theme ?? 'dark')

  function applyTheme() {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      quizLength: quizLength.value,
      romajiVisible: romajiVisible.value,
      soundEnabled: soundEnabled.value,
      theme: theme.value
    }))
  }

  watch([quizLength, romajiVisible, soundEnabled, theme], persist, { deep: true })

  return { quizLength, romajiVisible, soundEnabled, theme, applyTheme, toggleTheme }
})
```

- [ ] **Create `src/stores/progress.js`**

```js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'nihongo-progress'

const LEVEL_TITLES = [
  '', 'Beginner', 'Student', 'Apprentice', 'Learner', 'Practitioner',
  'Intermediate', 'Advanced', 'Expert', 'Master', 'Sensei'
]

export const useProgressStore = defineStore('progress', () => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

  const xp = ref(saved.xp ?? 0)
  const level = ref(saved.level ?? 1)
  const streak = ref(saved.streak ?? 0)
  const lastPlayedDate = ref(saved.lastPlayedDate ?? null)
  const quizHistory = ref(saved.quizHistory ?? [])
  const characterStats = ref(saved.characterStats ?? {})
  const flashcardKnown = ref(saved.flashcardKnown ?? [])
  const favoritedKanji = ref(saved.favoritedKanji ?? [])

  const levelTitle = computed(() => LEVEL_TITLES[Math.min(level.value, 10)])

  const weakCharacters = computed(() => {
    return Object.entries(characterStats.value)
      .filter(([, s]) => (s.correct + s.incorrect) >= 3)
      .map(([key, s]) => ({
        key,
        accuracy: s.correct / (s.correct + s.incorrect)
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
  })

  function computeLevel(currentXp) {
    return Math.min(Math.floor(currentXp / 500) + 1, 10)
  }

  function addXp(amount) {
    const prevLevel = level.value
    xp.value += amount
    level.value = computeLevel(xp.value)
    return level.value > prevLevel ? level.value : null
  }

  function recordQuizResult(mode, score, total, answers) {
    quizHistory.value.unshift({ mode, score, total, date: new Date().toISOString() })
    if (quizHistory.value.length > 50) quizHistory.value.pop()

    let xpGained = score * 10
    if (score === total) xpGained += 50
    const newLevel = addXp(xpGained)

    for (const a of answers) {
      const key = a.question
      if (!characterStats.value[key]) characterStats.value[key] = { correct: 0, incorrect: 0 }
      if (a.wasCorrect) characterStats.value[key].correct++
      else characterStats.value[key].incorrect++
    }

    checkStreak()
    return { xpGained, newLevel }
  }

  function recordFlashcardKnown(id, known) {
    if (known) {
      if (!flashcardKnown.value.includes(id)) flashcardKnown.value.push(id)
    } else {
      flashcardKnown.value = flashcardKnown.value.filter(k => k !== id)
    }
  }

  function toggleFavoriteKanji(kanji) {
    const idx = favoritedKanji.value.indexOf(kanji)
    if (idx === -1) favoritedKanji.value.push(kanji)
    else favoritedKanji.value.splice(idx, 1)
  }

  function checkStreak() {
    const today = new Date().toISOString().slice(0, 10)
    if (lastPlayedDate.value === today) return
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    streak.value = lastPlayedDate.value === yesterday ? streak.value + 1 : 1
    lastPlayedDate.value = today
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      xp: xp.value,
      level: level.value,
      streak: streak.value,
      lastPlayedDate: lastPlayedDate.value,
      quizHistory: quizHistory.value,
      characterStats: characterStats.value,
      flashcardKnown: flashcardKnown.value,
      favoritedKanji: favoritedKanji.value
    }))
  }

  watch(
    [xp, level, streak, lastPlayedDate, quizHistory, characterStats, flashcardKnown, favoritedKanji],
    persist,
    { deep: true }
  )

  return {
    xp, level, streak, lastPlayedDate,
    quizHistory, characterStats, flashcardKnown, favoritedKanji,
    levelTitle, weakCharacters,
    addXp, recordQuizResult, recordFlashcardKnown, toggleFavoriteKanji, checkStreak
  }
})
```

- [ ] **Create `src/stores/quiz.js`**

```js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQuizStore = defineStore('quiz', () => {
  const mode = ref(null)
  const direction = ref(null)
  const difficulty = ref('medium')
  const jlptFilter = ref('all')
  const questions = ref([])
  const currentIndex = ref(0)
  const score = ref(0)
  const answers = ref([])
  const startTime = ref(null)

  const difficultyOptions = { easy: 2, medium: 4, hard: 6 }

  function startSession(opts) {
    mode.value = opts.mode
    direction.value = opts.direction
    difficulty.value = opts.difficulty ?? 'medium'
    jlptFilter.value = opts.jlptFilter ?? 'all'
    questions.value = opts.questions
    currentIndex.value = 0
    score.value = 0
    answers.value = []
    startTime.value = Date.now()
  }

  function answerQuestion(chosenAnswer, correctAnswer) {
    const wasCorrect = chosenAnswer === correctAnswer
    if (wasCorrect) score.value++
    answers.value.push({
      question: questions.value[currentIndex.value]?.prompt ?? '',
      chosen: chosenAnswer,
      correct: correctAnswer,
      wasCorrect
    })
    currentIndex.value++
  }

  function endSession() {
    return {
      mode: mode.value,
      score: score.value,
      total: questions.value.length,
      timeTaken: Math.floor((Date.now() - startTime.value) / 1000),
      answers: answers.value
    }
  }

  function reset() {
    mode.value = null
    direction.value = null
    questions.value = []
    currentIndex.value = 0
    score.value = 0
    answers.value = []
    startTime.value = null
  }

  return {
    mode, direction, difficulty, jlptFilter,
    questions, currentIndex, score, answers, startTime,
    difficultyOptions,
    startSession, answerQuestion, endSession, reset
  }
})
```

---

## Task 7: Create data file stubs

**Files:**
- Create: `src/data/hiragana.js`
- Create: `src/data/katakana.js`
- Create: `src/data/kanji.js`

- [ ] **Create `src/data/hiragana.js`**

```js
// TODO: Fill in all 71 entries (46 base + 25 dakuten/handakuten) in feat/quiz
// { kana: "あ", romaji: "a", group: "vowel" }
export default []
```

- [ ] **Create `src/data/katakana.js`**

```js
// TODO: Fill in all 71 entries (46 base + 25 dakuten/handakuten) in feat/quiz
// { kana: "ア", romaji: "a", group: "vowel" }
export default []
```

- [ ] **Create `src/data/kanji.js`**

```js
// TODO: Fill in 50+ entries (N5 + N4) in feat/vocabulary
// {
//   kanji: "日", meaning: ["sun","day"], onyomi: ["にち","じつ"],
//   kunyomi: ["ひ","か"], jlpt: "N5", strokeCount: 4,
//   examples: [{ word: "日本", reading: "にほん", meaning: "Japan" }]
// }
export default []
```

---

## Task 8: Create view shells

**Files:**
- Create: `src/views/HomeView.vue`
- Create: `src/views/QuizSelectView.vue`
- Create: `src/views/QuizSessionView.vue`
- Create: `src/views/FlashcardsView.vue`
- Create: `src/views/VocabularyView.vue`
- Create: `src/views/ProgressView.vue`

- [ ] **Create `src/views/HomeView.vue`**

```vue
<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-primary">日本語マスター</h1>
    <p class="mt-2" style="color: var(--color-text-muted)">Welcome. Choose a section to begin.</p>
  </div>
</template>

<script setup>
</script>
```

- [ ] **Create `src/views/QuizSelectView.vue`**

```vue
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">Quiz</h1>
    <p style="color: var(--color-text-muted)">Mode selector — coming in feat/quiz.</p>
  </div>
</template>

<script setup>
</script>
```

- [ ] **Create `src/views/QuizSessionView.vue`**

```vue
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">Quiz Session</h1>
    <p style="color: var(--color-text-muted)">Active quiz — coming in feat/quiz.</p>
  </div>
</template>

<script setup>
</script>
```

- [ ] **Create `src/views/FlashcardsView.vue`**

```vue
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">Flashcards</h1>
    <p style="color: var(--color-text-muted)">Flashcard review — coming in feat/flashcards.</p>
  </div>
</template>

<script setup>
</script>
```

- [ ] **Create `src/views/VocabularyView.vue`**

```vue
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">Vocabulary</h1>
    <p style="color: var(--color-text-muted)">Vocabulary browser — coming in feat/vocabulary.</p>
  </div>
</template>

<script setup>
</script>
```

- [ ] **Create `src/views/ProgressView.vue`**

```vue
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">Progress</h1>
    <p style="color: var(--color-text-muted)">Stats & progress — coming in feat/progress.</p>
  </div>
</template>

<script setup>
</script>
```

---

## Task 9: Create layout components

**Files:**
- Create: `src/components/layout/AppSidebar.vue`
- Create: `src/components/layout/AppBottomNav.vue`
- Create: `src/components/layout/RomajiToggle.vue`

- [ ] **Create `src/components/layout/AppSidebar.vue`**

```vue
<template>
  <aside
    class="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 z-20 border-r"
    style="background: var(--color-surface); border-color: var(--color-border);"
  >
    <div class="p-4 border-b" style="border-color: var(--color-border);">
      <span class="text-lg font-bold text-primary">日本語マスター</span>
    </div>
    <nav class="flex flex-col gap-1 p-3 flex-1">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="link.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="[route.name === link.name
          ? 'bg-primary text-white'
          : 'hover:bg-primary/10']"
        style="color: inherit;"
      >
        <span class="text-lg">{{ link.icon }}</span>
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="p-3 border-t" style="border-color: var(--color-border);">
      <RomajiToggle />
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import RomajiToggle from './RomajiToggle.vue'

const route = useRoute()

const links = [
  { name: 'home',       to: '/',           icon: '🏠', label: 'Home' },
  { name: 'quiz-select',to: '/quiz',        icon: '🎯', label: 'Quiz' },
  { name: 'flashcards', to: '/flashcards',  icon: '🃏', label: 'Flashcards' },
  { name: 'vocabulary', to: '/vocabulary',  icon: '📖', label: 'Vocabulary' },
  { name: 'progress',   to: '/progress',    icon: '📊', label: 'Progress' }
]
</script>
```

- [ ] **Create `src/components/layout/AppBottomNav.vue`**

```vue
<template>
  <nav
    class="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t h-16"
    style="background: var(--color-surface); border-color: var(--color-border);"
  >
    <RouterLink
      v-for="link in links"
      :key="link.name"
      :to="link.to"
      class="flex flex-col items-center gap-0.5 flex-1 py-1 text-xs font-medium transition-colors"
      :class="[route.name === link.name ? 'text-primary' : '']"
      style="color: inherit;"
    >
      <span class="text-xl">{{ link.icon }}</span>
      {{ link.label }}
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { name: 'home',       to: '/',           icon: '🏠', label: 'Home' },
  { name: 'quiz-select',to: '/quiz',        icon: '🎯', label: 'Quiz' },
  { name: 'flashcards', to: '/flashcards',  icon: '🃏', label: 'Cards' },
  { name: 'vocabulary', to: '/vocabulary',  icon: '📖', label: 'Words' },
  { name: 'progress',   to: '/progress',    icon: '📊', label: 'Progress' }
]
</script>
```

- [ ] **Create `src/components/layout/RomajiToggle.vue`**

```vue
<template>
  <button
    @click="settings.romajiVisible = !settings.romajiVisible"
    class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10"
    :title="settings.romajiVisible ? 'Hide rōmaji' : 'Show rōmaji'"
  >
    <span class="text-lg">{{ settings.romajiVisible ? '👁' : '🚫' }}</span>
    <span class="hidden md:inline">Rōmaji {{ settings.romajiVisible ? 'ON' : 'OFF' }}</span>
  </button>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
const settings = useSettingsStore()
</script>
```

---

## Task 10: Create feature component shells

**Files:** All remaining component shells. Each is a minimal valid SFC.

- [ ] **Create `src/components/quiz/QuizModeCard.vue`**

```vue
<template>
  <div class="rounded-xl p-6 border" style="background: var(--color-surface); border-color: var(--color-border);">
    <!-- QuizModeCard — implemented in feat/quiz -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/quiz/QuizQuestion.vue`**

```vue
<template>
  <div class="text-center">
    <!-- QuizQuestion — implemented in feat/quiz -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/quiz/QuizAnswerGrid.vue`**

```vue
<template>
  <div class="grid gap-3">
    <!-- QuizAnswerGrid — implemented in feat/quiz -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/quiz/QuizEndScreen.vue`**

```vue
<template>
  <div class="text-center p-8">
    <!-- QuizEndScreen — implemented in feat/quiz -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/flashcard/FlashCard.vue`**

```vue
<template>
  <div class="rounded-2xl border" style="background: var(--color-surface); border-color: var(--color-border);">
    <!-- FlashCard — implemented in feat/flashcards -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/flashcard/DeckSelector.vue`**

```vue
<template>
  <div class="flex gap-2 flex-wrap">
    <!-- DeckSelector — implemented in feat/flashcards -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/progress/XpBar.vue`**

```vue
<template>
  <div class="rounded-xl p-4" style="background: var(--color-surface);">
    <!-- XpBar — implemented in feat/progress -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/progress/StreakBadge.vue`**

```vue
<template>
  <div class="flex items-center gap-2">
    <!-- StreakBadge — implemented in feat/progress -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/progress/AccuracyChart.vue`**

```vue
<template>
  <div class="rounded-xl p-4" style="background: var(--color-surface);">
    <!-- AccuracyChart — implemented in feat/progress -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/progress/WeakCharacters.vue`**

```vue
<template>
  <div class="rounded-xl p-4" style="background: var(--color-surface);">
    <!-- WeakCharacters — implemented in feat/progress -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/vocabulary/KanjiCard.vue`**

```vue
<template>
  <div class="rounded-xl p-4 cursor-pointer border" style="background: var(--color-surface); border-color: var(--color-border);">
    <!-- KanjiCard — implemented in feat/vocabulary -->
  </div>
</template>
<script setup></script>
```

- [ ] **Create `src/components/vocabulary/KanjiDetailModal.vue`**

```vue
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- KanjiDetailModal — implemented in feat/vocabulary -->
  </div>
</template>
<script setup></script>
```

---

## Task 11: Wire App.vue and main.js

**Files:**
- Create: `src/App.vue`
- Create: `src/main.js`

- [ ] **Create `src/App.vue`**

```vue
<template>
  <div class="min-h-screen" style="background: var(--color-bg); color: var(--color-text);">
    <AppSidebar />

    <main class="md:ml-56 pb-16 md:pb-0 min-h-screen">
      <RouterView />
    </main>

    <AppBottomNav />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useProgressStore } from '@/stores/progress'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'

const settings = useSettingsStore()
const progress = useProgressStore()

onMounted(() => {
  settings.applyTheme()
  progress.checkStreak()
})
</script>
```

- [ ] **Create `src/main.js`**

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

---

## Task 12: Add GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Task 13: Verify the build

- [ ] **Run dev server — confirm no errors**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:5173/Nihongo-Learning/`. Open in browser. All 5 nav links should navigate without console errors.

- [ ] **Run production build**

```bash
npm run build
```

Expected: `dist/` folder created. No build errors. Output should show all route chunks.

- [ ] **Preview production build**

```bash
npm run preview
```

Expected: App loads at the preview URL. Navigation works. No 404s.

---

## Task 14: Commit, push, and merge to main

- [ ] **Stage all new files**

```bash
git add .
```

- [ ] **Commit**

```bash
git commit -m "$(cat <<'EOF'
feat: scaffold Nihongo Master SPA

Sets up Vite + Vue 3 + Tailwind CSS v3 + Pinia + Vue Router with
hash-mode routing, CSS custom properties for light/dark theme,
all empty component/view/store/data shells, and GitHub Actions
auto-deploy to GitHub Pages.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Push feat/scaffold branch**

```bash
git push -u origin feat/scaffold
```

- [ ] **Switch to main and merge**

```bash
git checkout main
git merge feat/scaffold --no-ff -m "merge: feat/scaffold → main"
```

- [ ] **Push main**

```bash
git push origin main
```

Expected: GitHub Actions workflow triggers automatically. Check the Actions tab at `https://github.com/Ginhu/Nihongo-Learning/actions` — the deploy job should complete and publish to `gh-pages` branch.

- [ ] **Verify live deployment**

Visit `https://ginhu.github.io/Nihongo-Learning/` — app should load, sidebar/bottom nav should be visible, all routes navigable.
