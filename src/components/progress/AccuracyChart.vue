<template>
  <div class="rounded-xl p-4 space-y-4" style="background: var(--color-surface);">
    <h3 class="font-semibold text-sm" style="color: var(--color-text-muted);">{{ $t('progress.accuracyByScript') }}</h3>

    <div v-for="bar in bars" :key="bar.label" class="space-y-1">
      <div class="flex justify-between text-sm">
        <span class="font-medium">{{ bar.label }}</span>
        <span style="color: var(--color-text-muted);">
          {{ bar.acc !== null ? bar.acc + '%' : $t('progress.noData') }}
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
import { useContentStore } from '@/stores/content'

const progress = useProgressStore()
const contentStore = useContentStore()

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

const bars = computed(() => {
  const hiraganaSet = new Set(contentStore.kana.filter(k => k.type === 'hiragana').map(k => k.kana))
  const katakanaSet = new Set(contentStore.kana.filter(k => k.type === 'katakana').map(k => k.kana))
  const kanjiSet    = new Set(contentStore.kanji.map(k => k.kanji))
  return [
    { label: 'Hiragana', acc: groupAccuracy(hiraganaSet) },
    { label: 'Katakana', acc: groupAccuracy(katakanaSet) },
    { label: 'Kanji',    acc: groupAccuracy(kanjiSet)    },
  ]
})
</script>
