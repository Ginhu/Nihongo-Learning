<template>
  <Teleport to="body">
    <div
      v-if="kanji"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style="background: rgba(0,0,0,0.5);"
      @click.self="$emit('close')"
    >
      <div
        ref="modalEl"
        class="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
        style="background: var(--color-surface);"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
      >
        <!-- Header row: big kanji + meanings + close button -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="font-bold" style="font-size: 72px; line-height: 1;">{{ kanji.kanji }}</div>
            <div id="modal-title" class="text-lg font-semibold mt-1">{{ kanji.meaning.join(', ') }}</div>
          </div>
          <button
            class="text-2xl p-1 rounded-lg transition-colors hover:bg-primary/10"
            style="color: var(--color-text-muted);"
            aria-label="Close"
            @click="$emit('close')"
          >✕</button>
        </div>

        <!-- JLPT badge + stroke count -->
        <div class="flex gap-2 mb-4">
          <span
            class="text-xs font-bold px-2 py-1 rounded-full"
            :class="kanji.jlpt === 'N5' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
          >{{ kanji.jlpt }}</span>
          <span
            class="text-xs px-2 py-1 rounded-full"
            style="background: var(--color-surface-2); color: var(--color-text-muted);"
          >{{ kanji.strokeCount }} strokes</span>
        </div>

        <!-- Readings -->
        <div class="space-y-2 mb-4 text-sm">
          <div v-if="kanji.onyomi?.length">
            <span class="font-semibold">On'yomi: </span>
            <span style="color: var(--color-text-muted);">{{ kanji.onyomi.join('、') }}</span>
          </div>
          <div v-if="kanji.kunyomi?.length">
            <span class="font-semibold">Kun'yomi: </span>
            <span style="color: var(--color-text-muted);">{{ kanji.kunyomi.join('、') }}</span>
          </div>
        </div>

        <!-- Example words -->
        <div v-if="kanji.examples?.length" class="mb-4">
          <div class="text-sm font-semibold mb-2">Examples</div>
          <div class="space-y-2">
            <div
              v-for="ex in kanji.examples"
              :key="ex.word"
              class="p-3 rounded-lg text-sm"
              style="background: var(--color-surface-2);"
            >
              <span class="font-bold text-base">{{ ex.word }}</span>
              <span class="ml-2" style="color: var(--color-text-muted);">{{ ex.reading }}</span>
              <div style="color: var(--color-text-muted);">{{ ex.meaning }}</div>
            </div>
          </div>
        </div>

        <!-- Add / Remove from Flashcard Deck -->
        <button
          class="w-full py-3 rounded-xl font-semibold text-sm border transition-colors"
          :class="isFavorited
            ? 'border-primary text-primary hover:bg-primary/10'
            : 'bg-primary text-white hover:bg-primary/90 border-primary'"
          @click="$emit('toggle-favorite')"
        >
          {{ isFavorited ? '★ Remove from Flashcard Deck' : '☆ Add to Flashcard Deck' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  kanji:       { type: Object,  default: null },
  isFavorited: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'toggle-favorite'])

const modalEl = ref(null)

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.kanji, (val) => {
  if (val) {
    document.addEventListener('keydown', onKeydown)
    // Focus the modal panel on next tick so the element is rendered
    setTimeout(() => modalEl.value?.focus(), 0)
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
