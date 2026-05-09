<template>
  <div class="flex gap-2 flex-wrap">
    <button
      v-for="deck in visibleDecks"
      :key="deck.id"
      class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
      :class="[activeDeck === deck.id
        ? 'bg-primary text-white border-primary'
        : 'hover:bg-primary/10']"
      style="border-color: var(--color-border);"
      @click="$emit('select', deck.id)"
    >
      {{ deck.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeDeck:    { type: String, required: true },
  hasFavorites:  { type: Boolean, default: false }
})

defineEmits(['select'])

const decks = [
  { id: 'hiragana',  label: 'Hiragana' },
  { id: 'katakana',  label: 'Katakana' },
  { id: 'kanji-n5',  label: 'Kanji N5' },
  { id: 'kanji-n4',  label: 'Kanji N4' },
  { id: 'favorites', label: '★ Favorites' }
]

const visibleDecks = computed(() =>
  decks.filter(d => d.id !== 'favorites' || props.hasFavorites)
)
</script>
