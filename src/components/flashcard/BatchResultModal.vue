<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background: rgba(0,0,0,0.6);"
    @click.self="$emit('back')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-result-title"
      class="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-6"
      style="background: var(--color-surface);"
    >
      <div id="batch-result-title" class="text-2xl font-bold text-center">Round Complete! 🎉</div>

      <div class="w-full flex flex-col gap-3">
        <div
          class="flex items-center justify-between px-4 py-3 rounded-xl"
          style="background: var(--color-surface-2);"
        >
          <span class="font-semibold text-green-500">✓ Known</span>
          <span class="text-2xl font-bold text-green-500">{{ batchKnown }}</span>
        </div>
        <div
          class="flex items-center justify-between px-4 py-3 rounded-xl"
          style="background: var(--color-surface-2);"
        >
          <span class="font-semibold text-red-500">✗ Needs Practice</span>
          <span class="text-2xl font-bold text-red-500">{{ batchPractice }}</span>
        </div>
      </div>

      <div class="w-full flex flex-col gap-3">
        <button
          v-if="hasMore"
          class="w-full py-3 rounded-xl font-semibold text-sm transition-colors"
          style="background: var(--color-primary); color: white;"
          @click="$emit('continue')"
        >
          Continue →
        </button>
        <button
          class="w-full py-3 rounded-xl font-semibold text-sm border transition-colors hover:opacity-80"
          style="border-color: var(--color-border);"
          @click="$emit('back')"
        >
          ← Back to Selection
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  batchKnown:    { type: Number, required: true },
  batchPractice: { type: Number, required: true },
  hasMore:       { type: Boolean, required: true }
})

defineEmits(['continue', 'back'])
</script>
