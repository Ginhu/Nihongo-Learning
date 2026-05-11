<template>
  <div v-if="availableCategories.length > 0" class="flex flex-col gap-2">
    <button
      class="flex items-center gap-2 text-sm font-medium self-start px-3 py-1.5 rounded-lg border transition-colors hover:bg-primary/10"
      style="border-color: var(--color-border); color: var(--color-text-muted);"
      @click="open = !open"
    >
      <span>{{ open ? '▲' : '▼' }}</span>
      Filter by category
      <span
        v-if="selectedCategories.length > 0"
        class="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
        style="background: var(--color-primary); color: white;"
      >
        {{ selectedCategories.length }}
      </span>
    </button>

    <div v-if="open" class="flex flex-wrap gap-2">
      <button
        v-for="cat in availableCategories"
        :key="cat"
        class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
        :class="selectedCategories.includes(cat)
          ? 'bg-primary text-white border-primary'
          : 'hover:bg-primary/10'"
        style="border-color: var(--color-border);"
        @click="toggle(cat)"
      >
        {{ formatCategory(cat) }} ({{ categoryCounts[cat] ?? 0 }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  availableCategories: { type: Array, required: true },
  selectedCategories:  { type: Array, required: true },
  categoryCounts:      { type: Object, required: true }
})

const emit = defineEmits(['update:selectedCategories'])

const open = ref(false)

function formatCategory(key) {
  return key
    .replace(/_and_/g, ' & ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function toggle(cat) {
  const next = props.selectedCategories.includes(cat)
    ? props.selectedCategories.filter(c => c !== cat)
    : [...props.selectedCategories, cat]
  emit('update:selectedCategories', next)
}
</script>
