<template>
  <aside
    class="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 z-20 border-r"
    style="background: var(--color-surface); border-color: var(--color-border);"
  >
    <div class="p-4 border-b" style="border-color: var(--color-border);">
      <span class="text-lg font-bold text-primary">日本語マスター</span>
    </div>
    <nav class="flex flex-col gap-1 p-3 flex-1">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="link.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="[route.name === link.name
          ? 'bg-primary text-white'
          : 'hover:bg-primary/10']"
        style="color: inherit;"
      >
        <span class="text-lg">{{ link.icon }}</span>
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="p-3 border-t space-y-1" style="border-color: var(--color-border);">
      <ThemeToggle />
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()

const links = [
  { name: 'home',       to: '/',           icon: '🏠', label: 'Home' },
  { name: 'quiz-select',to: '/quiz',        icon: '🎯', label: 'Quiz' },
  { name: 'flashcards', to: '/flashcards',  icon: '🃏', label: 'Flashcards' },
  { name: 'vocabulary', to: '/vocabulary',  icon: '📖', label: 'Vocabulary' },
  { name: 'progress',   to: '/progress',    icon: '📊', label: 'Progress' }
]
</script>
