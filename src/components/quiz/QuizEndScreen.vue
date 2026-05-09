<template>
  <div class="relative flex flex-col items-center gap-6 py-10 px-6 overflow-hidden">
    <!-- CSS confetti (S or A grade only) -->
    <template v-if="showConfetti">
      <div
        v-for="i in 40"
        :key="i"
        class="pointer-events-none absolute top-0 anim-confetti"
        :style="confettiStyle(i)"
      />
    </template>

    <!-- Grade badge -->
    <div
      class="flex items-center justify-center rounded-full text-white font-black"
      :class="gradeBg"
      style="width: 96px; height: 96px; font-size: 48px;"
    >
      {{ grade }}
    </div>

    <!-- Score -->
    <div class="text-center">
      <div class="text-4xl font-bold">{{ score }} / {{ total }}</div>
      <div class="text-lg mt-1" style="color: var(--color-text-muted);">{{ percentage }}% correct</div>
      <div class="text-sm mt-1" style="color: var(--color-text-muted);">Time: {{ formattedTime }}</div>
    </div>

    <!-- XP gained -->
    <div class="px-4 py-2 rounded-full text-sm font-semibold" style="background: var(--color-surface); color: var(--color-accent);">
      +{{ xpGained }} XP earned
    </div>

    <!-- Buttons -->
    <div class="flex gap-4 mt-2">
      <button
        class="px-6 py-3 rounded-xl border font-semibold transition-colors hover:bg-primary/10"
        style="border-color: var(--color-border);"
        @click="$emit('home')"
      >Home</button>
      <button
        class="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        @click="$emit('retry')"
      >Retry</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score:     { type: Number, required: true },
  total:     { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  xpGained:  { type: Number, default: 0 }
})

defineEmits(['retry', 'home'])

const percentage = computed(() => props.total > 0 ? Math.round((props.score / props.total) * 100) : 0)

const grade = computed(() => {
  const p = percentage.value
  if (p === 100) return 'S'
  if (p >= 80)   return 'A'
  if (p >= 60)   return 'B'
  if (p >= 40)   return 'C'
  return 'D'
})

const gradeBg = computed(() => ({
  'bg-yellow-500': grade.value === 'S',
  'bg-green-500':  grade.value === 'A',
  'bg-blue-500':   grade.value === 'B',
  'bg-orange-500': grade.value === 'C',
  'bg-red-500':    grade.value === 'D'
}))

const showConfetti = computed(() => grade.value === 'S' || grade.value === 'A')

const formattedTime = computed(() => {
  const m = Math.floor(props.timeTaken / 60)
  const s = props.timeTaken % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
})

const CONFETTI_COLORS = ['#E63946', '#F4A261', '#2a9d8f', '#e9c46a', '#264653', '#f1faee']

function confettiStyle(i) {
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
  const left = (i * 2.5) % 100
  const delay = ((i * 0.15) % 3).toFixed(2)
  const duration = (2.5 + (i % 4) * 0.5).toFixed(1)
  const size = 6 + (i % 4) * 2

  return {
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    background: color,
    borderRadius: i % 3 === 0 ? '50%' : '2px',
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}
</script>
