<template>
  <div class="flex flex-col items-center gap-4 py-6">
    <!-- Progress bar -->
    <div class="w-full h-2 rounded-full overflow-hidden" style="background: var(--color-surface-2);">
      <div
        class="h-full bg-primary transition-all duration-300"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <!-- Score + question counter -->
    <div class="flex justify-between w-full text-sm font-medium" style="color: var(--color-text-muted);">
      <span>Question {{ current }} / {{ total }}</span>
      <span>Score: {{ score }}</span>
    </div>

    <!-- The prompt (large character or text) -->
    <div
      class="mt-4 text-center font-bold select-none"
      style="font-size: clamp(72px, 15vw, 120px); line-height: 1.1;"
    >
      {{ prompt }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  prompt:  { type: String, required: true },
  current: { type: Number, required: true },
  total:   { type: Number, required: true },
  score:   { type: Number, required: true }
})

const progress = computed(() => Math.round(((props.current - 1) / props.total) * 100))
</script>
