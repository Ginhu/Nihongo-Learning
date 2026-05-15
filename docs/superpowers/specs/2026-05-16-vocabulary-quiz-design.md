# Vocabulary Quiz — Design Spec

**Date:** 2026-05-16  
**Status:** Approved  

---

## Overview

Refactor the `/vocabulary` route from a passive kanji browser into an active guessing game. The existing kanji browser moves to `/kanji-dictionary`. The new vocabulary quiz follows the same select → session → results pattern as flashcards.

---

## Routes

| Route | View | Notes |
|---|---|---|
| `/vocabulary` | `VocabularySelectView` | new — selection screen |
| `/vocabulary/session` | `VocabularySessionView` | new — game session |
| `/kanji-dictionary` | `KanjiDictionaryView` | renamed from `VocabularyView`, no logic changes |

---

## Files

**New:**
- `src/views/VocabularySelectView.vue`
- `src/views/VocabularySessionView.vue`
- `src/components/vocabulary/VocabQuestionCard.vue`
- `src/components/vocabulary/VocabTipPanel.vue`

**Renamed:**
- `src/views/VocabularyView.vue` → `src/views/KanjiDictionaryView.vue` (no content changes)

**Modified:**
- `src/router/index.js` — new routes, update `/vocabulary` entry
- `src/stores/progress.js` — add `recordVocabQuizResult()`
- Sidebar nav component — add "Kanji Dictionary" entry, rename "Vocabulary" to "Vocabulary Quiz"

---

## Selection Screen (`VocabularySelectView`)

Same visual pattern as `FlashcardSelectView`. Sections rendered top to bottom:

| Section | Options | Condition |
|---|---|---|
| **Type** | Vocabulary · Kanji | always |
| **Level** | All · N5 · N4 · ★ Favorites | always; Favorites conditional on store |
| **Direction** | Word → Meaning · Meaning → Word | always |
| **Difficulty** | Easy · Normal · Hard | always |
| **Categories** | inline chips with counts | vocab + N5 or N4 only |
| **Count** | multiples of 10 up to min(50, pool) + "All (N)" | always except Favorites |

On Start, pushes to `/vocabulary/session` with query params:
```
?type=vocab|kanji
&level=all|N5|N4|favorites|kanji-favorites
&direction=word-meaning|meaning-word
&difficulty=easy|normal|hard
&count=<number>|all
&categories=cat1,cat2   (optional)
```

Redirects back to `/vocabulary` if session route is hit without query params.

---

## Session Screen (`VocabularySessionView`)

### Question Card (`VocabQuestionCard`)

| Direction | Prompt shown |
|---|---|
| Word → Meaning | `expression` + `reading` (vocab) or `kanji` + onyomi/kunyomi line (kanji) |
| Meaning → Word | English meaning string |

### Answer Grid

- **Easy**: 2 options  
- **Normal**: 4 options  
- **Hard**: 6 options  

Distractors: drawn randomly from the same type+level pool, deduplicated by meaning to avoid showing two options that say the same thing.

### Answer Feedback (auto-advance, no tap needed)

- **Correct**: button turns green → auto-advance after 1 s  
- **Wrong**: selected button turns red, correct button turns green → auto-advance after 1.5 s  
- All buttons disabled once answered

### Tips (`VocabTipPanel`)

- Available on **kanji type only**, both directions  
- Rendered as `Tip 1`, `Tip 2`, `Tip 3` — only as many buttons as examples on that kanji entry (typically 3)  
- Tapping reveals the example inline: `word (reading) — meaning`  
- Buttons disabled after answering  
- `tipsUsed` counter (0–3) tracked per card, used to calculate XP

### Progress Indicator

Progress bar + `Q x / N` counter at top. Score counter alongside. Same layout as `QuizSessionView`.

### End Screen

Reuses existing `QuizEndScreen` component (score, total, time taken, XP gained).

---

## XP Formula

Base XP per correct answer: **10**

| Tips used | XP multiplier | XP earned |
|---|---|---|
| 0 | 100% | +10 |
| 1 | 80% | +8 |
| 2 | 40% | +4 |
| 3 | 10% | +1 |

Wrong answer: **0 XP** regardless of tips used before answering.

**Perfect session bonus: +50 XP** — awarded when score === total (all correct), regardless of tips used.

Per-question XP is computed during the session. A running `totalXp` ref accumulates it.

---

## Progress Store Changes

New action: `recordVocabQuizResult(mode, score, total, xpTotal)`

- `mode`: string like `'vocab-N5'`, `'vocab-N4'`, `'vocab-all'`, `'kanji-N5'`, `'kanji-N4'`, `'kanji-all'`
- Appends to existing `quizHistory[]` array (same shape as existing quiz entries)
- Adds `xpTotal` directly to `xp` (instead of recalculating from score — tips make per-question XP variable)
- Triggers level-up check

---

## Navigation

- Rename "Vocabulary" nav item → "Vocabulary Quiz", route stays `/vocabulary`
- Add new "Kanji Dictionary" nav item → `/kanji-dictionary`
