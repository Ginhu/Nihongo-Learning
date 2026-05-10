# Phase 5 — Gamification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire level-up detection into the quiz end flow — full-screen overlay that announces the new level for 2 seconds, plays the level-up sound, then transitions to the end screen.

**Architecture:** All changes are in two files. `main.css` gets a `levelup-flash` CSS keyframe + `.anim-levelup` class. `QuizSessionView.vue` already has `newLevel` from `recordQuizResult` — it just needs a `showLevelUp` ref, a `levelUpData` ref, a `<Teleport>` overlay in the template, and updated `endSession()` logic that gates the end screen behind the 2-second overlay.

**Already complete (verified, no changes needed):**
- `playCorrect()` / `playWrong()` wired in `QuizSessionView.vue`
- `playLevelUp()` implemented in `src/utils/sound.js`
- Confetti on S/A grades in `QuizEndScreen.vue`
- XP gained display in `QuizEndScreen.vue`

**Tech Stack:** Vue 3 `<Teleport>`, CSS keyframe animation, `setTimeout`, `src/utils/sound.js`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/assets/main.css` | Modify | Add `levelup-flash` keyframe + `.anim-levelup` class |
| `src/views/QuizSessionView.vue` | Modify | Level-up overlay + `playLevelUp()` call + gated end screen |

---

## Task 1: Create feat/gamification branch

- [ ] **Create and switch to feat/gamification branch**

```bash
git checkout main && git checkout -b feat/gamification
```

Expected: `Switched to a new branch 'feat/gamification'`

---

## Task 2: Add level-up CSS animation to main.css

**Files:**
- Modify: `src/assets/main.css`

Read `src/assets/main.css` first, then **append** at the very end:

```css
/* --- Level-up overlay animation --- */

@keyframes levelup-flash {
  0%   { opacity: 0; transform: scale(0.75); }
  15%  { opacity: 1; transform: scale(1.05); }
  25%  { transform: scale(1); }
  75%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.08); }
}

.anim-levelup {
  animation: levelup-flash 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

---

## Task 3: Add level-up overlay to QuizSessionView.vue

**Files:**
- Modify: `src/views/QuizSessionView.vue`

Read the file first. Then apply the following changes:

### 3A — Add `playLevelUp` to the sound import

Replace:
```js
import { playCorrect, playWrong } from '@/utils/sound'
```
With:
```js
import { playCorrect, playWrong, playLevelUp } from '@/utils/sound'
```

### 3B — Add two new refs after the existing refs block

The existing refs block ends with `let advanceTimer = null`. Insert after it:

```js
const showLevelUp = ref(false)
const levelUpData = ref({ level: 1, title: '' })
```

### 3C — Replace `endSession()` with gated version

Replace the entire `endSession` function:

```js
function endSession() {
  const result = quizStore.endSession()
  const { xpGained, newLevel } = progressStore.recordQuizResult(
    result.mode,
    result.score,
    result.total,
    result.answers
  )
  sessionResult.value = { ...result, xpGained, newLevel }

  if (newLevel) {
    levelUpData.value = { level: newLevel, title: progressStore.levelTitle }
    showLevelUp.value = true
    if (settings.soundEnabled) playLevelUp()
    setTimeout(() => {
      showLevelUp.value = false
      showEndScreen.value = true
    }, 2000)
  } else {
    showEndScreen.value = true
  }
}
```

### 3D — Add level-up overlay to the template

The template currently opens with:
```html
<template>
  <div class="max-w-lg mx-auto px-4 py-6">
```

Insert the overlay **inside** that outer `<div>`, **before** the end screen (`<QuizEndScreen ...>`):

```html
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
```

The final template structure should be:

```html
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
      ...
    />

    <!-- Active quiz -->
    <template v-else-if="quizStore.questions.length > 0">
      ...
    </template>

    <!-- No session fallback -->
    <div v-else ...>
      ...
    </div>

  </div>
</template>
```

---

## Task 4: Build verification

- [ ] **Run production build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Smoke test in dev server**

```bash
npm run dev
```

Verify:
1. Complete a quiz that would trigger a level-up (earn ≥500 XP total from level 1 — 50 correct answers with perfect bonuses, or manually set `xp` in localStorage to 490 first)
2. At quiz end → dark overlay appears with "Level Up!", level number in amber, level title in white
3. After ~2 seconds → overlay fades out and end screen appears normally
4. If `soundEnabled` is true → level-up sound plays (three ascending tones)
5. S/A grade end screen shows confetti animation
6. XP earned shown in amber pill on end screen

---

## Task 5: Commit, push, merge to main

- [ ] **Stage and commit**

```bash
git add src/assets/main.css src/views/QuizSessionView.vue
git commit -m "$(cat <<'EOF'
feat: add level-up overlay and gamification wiring

Full-screen level-up overlay with CSS pop-in animation appears for 2s
when a quiz session triggers a level increase. Plays level-up sound
(three ascending tones via Web Audio API). Overlay gates the end screen
so the player sees the level-up celebration before their score.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Push and merge**

```bash
git push -u origin feat/gamification
git checkout main
git merge feat/gamification --no-ff -m "merge: feat/gamification → main"
git push origin main
```
