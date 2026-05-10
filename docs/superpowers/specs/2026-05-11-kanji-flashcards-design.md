# Kanji Flashcard Decks — Design Spec

**Date:** 2026-05-11
**Feature:** Add Kanji N5 and N4 flashcard decks to FlashcardsView

---

## Overview

Extend the existing flashcard system to include Kanji N5 and Kanji N4 decks, with separate Kanji Favorites support. The `FlashCard.vue` component already has a complete `kanji` type rendering branch. This feature is purely wiring: new deck IDs, updated selector UI, and reactive logic in `FlashcardsView`.

---

## Deck Structure

**New deck IDs:**
- `kanji-n5` — 80 N5 kanji from `src/data/kanji.js` (filtered by `jlpt === 'N5'`)
- `kanji-n4` — 170 N4 kanji from `src/data/kanji.js` (filtered by `jlpt === 'N4'`)
- `kanji-favorites` — kanji where `card.kanji` is in `progress.favoritedKanji[]`

**Existing deck IDs (unchanged):**
- `vocab-n5`, `vocab-n4`, `favorites`

---

## Component Changes

### `DeckSelector.vue`

Replace the flat pill list with two labeled groups:

```
Vocabulary   [Vocab N5]  [Vocab N4]  [★ Favorites]
Kanji        [Kanji N5]  [Kanji N4]  [★ Favorites]
```

- Section labels: small muted text (`color: var(--color-text-muted)`) left-aligned above each row
- Each row: `flex gap-2 flex-wrap`
- Active pill: `bg-primary text-white border-primary`
- `★ Favorites` pills: conditionally rendered via props
  - `hasFavorites` (bool) — controls vocab favorites visibility (existing)
  - `hasKanjiFavorites` (bool) — controls kanji favorites visibility (new)
- No change to the `@select` emit contract

### `FlashcardsView.vue`

**Imports:**
- Add `import kanjiData from '@/data/kanji.js'`

**Deck map:**
```js
const kanjiN5 = kanjiData.filter(k => k.jlpt === 'N5')
const kanjiN4 = kanjiData.filter(k => k.jlpt === 'N4')

const deckMap = {
  'vocab-n5': n5Vocabulary,
  'vocab-n4': n4Vocabulary,
  'kanji-n5': kanjiN5,
  'kanji-n4': kanjiN4,
}
```

**Favorites computed:**
```js
const favoritedKanjiInDeck = computed(() =>
  kanjiData.filter(k => progress.favoritedKanji.includes(k.kanji))
)
```

**rawDeck computed:** extend to handle `kanji-favorites`:
```js
if (activeDeck.value === 'kanji-favorites') return favoritedKanjiInDeck.value
if (activeDeck.value === 'favorites') return favoritedVocabularyInDeck.value
return deckMap[activeDeck.value] ?? []
```

**deckType computed:**
```js
const deckType = computed(() =>
  activeDeck.value.startsWith('kanji-') ? 'kanji' : 'vocabulary'
)
```

**cardId function:**
```js
function cardId(card) {
  if (deckType.value === 'kanji') return card.kanji
  return `${card.expression}::${card.reading}`
}
```

**isCurrentFavorited computed:**
```js
const isCurrentFavorited = computed(() => {
  if (!currentCard.value) return false
  if (deckType.value === 'kanji') return progress.favoritedKanji.includes(currentCard.value.kanji)
  return progress.favoritedVocabulary.includes(cardId(currentCard.value))
})
```

**toggleFavorite function:**
```js
function toggleFavorite() {
  if (!currentCard.value) return
  if (deckType.value === 'kanji') progress.toggleFavoriteKanji(currentCard.value.kanji)
  else progress.toggleFavoriteVocabulary(cardId(currentCard.value))
}
```

**Favorite button visibility:** hidden on `favorites` and `kanji-favorites` decks (existing condition extended):
```js
v-if="activeDeck !== 'favorites' && activeDeck !== 'kanji-favorites'"
```

**DeckSelector props:**
```html
<DeckSelector
  :active-deck="activeDeck"
  :has-favorites="favoritedVocabularyInDeck.length > 0 || activeDeck === 'favorites'"
  :has-kanji-favorites="favoritedKanjiInDeck.length > 0 || activeDeck === 'kanji-favorites'"
  @select="switchDeck"
/>
```

### `FlashCard.vue`

No changes required. The `kanji` type branch already renders:
- Front: large kanji character, no hint
- Back: kanji, meanings, on/kunyomi readings, up to 2 example words

### `progress.js`

No changes required. `favoritedKanji[]` and `toggleFavoriteKanji()` already exist.

---

## Empty State Messages

- `kanji-favorites` empty deck: "Favorite kanji to see them here."
- All other empty states: unchanged

---

## Data Counts

| Deck | Cards |
|------|-------|
| Vocab N5 | 718 |
| Vocab N4 | 666 |
| Kanji N5 | 80 |
| Kanji N4 | 170 |

---

## Out of Scope

- No changes to quiz, vocabulary view, or progress view
- No new store state
- No changes to kanji card rendering
