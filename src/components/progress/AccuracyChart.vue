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
