<template>
  <div class="flex flex-col gap-3">
    <div>
      <div class="text-xs font-semibold mb-1.5 uppercase tracking-wide" style="color: var(--color-text-muted);">Vocabulary</div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="lvl in vocabLevels"
          :key="lvl.id"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="selectedLevel === lvl.id
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="$emit('select-level', selectedLevel === lvl.id ? null : lvl.id)"
        >
          {{ lvl.label }}
        </button>
        <button
          v-if="hasFavorites"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="activeDeck === 'favorites'
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="$emit('select', 'favorites')"
        >
          ★ Favorites
        </button>
      </div>
    </div>

    <div>
      <div class="text-xs font-semibold mb-1.5 uppercase tracking-wide" style="color: var(--color-text-muted);">Kanji</div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="deck in kanjiDecks"
          :key="deck.id"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="activeDeck === deck.id
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-primary/10'"
          style="border-color: var(--color-border);"
          @click="$emit('select', deck.id)"
        >
          {{ deck.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeDeck:        { type: String, default: null },
  selectedLevel:     { type: String, default: null },
  hasFavorites:      { type: Boolean, default: false },
  hasKanjiFavorites: { type: Boolean, default: false }
})

defineEmits(['select', 'select-level'])

const vocabLevels = [
  { id: 'N5', label: 'N5' },
  { id: 'N4', label: 'N4' },
]

const kanjiDecks = computed(() => [
  { id: 'kanji-n5', label: 'N5' },
  { id: 'kanji-n4', label: 'N4' },
  ...(props.hasKanjiFavorites ? [{ id: 'kanji-favorites', label: '★ Favorites' }] : [])
])
</script>
