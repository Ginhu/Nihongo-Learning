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
    percent: Math.min(100, Math.max(0, Math.round(accuracy * 100))),
  }))
)
</script>
