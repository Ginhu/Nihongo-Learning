<template>
  <div class="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
    <h1 class="text-2xl font-bold">Progress</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <XpBar />
      <StreakBadge />
    </div>

    <AccuracyChart />

    <WeakCharacters />

    <div class="rounded-xl p-4" style="background: var(--color-surface);">
      <h3 class="font-semibold text-sm mb-3" style="color: var(--color-text-muted);">RECENT QUIZZES</h3>

      <div v-if="recentHistory.length === 0" class="text-sm" style="color: var(--color-text-muted);">
        No quizzes completed yet. Start a quiz to see your history!
      </div>

      <div v-else>
        <div
          v-for="(h, i) in recentHistory"
          :key="i"
          class="flex items-center justify-between py-2 text-sm border-b last:border-b-0"
          style="border-color: var(--color-border);"
        >
          <div>
            <span class="font-semibold capitalize">{{ h.mode }}</span>
            <span class="ml-2" style="color: var(--color-text-muted);">{{ formatDate(h.date) }}</span>
          </div>
          <div>
            <span class="font-semibold">{{ h.score }}/{{ h.total }}</span>
            <span class="ml-1" style="color: var(--color-text-muted);">
              ({{ h.total > 0 ? Math.round((h.score / h.total) * 100) : 0 }}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import XpBar          from '@/components/progress/XpBar.vue'
import StreakBadge    from '@/components/progress/StreakBadge.vue'
import AccuracyChart  from '@/components/progress/AccuracyChart.vue'
import WeakCharacters from '@/components/progress/WeakCharacters.vue'

const progress = useProgressStore()

const recentHistory = computed(() => progress.quizHistory.slice(0, 10))

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
