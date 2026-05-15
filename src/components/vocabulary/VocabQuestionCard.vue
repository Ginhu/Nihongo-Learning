<template>
  <div class="text-center py-8 min-h-[140px] flex flex-col items-center justify-center">

    <!-- Kanji, word→meaning: show kanji + readings -->
    <template v-if="type === 'kanji' && direction === 'word-meaning'">
      <div class="text-7xl font-bold mb-3" style="color: var(--color-text);">{{ item.kanji }}</div>
      <div class="text-sm" style="color: var(--color-text-muted);">
        <span v-if="item.onyomi.length">音: {{ item.onyomi.join('・') }}</span>
        <span v-if="item.onyomi.length && item.kunyomi.length"> · </span>
        <span v-if="item.kunyomi.length">訓: {{ item.kunyomi.join('・') }}</span>
      </div>
    </template>

    <!-- Vocab, word→meaning: show expression + reading -->
    <template v-else-if="type === 'vocab' && direction === 'word-meaning'">
      <div class="text-5xl font-bold mb-2" style="color: var(--color-text);">{{ item.expression }}</div>
      <div class="text-xl" style="color: var(--color-text-muted);">{{ item.reading }}</div>
    </template>

    <!-- Both types, meaning→word: show the English meaning -->
    <template v-else>
      <div class="text-2xl font-semibold px-4 leading-snug" style="color: var(--color-text);">
        {{ type === 'kanji' ? item.meaning[0] : item.meaning }}
      </div>
      <div class="text-xs mt-2" style="color: var(--color-text-muted);">— What is this in Japanese?</div>
    </template>

  </div>
</template>

<script setup>
defineProps({
  item:      { type: Object,  required: true },
  type:      { type: String,  required: true }, // 'vocab' | 'kanji'
  direction: { type: String,  required: true }, // 'word-meaning' | 'meaning-word'
})
</script>
