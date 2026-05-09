<template>
  <div class="rounded-xl p-4" style="background: var(--color-surface);">
    <div class="flex justify-between items-baseline mb-2">
      <div>
        <span class="text-lg font-bold">Level {{ progress.level }}</span>
        <span class="ml-2 text-sm" style="color: var(--color-text-muted);">{{ progress.levelTitle }}</span>
      </div>
      <span class="text-sm" style="color: var(--color-text-muted);">
        {{ isMaxLevel ? 'MAX' : `${xpInLevel} / 500 XP` }}
      </span>
    </div>

    <div class="h-3 rounded-full overflow-hidden" style="background: var(--color-surface-2);">
      <div
        class="h-full rounded-full transition-all duration-500"
        style="background: var(--color-accent);"
        :style="{ width: xpPercent + '%' }"
      />
    </div>

    <div class="mt-1 text-xs text-right" style="color: var(--color-text-muted);">
      {{ progress.xp }} XP total
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

const isMaxLevel = computed(() => progress.level >= 10)
const xpInLevel  = computed(() => progress.xp % 500)
const xpPercent  = computed(() =>
  isMaxLevel.value ? 100 : Math.round((xpInLevel.value / 500) * 100)
)
</script>
