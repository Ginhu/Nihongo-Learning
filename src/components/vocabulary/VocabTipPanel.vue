<template>
  <div v-if="examples && examples.length > 0" class="mt-4">

    <!-- Tip buttons -->
    <div class="flex gap-2 flex-wrap mb-3">
      <button
        v-for="(_, i) in examples"
        :key="'tip-btn-' + i"
        :disabled="answered || i !== tipsUsed"
        class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
        :class="{
          'opacity-50 cursor-default':                    i < tipsUsed,
          'border-primary/60 hover:bg-primary/10':        i === tipsUsed && !answered,
          'opacity-30 cursor-not-allowed border-border':  i > tipsUsed || answered
        }"
        style="border-color: var(--color-border);"
        @click="onUseTip"
      >
        {{ $t('vocabQuiz.tip') }} {{ i + 1 }}
      </button>
    </div>

    <!-- Revealed examples -->
    <div
      v-for="i in tipsUsed"
      :key="'tip-reveal-' + i"
      class="text-sm p-3 rounded-xl mb-2"
      style="background: var(--color-surface-2); color: var(--color-text-muted);"
    >
      <span class="font-semibold" style="color: var(--color-text);">{{ examples[i - 1].word }}</span>
      ({{ examples[i - 1].reading }}) — {{ examples[i - 1].meaning }}
    </div>

  </div>
</template>

<script setup>
defineProps({
  examples:  { type: Array,   required: true },
  tipsUsed:  { type: Number,  required: true }, // 0–3
  answered:  { type: Boolean, default: false },
})

const emit = defineEmits(['use-tip'])

function onUseTip() {
  emit('use-tip')
}
</script>
