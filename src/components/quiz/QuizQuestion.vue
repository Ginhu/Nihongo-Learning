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
    <div class="mt-4 text-center select-none">
      <div class="font-bold" style="font-size: clamp(72px, 15vw, 120px); line-height: 1.1;">
        {{ prompt }}
      </div>

      <!-- Readings (kanji only) -->
      <div v-if="onyomi || kunyomi" class="mt-3 flex flex-col items-center gap-1">
        <div v-if="onyomi && onyomi.length" class="flex items-center gap-2 text-sm">
          <span class="font-semibold px-1.5 py-0.5 rounded text-xs" style="background: var(--color-surface-2); color: var(--color-text-muted);">onyomi</span>
          <span style="color: var(--color-text);">{{ onyomi.join('  ・  ') }}</span>
        </div>
        <div v-if="kunyomi && kunyomi.length" class="flex items-center gap-2 text-sm">
          <span class="font-semibold px-1.5 py-0.5 rounded text-xs" style="background: var(--color-surface-2); color: var(--color-text-muted);">kunyomi</span>
          <span style="color: var(--color-text);">{{ kunyomi.join('  ・  ') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  prompt:  { type: String, required: true },
  current: { type: Number, required: true },
  total:   { type: Number, required: true },
  score:   { type: Number, required: true },
  onyomi:  { type: Array, default: null },
  kunyomi: { type: Array, default: null }
})

const progress = computed(() => Math.round(((props.current - 1) / props.total) * 100))
</script>
