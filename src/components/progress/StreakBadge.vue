<template>
  <div class="rounded-xl p-4 flex items-center gap-4" style="background: var(--color-surface);">
    <span class="text-4xl leading-none" role="img" aria-label="streak fire">🔥</span>
    <div>
      <div class="text-3xl font-bold leading-none">{{ progress.streak }}</div>
      <div class="text-sm mt-1" style="color: var(--color-text-muted);">{{ $t('progress.dayStreak') }}</div>
    </div>
  </div>
</template>

<script setup>
import { useProgressStore } from '@/stores/progress'
const progress = useProgressStore()
</script>
