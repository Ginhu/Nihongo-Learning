# Flashcard Category Filter — Design Spec

**Date:** 2026-05-11
**Feature:** Vocabulary flashcard category filtering, batch sessions, enriched card back

---

## Overview

Enhance the flashcard section to allow users to filter vocabulary by JLPT level and category, receive manageable 20-card batches, and see richer information (part-of-speech, JLPT level) on the back of each card.

---

## Requirements

### Deck Selection
- Default state (page load): mixed deck — 10 random N5 + 10 random N4 = 20 cards. No level pre-selected.
- User can select N5 or N4. Clicking the active level again deselects it (returns to mixed).
- Kanji decks and Favorites are unchanged.

### Category Filter
- Visible only when a specific JLPT level (N5 or N4) is selected.
- Collapsible: hidden behind a "Filter by category" toggle button; expands to show chips.
- Multi-select: user can toggle multiple categories simultaneously.
- Each chip shows the category name + word count for the selected level: e.g., **"Time & Calendar (18)"**.
- Category labels formatted from snake_case: `time_and_calendar` → "Time & Calendar" (`_and_` → " & ", underscores → spaces, title-cased).
- When categories are selected, switching to the other JLPT level resets selected categories to empty.

### Batch Sessions (20-card cap)
- Mixed mode (no level selected): always exactly 20 cards (10 N5 + 10 N4), no Continue.
- Level selected, no categories: pool = all words at that level, shuffled. Show first 20.
- Level selected, categories selected: pool = words matching level + any selected category, shuffled. Show first 20.
- When the user reaches the last card of a batch and more cards remain in the pool: show a **Continue** button that loads the next 20 from remaining unseen cards.
- When the pool is exhausted after the last batch: show "You've completed all cards in this selection!" in place of the Continue button.
- If a category has fewer than 20 words: show all, no Continue.
- Any filter change (level or categories) resets `batchOffset` to 0 and reshuffles the pool.

### Card Back — Vocabulary
Add two new elements below the meaning:
- **Part-of-speech badge**: displays `card.pos` (e.g., "noun", "verb", "adjective"). Styled as a subtle pill using `--color-surface-2`.
- **JLPT tag**: displays `card.jlpt` (e.g., "N5"). Same pill style, visually distinct (accent color border or text).

---

## Architecture

### State (FlashcardsView)
| State | Type | Default | Description |
|---|---|---|---|
| `selectedLevel` | `null \| 'N5' \| 'N4'` | `null` | Active JLPT level |
| `selectedCategories` | `string[]` | `[]` | Active category keys |
| `batchOffset` | `number` | `0` | Index into sessionPool for current batch |
| `shuffledPool` | `object[]` | `[]` | Full shuffled eligible word list |

### Computed (FlashcardsView)
- **`sessionPool`**: derived from `selectedLevel` + `selectedCategories`. If level is null → 10 random N5 + 10 random N4. If level set + no categories → all words at level. If level + categories → words matching level AND any selected category. Always shuffled via Fisher-Yates and stored in `shuffledPool` ref (reset on filter change).
- **`currentBatch`**: `shuffledPool.slice(batchOffset, batchOffset + 20)`.
- **`hasMore`**: `batchOffset + 20 < shuffledPool.length`.
- **`availableCategories`**: derived from selected level's vocabulary data — `[...new Set(words.map(w => w.category))].sort()`.
- **`categoryCounts`**: `Map<string, number>` — count of words per category for the selected level.

### Components

#### `DeckSelector.vue` (modified)
- JLPT vocab buttons become toggles. Clicking active level emits `select-level` with `null`.
- New emit: `select-level(level: 'N5' | 'N4' | null)`.
- Existing `select` emit retained for kanji/favorites deck switching.

#### `CategoryFilter.vue` (new)
- Props: `availableCategories: string[]`, `selectedCategories: string[]`, `categoryCounts: Map<string, number>`
- Emits: `update:selectedCategories(categories: string[])`
- Renders a collapsible section with a toggle button and pill chips.
- Chip label format: formatted category name + count in parentheses.
- Active chips: filled primary style. Inactive: outlined.

#### `FlashcardsView.vue` (modified)
- Replaces `activeDeck` string with `selectedLevel` + `selectedCategories` state for vocabulary decks.
- Keeps `activeDeck` string for kanji/favorites routing.
- Renders `CategoryFilter` below `DeckSelector` when `selectedLevel` is not null and not a kanji/favorites deck.
- Shows Continue button when `hasMore` is true and `currentIndex === currentBatch.length - 1`.
- Continue action: `batchOffset += 20`, `currentIndex = 0`.
- Progress bar and "Card X of Y" use `currentBatch.length`.

#### `FlashCard.vue` (modified)
- Vocabulary back face: add pos badge and jlpt tag below meaning.
- Pos label: capitalize first letter of `card.pos`.
- JLPT tag: `card.jlpt` with accent color border.

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Category has < 20 words | Show all, no Continue button |
| Pool exhausted | "You've completed all cards in this selection!" replaces Continue |
| Level switched while categories selected | `selectedCategories` resets to `[]` |
| Favorites / Kanji decks selected | Category filter hidden; batch logic does not apply |
| Mixed mode (no level) | Always 20 cards, no Continue, no category filter |

---

## Out of Scope
- Category filter for kanji decks
- Saving selected categories across sessions
- Progress tracking per category (separate feature)
