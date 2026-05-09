# Nihongo Master — Design Spec

**Date:** 2026-05-09  
**Project:** 日本語マスター (Nihongo Master)  
**Repo:** git@github.com:Ginhu/Nihongo-Learning.git  
**Deployed to:** GitHub Pages → `https://ginhu.github.io/Nihongo-Learning/`

---

## 1. Tech Stack

| Tool | Version / Notes |
|---|---|
| Vue 3 | Composition API + `<script setup>` |
| Vite | Latest stable; `base: '/Nihongo-Learning/'` for GitHub Pages |
| Pinia | State management + localStorage persistence via watcher |
| Vue Router | Hash mode for GitHub Pages compatibility |
| Tailwind CSS | v3, JIT, custom CSS vars for theme |
| Package manager | npm |
| No backend | All data hardcoded in `src/data/` |

> **Hash mode router:** GitHub Pages cannot handle HTML5 history pushState for SPAs without a custom 404 redirect. Using hash mode (`createWebHashHistory`) avoids this entirely with zero config.

---

## 2. Branch & Release Strategy

```
main (always deployable, auto-deploys to GitHub Pages via Actions)
├── feat/scaffold   → Vite + Tailwind + Router + Pinia + empty shells
├── feat/quiz       → Quiz game (hiragana / katakana / kanji modes)
├── feat/flashcards → Flashcard review with flip animation
├── feat/vocabulary → Vocabulary browser + detail modal
├── feat/progress   → Progress tracking + stats page
├── feat/gamification → XP, levels, streaks, sound feedback
└── feat/dark-mode  → Light/dark toggle, CSS vars, Pinia setting
```

Each branch is merged to `main` via fast-forward or squash merge when the feature is working end-to-end.

---

## 3. Project Structure

```
src/
  assets/
  components/
    quiz/
      QuizModeCard.vue
      QuizQuestion.vue
      QuizAnswerGrid.vue
      QuizEndScreen.vue
    flashcard/
      FlashCard.vue
      DeckSelector.vue
    progress/
      XpBar.vue
      StreakBadge.vue
      AccuracyChart.vue
      WeakCharacters.vue
    vocabulary/
      KanjiCard.vue
      KanjiDetailModal.vue
    layout/
      AppSidebar.vue
      AppBottomNav.vue
      RomajiToggle.vue
  data/
    hiragana.js     → 46 base + 25 dakuten/handakuten
    katakana.js     → 46 base + 25 dakuten/handakuten
    kanji.js        → 50+ entries, JLPT N5 + N4
  router/
    index.js
  stores/
    settings.js
    progress.js
    quiz.js
  views/
    HomeView.vue
    QuizSelectView.vue
    QuizSessionView.vue
    FlashcardsView.vue
    VocabularyView.vue
    ProgressView.vue
  App.vue
  main.js
docs/
  superpowers/
    specs/
      2026-05-09-nihongo-master-design.md
.github/
  workflows/
    deploy.yml      → GitHub Actions: build + deploy to gh-pages on push to main
```

---

## 4. Routing

Router mode: **hash** (`createWebHashHistory`)

| Path | View | Name |
|---|---|---|
| `/` | HomeView | home |
| `/quiz` | QuizSelectView | quiz-select |
| `/quiz/:mode` | QuizSessionView | quiz-session |
| `/flashcards` | FlashcardsView | flashcards |
| `/vocabulary` | VocabularyView | vocabulary |
| `/progress` | ProgressView | progress |

Navigation:
- **Mobile:** bottom tab bar (5 icons, fixed)
- **Desktop (≥768px):** left sidebar (fixed, collapsible)
- Both rendered in `App.vue` via `v-if` on breakpoint class

---

## 5. Data Layer

### `src/data/hiragana.js`
```js
// { kana: "あ", romaji: "a", group: "vowel" }
// 46 base + 25 dakuten/handakuten = 71 entries
```

### `src/data/katakana.js`
```js
// { kana: "ア", romaji: "a", group: "vowel" }
// 46 base + 25 dakuten/handakuten = 71 entries
```

### `src/data/kanji.js`
```js
// {
//   kanji: "日",
//   meaning: ["sun", "day"],
//   onyomi: ["にち", "じつ"],
//   kunyomi: ["ひ", "か"],
//   jlpt: "N5",
//   strokeCount: 4,
//   examples: [{ word: "日本", reading: "にほん", meaning: "Japan" }]
// }
// 50+ entries — TODO: expand to full N5/N4 set
```

All data files export a default array. No async loading — imported directly into stores and components.

---

## 6. Pinia Stores

### `useSettingsStore` (`src/stores/settings.js`)
```
state:
  quizLength: 10          // 10 | 20 | 30
  romajiVisible: true     // global romaji toggle
  soundEnabled: true      // Web Audio API toggle
  theme: 'dark'           // 'light' | 'dark'

persistence: localStorage via $subscribe watcher
```

### `useProgressStore` (`src/stores/progress.js`)
```
state:
  xp: 0
  level: 1
  streak: 0
  lastPlayedDate: null      // ISO date string
  quizHistory: []           // { mode, score, total, date }
  characterStats: {}        // { [kana|kanji]: { correct, incorrect } }
  flashcardKnown: []        // array of card IDs (Set serialized to array)
  favoritedKanji: []        // array of kanji keys added via vocabulary "Add to deck" button

computed:
  levelTitle()              // "Beginner" … "Sensei"
  weakCharacters()          // 5 chars with lowest correct%, min 3 attempts

actions:
  recordQuizResult(mode, score, total, answers)
  recordFlashcardKnown(id, known)
  checkStreak()             // call on app mount

persistence: localStorage via $subscribe watcher
```

Level formula: `floor(xp / 500) + 1` (cap at 10)

Level titles:
1. Beginner, 2. Student, 3. Apprentice, 4. Learner, 5. Practitioner,
6. Intermediate, 7. Advanced, 8. Expert, 9. Master, 10. Sensei

XP: +10 per correct answer, +50 bonus for perfect session (100% score)

### `useQuizStore` (`src/stores/quiz.js`)
```
state:
  mode: null               // 'hiragana' | 'katakana' | 'kanji'
  direction: null          // 'kana-to-romaji' | 'romaji-to-kana' | 'kanji-to-meaning' | 'kanji-to-reading'
  difficulty: 'medium'     // 'easy' (2) | 'medium' (4) | 'hard' (6)
  jlptFilter: 'all'        // 'all' | 'N5' | 'N4'
  questions: []
  currentIndex: 0
  score: 0
  answers: []              // { question, chosen, correct, wasCorrect }
  startTime: null

actions:
  startSession(mode, direction, difficulty, jlptFilter, length)
  answerQuestion(chosenAnswer)
  endSession() → returns summary
```

No persistence for quiz store (session-only state).

---

## 7. Features

### Feature 1 — Quiz Game

**Mode select (`/quiz`):** Three cards (Hiragana, Katakana, Kanji), each with a large sample character, description, difficulty selector, and direction selector. Kanji card also shows JLPT filter chips.

**Session flow:**
- `startSession` builds N shuffled questions from the data file
- Each question: one correct answer + (difficulty - 1) random wrong answers, all shuffled
- Answer buttons: 2×1 (easy), 2×2 (medium), 2×3 (hard) grid
- Correct → green flash + ascending two-tone beep → auto-advance after 600ms
- Wrong → red shake + low buzz → correct answer highlights green + tooltip → wait for user tap before advancing
- Progress bar at top, score counter in header

**End screen:** score/total, percentage, grade (S/A/B/C/D), time taken, confetti for S/A (CSS-only keyframe animation), retry + home buttons.

Grades: S=100%, A≥80%, B≥60%, C≥40%, D<40%

### Feature 2 — Flashcards

**Deck selector:** Hiragana | Katakana | Kanji (N5) | Kanji (N4)

**Card UI:**
- CSS 3D flip (perspective transform on Y axis)
- Front: character (72px+), optional romaji hint if `romajiVisible`
- Back: romaji/meaning + example sentence (kanji only)
- Prev/next buttons + swipe gesture (touch events)
- Known (✓) / Needs practice (✗) buttons → stored in `flashcardKnown`
- Mini progress bar: known count / deck total

### Feature 3 — Vocabulary Browser

**Grid:** all kanji entries, 2-col mobile / 3–4-col desktop
**Each card:** large kanji, meaning, JLPT badge (color-coded: N5=green, N4=blue), stroke count
**Filters:** JLPT chips (All/N5/N4) + search input (by kanji or meaning)
**Detail modal:** onyomi, kunyomi, example words, "Add to flashcard deck" button — toggles the kanji into/out of a custom "Favorites" deck stored as an array of kanji keys in `progressStore.favoritedKanji`. This deck appears as a 5th option ("Favorites") in the flashcard deck selector when non-empty.

### Feature 4 — Progress & Stats

- XP bar with level label
- Streak counter with flame SVG icon
- Three CSS bar charts (hiragana / katakana / kanji accuracy)
- Weak characters grid (5 cards, lowest correct%)
- Quiz history list (last 10 entries)

### Feature 5 — Gamification

- Level-up overlay: full-screen flash "Level up! → Level X — [Title]" for 2s
- Sound (Web Audio API, `soundEnabled` gate):
  - Correct: 880Hz → 1046Hz, 80ms each
  - Wrong: 200Hz buzz, 150ms
  - Level up: 523 → 659 → 784Hz, 100ms each
- CSS animations:
  - Answer button select: `scale(1.05)` bounce
  - Correct: green pulse keyframe
  - Wrong: horizontal shake keyframe (3 oscillations)
  - Card flip: `rotateY(180deg)` with `transform-style: preserve-3d`

### Feature 6 — Dark Mode Toggle

- CSS custom properties on `:root` and `[data-theme="dark"]`
- Toggle stored in `useSettingsStore.theme`
- On mount: apply `data-theme` attribute to `<html>` element
- Toggle button in top nav bar (sun/moon SVG icon)

---

## 8. UI Design

**Colors (CSS vars):**
```css
--color-primary: #E63946;     /* red */
--color-accent: #F4A261;      /* amber (XP/streak) */
--color-bg: #ffffff;          /* light mode bg */
--color-surface: #f3f4f6;
--color-text: #111827;

[data-theme="dark"] {
  --color-bg: #0f0f0f;
  --color-surface: #1a1a1a;
  --color-text: #f9fafb;
}
```

**Typography:** system font stack; CJK falls back to system fonts (no web font needed).

**Large characters:** minimum 72px, centered, in quiz and flashcard views.

**Layout:** Tailwind for spacing/layout. Custom CSS only for animations, 3D transforms, and CSS vars.

**Mobile-first:** bottom tab bar ≤767px, left sidebar ≥768px.

---

## 9. GitHub Actions — Auto Deploy

`.github/workflows/deploy.yml`:
- Trigger: push to `main`
- Steps: checkout → setup Node → npm ci → npm run build → deploy `dist/` to `gh-pages` branch
- Uses `peaceiris/actions-gh-pages` action

---

## 10. Implementation Order

| # | Branch | Deliverable |
|---|---|---|
| 0 | `feat/scaffold` | Vite project, Tailwind, Router, Pinia, empty views/components/stores/data, GH Actions |
| 1 | `feat/quiz` | Full quiz game, all modes, end screen |
| 2 | `feat/flashcards` | Flashcard UI, deck selector, known tracking |
| 3 | `feat/vocabulary` | Kanji grid, filters, detail modal |
| 4 | `feat/progress` | Stats page, accuracy charts, weak characters |
| 5 | `feat/gamification` | XP, levels, streaks, sounds, level-up overlay, confetti |
| 6 | `feat/dark-mode` | Theme toggle, CSS vars, persist setting |
