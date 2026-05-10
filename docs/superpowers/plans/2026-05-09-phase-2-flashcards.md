# Phase 2 — Flashcards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the flashcard review system — deck selector (Hiragana, Katakana, Kanji N5, Kanji N4, Favorites), CSS 3D flip card, romaji toggle, swipe navigation, known/practice tracking, and mini progress bar.

**Architecture:** FlashcardsView owns all deck/navigation/tracking state. DeckSelector is a pure presentational component. FlashCard receives raw card data + deck type and handles its own flip state. `progressStore.flashcardKnown` persists which cards are marked known. Kanji data is filled in this phase (needed for N5/N4 deck testing) — the vocabulary phase will not need to re-fill it.

**Tech Stack:** Vue 3 Composition API, Pinia (useProgressStore + useSettingsStore), CSS 3D transforms (perspective + rotateY), touch events for swipe

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/data/kanji.js` | Modify | Fill 56 entries (N5 + N4) needed for flashcard decks |
| `src/assets/main.css` | Modify | Add CSS 3D flip + card transition styles |
| `src/components/flashcard/DeckSelector.vue` | Modify | Deck tab buttons |
| `src/components/flashcard/FlashCard.vue` | Modify | 3D flip card — front/back per deck type |
| `src/views/FlashcardsView.vue` | Modify | Navigation, known tracking, progress bar, swipe |

---

## Task 1: Create feat/flashcards branch

- [ ] **Create and switch to feat/flashcards branch**

```bash
git checkout main && git checkout -b feat/flashcards
```

Expected: `Switched to a new branch 'feat/flashcards'`

---

## Task 2: Fill in kanji.js (56 entries)

**Files:**
- Modify: `src/data/kanji.js`

- [ ] **Replace src/data/kanji.js with 56 kanji entries**

```js
// 51 JLPT N5 + 5 JLPT N4 kanji entries
// TODO: Expand to full N5 (80) + N4 (168) set for production
export default [
  // --- N5 ---
  { kanji: '日', meaning: ['sun', 'day'],          onyomi: ['にち', 'じつ'], kunyomi: ['ひ', 'か'],      jlpt: 'N5', strokeCount: 4,  examples: [{ word: '日本', reading: 'にほん', meaning: 'Japan' }] },
  { kanji: '月', meaning: ['moon', 'month'],        onyomi: ['げつ', 'がつ'], kunyomi: ['つき'],          jlpt: 'N5', strokeCount: 4,  examples: [{ word: '月曜日', reading: 'げつようび', meaning: 'Monday' }] },
  { kanji: '火', meaning: ['fire'],                 onyomi: ['か'],           kunyomi: ['ひ'],            jlpt: 'N5', strokeCount: 4,  examples: [{ word: '火曜日', reading: 'かようび', meaning: 'Tuesday' }] },
  { kanji: '水', meaning: ['water'],                onyomi: ['すい'],          kunyomi: ['みず'],          jlpt: 'N5', strokeCount: 4,  examples: [{ word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' }] },
  { kanji: '木', meaning: ['tree', 'wood'],         onyomi: ['もく', 'ぼく'], kunyomi: ['き'],            jlpt: 'N5', strokeCount: 4,  examples: [{ word: '木曜日', reading: 'もくようび', meaning: 'Thursday' }] },
  { kanji: '金', meaning: ['gold', 'money'],        onyomi: ['きん', 'こん'], kunyomi: ['かね'],          jlpt: 'N5', strokeCount: 8,  examples: [{ word: '金曜日', reading: 'きんようび', meaning: 'Friday' }] },
  { kanji: '土', meaning: ['soil', 'earth'],        onyomi: ['ど', 'と'],     kunyomi: ['つち'],          jlpt: 'N5', strokeCount: 3,  examples: [{ word: '土曜日', reading: 'どようび', meaning: 'Saturday' }] },
  { kanji: '山', meaning: ['mountain'],             onyomi: ['さん'],          kunyomi: ['やま'],          jlpt: 'N5', strokeCount: 3,  examples: [{ word: '富士山', reading: 'ふじさん', meaning: 'Mt. Fuji' }] },
  { kanji: '川', meaning: ['river'],                onyomi: ['せん'],          kunyomi: ['かわ'],          jlpt: 'N5', strokeCount: 3,  examples: [{ word: '川', reading: 'かわ', meaning: 'river' }] },
  { kanji: '田', meaning: ['rice field'],           onyomi: ['でん'],          kunyomi: ['た'],            jlpt: 'N5', strokeCount: 5,  examples: [{ word: '田んぼ', reading: 'たんぼ', meaning: 'rice paddy' }] },
  { kanji: '人', meaning: ['person'],               onyomi: ['じん', 'にん'], kunyomi: ['ひと'],          jlpt: 'N5', strokeCount: 2,  examples: [{ word: '人', reading: 'ひと', meaning: 'person' }] },
  { kanji: '口', meaning: ['mouth'],                onyomi: ['こう', 'く'],   kunyomi: ['くち'],          jlpt: 'N5', strokeCount: 3,  examples: [{ word: '人口', reading: 'じんこう', meaning: 'population' }] },
  { kanji: '目', meaning: ['eye'],                  onyomi: ['もく', 'ぼく'], kunyomi: ['め'],            jlpt: 'N5', strokeCount: 5,  examples: [{ word: '目', reading: 'め', meaning: 'eye' }] },
  { kanji: '耳', meaning: ['ear'],                  onyomi: ['じ'],            kunyomi: ['みみ'],          jlpt: 'N5', strokeCount: 6,  examples: [{ word: '耳', reading: 'みみ', meaning: 'ear' }] },
  { kanji: '手', meaning: ['hand'],                 onyomi: ['しゅ'],          kunyomi: ['て'],            jlpt: 'N5', strokeCount: 4,  examples: [{ word: '手紙', reading: 'てがみ', meaning: 'letter' }] },
  { kanji: '足', meaning: ['foot', 'leg'],          onyomi: ['そく'],          kunyomi: ['あし'],          jlpt: 'N5', strokeCount: 7,  examples: [{ word: '足', reading: 'あし', meaning: 'foot/leg' }] },
  { kanji: '大', meaning: ['big', 'large'],         onyomi: ['だい', 'たい'], kunyomi: ['おお'],          jlpt: 'N5', strokeCount: 3,  examples: [{ word: '大学', reading: 'だいがく', meaning: 'university' }] },
  { kanji: '小', meaning: ['small', 'little'],      onyomi: ['しょう'],        kunyomi: ['ちい', 'こ'],   jlpt: 'N5', strokeCount: 3,  examples: [{ word: '小学校', reading: 'しょうがっこう', meaning: 'elementary school' }] },
  { kanji: '中', meaning: ['middle', 'inside'],     onyomi: ['ちゅう'],        kunyomi: ['なか'],          jlpt: 'N5', strokeCount: 4,  examples: [{ word: '中国', reading: 'ちゅうごく', meaning: 'China' }] },
  { kanji: '上', meaning: ['up', 'above'],          onyomi: ['じょう'],        kunyomi: ['うえ', 'あ'],   jlpt: 'N5', strokeCount: 3,  examples: [{ word: '上手', reading: 'じょうず', meaning: 'skilled' }] },
  { kanji: '下', meaning: ['down', 'below'],        onyomi: ['か', 'げ'],     kunyomi: ['した', 'さ'],   jlpt: 'N5', strokeCount: 3,  examples: [{ word: '地下', reading: 'ちか', meaning: 'underground' }] },
  { kanji: '本', meaning: ['book', 'root', 'origin'], onyomi: ['ほん'],       kunyomi: ['もと'],          jlpt: 'N5', strokeCount: 5,  examples: [{ word: '日本', reading: 'にほん', meaning: 'Japan' }] },
  { kanji: '円', meaning: ['circle', 'yen'],        onyomi: ['えん'],          kunyomi: ['まる'],          jlpt: 'N5', strokeCount: 4,  examples: [{ word: '円', reading: 'えん', meaning: 'yen' }] },
  { kanji: '年', meaning: ['year'],                 onyomi: ['ねん'],          kunyomi: ['とし'],          jlpt: 'N5', strokeCount: 6,  examples: [{ word: '今年', reading: 'ことし', meaning: 'this year' }] },
  { kanji: '気', meaning: ['spirit', 'mood', 'energy'], onyomi: ['き', 'け'], kunyomi: [],              jlpt: 'N5', strokeCount: 6,  examples: [{ word: '天気', reading: 'てんき', meaning: 'weather' }] },
  { kanji: '来', meaning: ['come'],                 onyomi: ['らい'],          kunyomi: ['く', 'き'],     jlpt: 'N5', strokeCount: 7,  examples: [{ word: '来週', reading: 'らいしゅう', meaning: 'next week' }] },
  { kanji: '行', meaning: ['go'],                   onyomi: ['こう', 'ぎょう'], kunyomi: ['い', 'おこな'], jlpt: 'N5', strokeCount: 6, examples: [{ word: '銀行', reading: 'ぎんこう', meaning: 'bank' }] },
  { kanji: '見', meaning: ['see', 'look'],          onyomi: ['けん'],          kunyomi: ['み'],            jlpt: 'N5', strokeCount: 7,  examples: [{ word: '見る', reading: 'みる', meaning: 'to see' }] },
  { kanji: '食', meaning: ['eat', 'food'],          onyomi: ['しょく'],        kunyomi: ['た', 'く'],     jlpt: 'N5', strokeCount: 9,  examples: [{ word: '食べ物', reading: 'たべもの', meaning: 'food' }] },
  { kanji: '飲', meaning: ['drink'],                onyomi: ['いん'],          kunyomi: ['の'],            jlpt: 'N5', strokeCount: 12, examples: [{ word: '飲み物', reading: 'のみもの', meaning: 'beverage' }] },
  { kanji: '子', meaning: ['child'],                onyomi: ['し', 'す'],     kunyomi: ['こ'],            jlpt: 'N5', strokeCount: 3,  examples: [{ word: '子供', reading: 'こども', meaning: 'child' }] },
  { kanji: '女', meaning: ['woman', 'female'],      onyomi: ['じょ', 'にょ'], kunyomi: ['おんな'],        jlpt: 'N5', strokeCount: 3,  examples: [{ word: '女性', reading: 'じょせい', meaning: 'woman' }] },
  { kanji: '男', meaning: ['man', 'male'],          onyomi: ['だん', 'なん'], kunyomi: ['おとこ'],        jlpt: 'N5', strokeCount: 7,  examples: [{ word: '男性', reading: 'だんせい', meaning: 'man' }] },
  { kanji: '学', meaning: ['study', 'learning'],    onyomi: ['がく'],          kunyomi: ['まな'],          jlpt: 'N5', strokeCount: 8,  examples: [{ word: '大学', reading: 'だいがく', meaning: 'university' }] },
  { kanji: '先', meaning: ['ahead', 'previous'],    onyomi: ['せん'],          kunyomi: ['さき'],          jlpt: 'N5', strokeCount: 6,  examples: [{ word: '先生', reading: 'せんせい', meaning: 'teacher' }] },
  { kanji: '生', meaning: ['life', 'birth', 'raw'], onyomi: ['せい', 'しょう'], kunyomi: ['い', 'う', 'なま'], jlpt: 'N5', strokeCount: 5, examples: [{ word: '学生', reading: 'がくせい', meaning: 'student' }] },
  { kanji: '語', meaning: ['language', 'word'],     onyomi: ['ご'],            kunyomi: ['かた'],          jlpt: 'N5', strokeCount: 14, examples: [{ word: '日本語', reading: 'にほんご', meaning: 'Japanese' }] },
  { kanji: '国', meaning: ['country'],              onyomi: ['こく'],          kunyomi: ['くに'],          jlpt: 'N5', strokeCount: 8,  examples: [{ word: '外国', reading: 'がいこく', meaning: 'foreign country' }] },
  { kanji: '時', meaning: ['time', 'hour'],         onyomi: ['じ'],            kunyomi: ['とき'],          jlpt: 'N5', strokeCount: 10, examples: [{ word: '時間', reading: 'じかん', meaning: 'time' }] },
  { kanji: '間', meaning: ['interval', 'between'],  onyomi: ['かん', 'けん'], kunyomi: ['あいだ', 'ま'],  jlpt: 'N5', strokeCount: 12, examples: [{ word: '時間', reading: 'じかん', meaning: 'time' }] },
  { kanji: '車', meaning: ['car', 'vehicle'],       onyomi: ['しゃ'],          kunyomi: ['くるま'],        jlpt: 'N5', strokeCount: 7,  examples: [{ word: '電車', reading: 'でんしゃ', meaning: 'train' }] },
  { kanji: '電', meaning: ['electricity'],          onyomi: ['でん'],          kunyomi: [],                jlpt: 'N5', strokeCount: 13, examples: [{ word: '電話', reading: 'でんわ', meaning: 'telephone' }] },
  { kanji: '話', meaning: ['speech', 'talk'],       onyomi: ['わ'],            kunyomi: ['はなし', 'はな'], jlpt: 'N5', strokeCount: 13, examples: [{ word: '電話', reading: 'でんわ', meaning: 'telephone' }] },
  { kanji: '何', meaning: ['what', 'how many'],     onyomi: ['か'],            kunyomi: ['なに', 'なん'],  jlpt: 'N5', strokeCount: 7,  examples: [{ word: '何人', reading: 'なんにん', meaning: 'how many people' }] },
  { kanji: '名', meaning: ['name', 'fame'],         onyomi: ['めい', 'みょう'], kunyomi: ['な'],           jlpt: 'N5', strokeCount: 6,  examples: [{ word: '名前', reading: 'なまえ', meaning: 'name' }] },
  { kanji: '白', meaning: ['white'],                onyomi: ['はく', 'びゃく'], kunyomi: ['しろ', 'しら'], jlpt: 'N5', strokeCount: 5, examples: [{ word: '白い', reading: 'しろい', meaning: 'white' }] },
  { kanji: '赤', meaning: ['red'],                  onyomi: ['せき'],          kunyomi: ['あか'],          jlpt: 'N5', strokeCount: 7,  examples: [{ word: '赤い', reading: 'あかい', meaning: 'red' }] },
  { kanji: '青', meaning: ['blue', 'green'],        onyomi: ['せい', 'しょう'], kunyomi: ['あお'],         jlpt: 'N5', strokeCount: 8,  examples: [{ word: '青い', reading: 'あおい', meaning: 'blue' }] },
  { kanji: '天', meaning: ['heaven', 'sky'],        onyomi: ['てん'],          kunyomi: ['あめ', 'あま'],  jlpt: 'N5', strokeCount: 4,  examples: [{ word: '天気', reading: 'てんき', meaning: 'weather' }] },
  { kanji: '空', meaning: ['sky', 'empty'],         onyomi: ['くう'],          kunyomi: ['そら', 'から'],  jlpt: 'N5', strokeCount: 8,  examples: [{ word: '空', reading: 'そら', meaning: 'sky' }] },
  { kanji: '雨', meaning: ['rain'],                 onyomi: ['う'],            kunyomi: ['あめ', 'あま'],  jlpt: 'N5', strokeCount: 8,  examples: [{ word: '雨', reading: 'あめ', meaning: 'rain' }] },
  // --- N4 ---
  { kanji: '意', meaning: ['meaning', 'mind'],      onyomi: ['い'],            kunyomi: [],                jlpt: 'N4', strokeCount: 13, examples: [{ word: '意味', reading: 'いみ', meaning: 'meaning' }] },
  { kanji: '会', meaning: ['meeting', 'society'],   onyomi: ['かい', 'え'],   kunyomi: ['あ'],            jlpt: 'N4', strokeCount: 6,  examples: [{ word: '会社', reading: 'かいしゃ', meaning: 'company' }] },
  { kanji: '起', meaning: ['rise', 'wake up'],      onyomi: ['き'],            kunyomi: ['お'],            jlpt: 'N4', strokeCount: 10, examples: [{ word: '起きる', reading: 'おきる', meaning: 'to wake up' }] },
  { kanji: '思', meaning: ['think'],                onyomi: ['し'],            kunyomi: ['おも'],          jlpt: 'N4', strokeCount: 9,  examples: [{ word: '思う', reading: 'おもう', meaning: 'to think' }] },
  { kanji: '知', meaning: ['know'],                 onyomi: ['ち'],            kunyomi: ['し'],            jlpt: 'N4', strokeCount: 8,  examples: [{ word: '知る', reading: 'しる', meaning: 'to know' }] },
]
```

- [ ] **Verify entry count**

```bash
node -e "import('./src/data/kanji.js').then(m => console.log('N5:', m.default.filter(k=>k.jlpt==='N5').length, 'N4:', m.default.filter(k=>k.jlpt==='N4').length, 'Total:', m.default.length))"
```

Expected: `N5: 51 N4: 5 Total: 56`

---

## Task 3: Add flashcard CSS (3D flip)

**Files:**
- Modify: `src/assets/main.css`

- [ ] **Append flashcard CSS to src/assets/main.css**

```css
/* --- Flashcard 3D flip --- */

.card-scene {
  perspective: 800px;
  width: 100%;
}

.card-inner {
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  top: 0; left: 0; right: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 1rem;
}

.card-face--back {
  transform: rotateY(180deg);
}

.card-scene-height {
  /* sets scene height so absolute card-face children have a reference */
  min-height: 280px;
}
```

---

## Task 4: Implement DeckSelector.vue

**Files:**
- Modify: `src/components/flashcard/DeckSelector.vue`

- [ ] **Replace DeckSelector.vue with full implementation**

```vue
<template>
  <div class="flex gap-2 flex-wrap">
    <button
      v-for="deck in visibleDecks"
      :key="deck.id"
      class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
      :class="[activeDeck === deck.id
        ? 'bg-primary text-white border-primary'
        : 'hover:bg-primary/10']"
      style="border-color: var(--color-border);"
      @click="$emit('select', deck.id)"
    >
      {{ deck.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeDeck:    { type: String, required: true },
  hasFavorites:  { type: Boolean, default: false }
})

defineEmits(['select'])

const decks = [
  { id: 'hiragana',  label: 'Hiragana' },
  { id: 'katakana',  label: 'Katakana' },
  { id: 'kanji-n5',  label: 'Kanji N5' },
  { id: 'kanji-n4',  label: 'Kanji N4' },
  { id: 'favorites', label: '★ Favorites' }
]

const visibleDecks = computed(() =>
  decks.filter(d => d.id !== 'favorites' || props.hasFavorites)
)
</script>
```

---

## Task 5: Implement FlashCard.vue

**Files:**
- Modify: `src/components/flashcard/FlashCard.vue`

- [ ] **Replace FlashCard.vue with full implementation**

```vue
<template>
  <div class="card-scene card-scene-height" @click="flipped = !flipped">
    <div class="card-inner" :class="{ 'is-flipped': flipped }" :style="{ height: sceneHeight + 'px' }">

      <!-- Front face -->
      <div
        class="card-face w-full flex flex-col items-center justify-center p-8 border"
        :style="{ height: sceneHeight + 'px', background: 'var(--color-surface)', borderColor: 'var(--color-border)' }"
      >
        <!-- Large character -->
        <div class="font-bold select-none text-center" style="font-size: clamp(72px, 18vw, 130px); line-height: 1;">
          {{ frontChar }}
        </div>

        <!-- Romaji hint (when romajiVisible and card not flipped) -->
        <div
          v-if="settings.romajiVisible && frontHint"
          class="mt-4 text-lg font-medium"
          style="color: var(--color-text-muted);"
        >
          {{ frontHint }}
        </div>

        <!-- Tap hint -->
        <div class="mt-6 text-xs" style="color: var(--color-text-muted);">tap to flip</div>
      </div>

      <!-- Back face -->
      <div
        class="card-face card-face--back w-full flex flex-col items-center justify-start p-8 border overflow-y-auto"
        :style="{ height: sceneHeight + 'px', background: 'var(--color-surface)', borderColor: 'var(--color-border)' }"
        @click.stop
      >
        <template v-if="type === 'kanji'">
          <!-- Kanji back -->
          <div class="font-bold text-4xl mb-2">{{ card.kanji }}</div>
          <div class="text-xl font-semibold text-center">{{ card.meaning.join(', ') }}</div>

          <div class="mt-4 w-full space-y-1 text-sm">
            <div v-if="card.onyomi.length" style="color: var(--color-text-muted);">
              <span class="font-semibold" style="color: var(--color-text);">On: </span>{{ card.onyomi.join('、') }}
            </div>
            <div v-if="card.kunyomi.length" style="color: var(--color-text-muted);">
              <span class="font-semibold" style="color: var(--color-text);">Kun: </span>{{ card.kunyomi.join('、') }}
            </div>
          </div>

          <div v-if="card.examples?.length" class="mt-4 w-full">
            <div
              v-for="ex in card.examples.slice(0, 2)"
              :key="ex.word"
              class="mt-1 p-2 rounded-lg text-sm"
              style="background: var(--color-surface-2);"
            >
              <span class="font-bold">{{ ex.word }}</span>
              <span class="ml-2" style="color: var(--color-text-muted);">{{ ex.reading }}</span>
              <span class="ml-2">— {{ ex.meaning }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Kana back -->
          <div class="font-bold select-none" style="font-size: clamp(48px, 12vw, 80px); line-height: 1;">
            {{ card.kana }}
          </div>
          <div class="mt-4 text-3xl font-semibold">{{ card.romaji }}</div>
          <div class="mt-2 text-sm px-3 py-1 rounded-full" style="background: var(--color-surface-2); color: var(--color-text-muted);">
            {{ card.group }} group
          </div>
        </template>

        <div class="mt-6 text-xs" style="color: var(--color-text-muted);">tap to flip back</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  card:  { type: Object, required: true },
  type:  { type: String, required: true }, // 'hiragana' | 'katakana' | 'kanji'
  sceneHeight: { type: Number, default: 300 }
})

const settings = useSettingsStore()
const flipped = ref(false)

// Reset flip when card changes
watch(() => props.card, () => { flipped.value = false })

const frontChar = computed(() =>
  props.type === 'kanji' ? props.card.kanji : props.card.kana
)

const frontHint = computed(() => {
  if (props.type === 'kanji') return props.card.meaning?.[0] ?? null
  return props.card.romaji ?? null
})
</script>
```

---

## Task 6: Implement FlashcardsView.vue

**Files:**
- Modify: `src/views/FlashcardsView.vue`

- [ ] **Replace FlashcardsView.vue with full implementation**

```vue
<template>
  <div class="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

    <!-- Deck selector -->
    <DeckSelector
      :active-deck="activeDeck"
      :has-favorites="favoritedKanjiInDeck.length > 0 || activeDeck === 'favorites'"
      @select="switchDeck"
    />

    <!-- Empty deck message -->
    <div v-if="deck.length === 0" class="text-center py-16" style="color: var(--color-text-muted);">
      <div class="text-4xl mb-3">📭</div>
      <p>No cards in this deck yet.</p>
      <p v-if="activeDeck === 'favorites'" class="text-sm mt-1">Add kanji from the Vocabulary page.</p>
    </div>

    <template v-else>
      <!-- Progress bar + known count -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-2 rounded-full overflow-hidden" style="background: var(--color-surface-2);">
          <div
            class="h-full transition-all duration-300"
            style="background: var(--color-accent);"
            :style="{ width: `${knownPercent}%` }"
          />
        </div>
        <span class="text-sm font-medium whitespace-nowrap" style="color: var(--color-text-muted);">
          {{ knownCount }} / {{ deck.length }} known
        </span>
      </div>

      <!-- Card position -->
      <div class="flex items-center justify-between text-sm" style="color: var(--color-text-muted);">
        <span>Card {{ currentIndex + 1 }} of {{ deck.length }}</span>
        <button
          class="text-xs px-2 py-1 rounded border transition-colors hover:bg-primary/10"
          style="border-color: var(--color-border);"
          @click="shuffle"
        >Shuffle</button>
      </div>

      <!-- Flash card -->
      <div
        ref="cardContainer"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <FlashCard
          :card="currentCard"
          :type="deckType"
          :scene-height="320"
        />
      </div>

      <!-- Known / Needs practice buttons -->
      <div class="flex gap-3 justify-center">
        <button
          class="flex-1 max-w-[160px] py-3 rounded-xl border font-semibold text-sm transition-colors"
          :class="[isCurrentKnown
            ? 'border-green-500 bg-green-500/20 text-green-600'
            : 'hover:bg-red-500/10 hover:border-red-400']"
          style="border-color: var(--color-border);"
          @click="markCard(false)"
        >
          ✗ Needs Practice
        </button>
        <button
          class="flex-1 max-w-[160px] py-3 rounded-xl border font-semibold text-sm transition-colors"
          :class="[isCurrentKnown
            ? 'border-green-500 bg-green-500/20 text-green-600'
            : 'hover:bg-green-500/10 hover:border-green-400']"
          style="border-color: var(--color-border);"
          @click="markCard(true)"
        >
          ✓ Known
        </button>
      </div>

      <!-- Navigation buttons -->
      <div class="flex gap-3 justify-center">
        <button
          class="px-8 py-3 rounded-xl border font-semibold transition-colors hover:bg-primary/10 disabled:opacity-30"
          style="border-color: var(--color-border);"
          :disabled="currentIndex === 0"
          @click="prev"
        >← Prev</button>
        <button
          class="px-8 py-3 rounded-xl border font-semibold transition-colors hover:bg-primary/10 disabled:opacity-30"
          style="border-color: var(--color-border);"
          :disabled="currentIndex === deck.length - 1"
          @click="next"
        >Next →</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProgressStore } from '@/stores/progress'
import hiragana from '@/data/hiragana.js'
import katakana from '@/data/katakana.js'
import kanji from '@/data/kanji.js'
import DeckSelector from '@/components/flashcard/DeckSelector.vue'
import FlashCard from '@/components/flashcard/FlashCard.vue'

const progress = useProgressStore()

const activeDeck = ref('hiragana')
const currentIndex = ref(0)
let touchStartX = 0

// Build deck arrays
const deckMap = {
  hiragana:  hiragana,
  katakana:  katakana,
  'kanji-n5': kanji.filter(k => k.jlpt === 'N5'),
  'kanji-n4': kanji.filter(k => k.jlpt === 'N4'),
}

const favoritedKanjiInDeck = computed(() =>
  kanji.filter(k => progress.favoritedKanji.includes(k.kanji))
)

const deck = computed(() => {
  if (activeDeck.value === 'favorites') return favoritedKanjiInDeck.value
  return deckMap[activeDeck.value] ?? []
})

const deckType = computed(() => {
  if (activeDeck.value === 'hiragana') return 'hiragana'
  if (activeDeck.value === 'katakana') return 'katakana'
  return 'kanji'
})

const currentCard = computed(() => deck.value[currentIndex.value])

// Card ID for tracking
function cardId(card) {
  return deckType.value === 'kanji' ? card.kanji : card.kana
}

const isCurrentKnown = computed(() => {
  if (!currentCard.value) return false
  return progress.flashcardKnown.includes(cardId(currentCard.value))
})

const knownCount = computed(() =>
  deck.value.filter(card => {
    const id = deckType.value === 'kanji' ? card.kanji : card.kana
    return progress.flashcardKnown.includes(id)
  }).length
)

const knownPercent = computed(() =>
  deck.value.length > 0 ? Math.round((knownCount.value / deck.value.length) * 100) : 0
)

function switchDeck(deckId) {
  activeDeck.value = deckId
  currentIndex.value = 0
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < deck.value.length - 1) currentIndex.value++
}

function markCard(known) {
  if (!currentCard.value) return
  progress.recordFlashcardKnown(cardId(currentCard.value), known)
  // Auto-advance to next card after marking
  if (currentIndex.value < deck.value.length - 1) {
    setTimeout(() => { currentIndex.value++ }, 300)
  }
}

function shuffle() {
  // Fisher-Yates on a copy — we just change currentIndex to random
  currentIndex.value = Math.floor(Math.random() * deck.value.length)
}

// Swipe detection
function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (dx < -50) next()
  else if (dx > 50) prev()
}

// Reset index when deck changes
watch(activeDeck, () => { currentIndex.value = 0 })
</script>
```

---

## Task 7: Build verification

- [ ] **Run production build**

```bash
npm run build
```

Expected: No errors. Flashcard-related chunks in output.

- [ ] **Start dev server and smoke-test**

```bash
npm run dev
```

Open browser. Verify:
1. Navigate to `/flashcards` → Deck selector shows Hiragana, Katakana, Kanji N5, Kanji N4 (Favorites hidden if empty)
2. Hiragana deck loads — card shows a hiragana character
3. Tap card → flips with 3D animation, shows romaji on back
4. Next/Prev buttons navigate cards
5. Swipe left/right navigates (mobile or DevTools touch simulation)
6. ✓ Known button marks card, progress bar updates
7. Switch to Kanji N5 — card shows kanji on front, meaning/onyomi/kunyomi/example on back
8. Romaji toggle in sidebar — shows/hides romaji hint on front face

If any step fails, fix before reporting DONE.

---

## Task 8: Commit, push, merge to main

- [ ] **Stage all changes**

```bash
git add .
```

- [ ] **Commit**

```bash
git commit -m "$(cat <<'EOF'
feat: implement flashcard review system

Flashcard decks for hiragana, katakana, kanji N5/N4, and favorites.
CSS 3D perspective flip animation, romaji toggle, swipe navigation,
known/practice tracking persisted to localStorage, and mini progress
bar. Fills in 56 kanji entries (51 N5 + 5 N4) for deck testing.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Push and merge**

```bash
git push -u origin feat/flashcards
git checkout main
git merge feat/flashcards --no-ff -m "merge: feat/flashcards → main"
git push origin main
```
