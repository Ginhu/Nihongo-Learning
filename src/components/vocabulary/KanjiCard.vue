<template>
  <button
    class="w-full rounded-xl border p-4 flex flex-col items-center gap-2 transition-colors hover:bg-primary/5 text-left cursor-pointer"
    style="background: var(--color-surface); border-color: var(--color-border);"
    @click="$emit('select')"
    :aria-label="`${kanji.kanji} — ${kanji.meaning[0]}, ${kanji.jlpt}`"
  >
    <!-- JLPT badge (top-right) -->
    <span
      class="self-end text-xs font-bold px-2 py-0.5 rounded-full"
      :class="kanji.jlpt === 'N5' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
    >{{ kanji.jlpt }}</span>

    <!-- Large kanji character -->
    <div class="font-bold select-none" style="font-size: clamp(48px, 10vw, 72px); line-height: 1;">
      {{ kanji.kanji }}
    </div>

    <!-- Primary meanings (first 2) -->
    <div class="text-sm text-center" style="color: var(--color-text-muted);">
      {{ kanji.meaning.slice(0, 2).join(', ') }}
    </div>

    <!-- Stroke count -->
    <div class="text-xs" style="color: var(--color-text-muted);">
      {{ kanji.strokeCount }} strokes
    </div>
  </button>
</template>

<script setup>
defineProps({
  kanji: { type: Object, required: true }
})
defineEmits(['select'])
</script>
