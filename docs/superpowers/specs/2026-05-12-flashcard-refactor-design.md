# Flashcard Section Refactor — Design Spec

**Date:** 2026-05-12
**Feature:** Split flashcard flow into selection screen + session screen, add batch results modal

---

## Overview

Refactor the single `FlashcardsView.vue` into a two-screen flow matching the quiz pattern:
- `/flashcards` — selection screen (type, level, count, categories, Start)
- `/flashcards/session` — card session screen (the actual flashcards)

State is passed from selection to session via route query params. A results modal appears at the end of each batch.

---

## Routes

| Path | View (new filename) | Role |
|---|---|---|
| `/flashcards` | `FlashcardSelectView.vue` (new) | Selection screen |
| `/flashcards/session` | `FlashcardsSessionView.vue` (renamed from FlashcardsView.vue) | Card session |

---

## File Changes

| Action | File | Notes |
|---|---|---|
| Create | `src/views/FlashcardSelectView.vue` | New selection screen |
| Rename | `src/views/FlashcardsView.vue` → `src/views/FlashcardsSessionView.vue` | Session screen, reads from query |
| Create | `src/components/flashcard/BatchResultModal.vue` | End-of-batch results overlay |
| Delete | `src/components/flashcard/DeckSelector.vue` | Replaced by selection screen |
| Delete | `src/components/flashcard/CategoryFilter.vue` | Replaced by inline chips on selection screen |
| Modify | `src/router/index.js` | Add `/flashcards/session` route, update `/flashcards` component |

---

## Selection Screen (`FlashcardSelectView.vue`)

### Layout (top to bottom)

**1. Type selector**
Two large toggle buttons: "Vocabulary" / "Kanji". One always active. Default: Vocabulary.

**2. Level selector**
Pill buttons: "All" / "N5" / "N4". One always active. Default: All.
- "All" = mixed mode (no level-specific filtering)
- Favorites option: if user has favorited vocab/kanji, a "★ Favorites" pill appears in this row. Selecting Favorites hides categories and count selector (deck is fixed to favorites list).

**3. Count selector**
Dynamic options computed from pool size:
- Generate multiples of 10 from 10 to min(50, poolSize - 1), strictly less than pool size
- Always append "All (N)" where N = total pool size
- Examples: pool 18 → [10, All (18)]; pool 45 → [10, 20, 30, 40, All (45)]; pool 511 → [10, 20, 30, 40, 50, All (511)]; pool 8 → [All (8)]
- Default: highest option ≤ 20, or "All" if pool < 10
- Hidden when Favorites is selected

**4. Category filter (inline chips)**
Visible only when type=Vocabulary AND level=N5 or N4 (not All, not Favorites).
- Chips displayed inline (no collapsible toggle)
- Each chip shows: formatted category name + word count for selected level (e.g. "Time & Calendar (18)")
- Multi-select: zero or more selected
- Selecting categories updates the pool size → count options recompute reactively

**5. Start button**
Always enabled. On click: `router.push({ path: '/flashcards/session', query })`.

### Query Params

| Param | Values | Notes |
|---|---|---|
| `type` | `vocab` \| `kanji` | Card type |
| `level` | `all` \| `N5` \| `N4` \| `favorites` \| `kanji-favorites` | Deck source |
| `count` | number \| `all` | Number of cards per batch, or "all" for full pool |
| `categories` | comma-joined string (optional) | e.g. `time_and_calendar,food_and_drink` |

---

## Session Screen (`FlashcardsSessionView.vue`)

Reads all config from `$route.query` on mount. Builds `shuffledPool` and `currentBatch` exactly as before.

**Changes from current FlashcardsView:**
- No `DeckSelector` or `CategoryFilter` — removed entirely
- `← Back` button (top-left) navigates to `/flashcards`
- Continue button removed — replaced by `BatchResultModal`
- "You've completed all cards" message removed — replaced by modal with no Continue option
- Batch-local known/needs-practice counter tracked per batch (resets on Continue)

**Batch tracking:**
- `batchKnown` ref: count of cards marked Known in current batch
- `batchPractice` ref: count of cards marked Needs Practice in current batch
- Both reset to 0 when `continueSession()` is called
- `markCard(known)` increments the appropriate counter

**Modal trigger:**
- Modal is shown when `markCard()` is called on `currentIndex === currentBatch.length - 1` (i.e. the user marks the last card in the batch)
- If `hasMore` is true: modal shows with Continue button
- If `hasMore` is false (pool exhausted or non-paginated deck): modal shows with no Continue button
- Reshuffling resets `showModal` to false

---

## Results Modal (`BatchResultModal.vue`)

Displayed as a full-screen overlay (Teleport to body or inline overlay with backdrop).

**Content:**
- Title: "Round Complete! 🎉"
- Known count: green — "✓ Known: N"
- Needs Practice count: red — "✗ Needs Practice: N"
- Button: "Continue →" (visible only when `hasMore` is true) — closes modal, calls `continueSession()`
- Button: "← Back to Selection" — navigates to `/flashcards`

**Props:**
- `batchKnown: Number`
- `batchPractice: Number`
- `hasMore: Boolean`

**Emits:**
- `continue` — user clicked Continue
- `back` — user clicked Back to Selection

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Favorites deck is empty | Start button navigates to session; session shows empty-state message |
| Pool < 10 | Count selector shows only "All (N)" |
| Pool exhausted after last batch | Modal shows with no Continue button |
| User navigates directly to `/flashcards/session` with no query | Session shows empty-state / redirects to `/flashcards` |
| Category selection changes pool to 0 | Count selector shows "All (0)", Start is still enabled but session shows empty-state |

---

## Out of Scope

- Saving last-used selection across sessions
- Per-category progress tracking
- Animated transitions between selection and session screens
