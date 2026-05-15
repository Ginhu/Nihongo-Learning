<template>
  <nav
    class="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t h-16"
    style="background: var(--color-surface); border-color: var(--color-border);"
  >
    <RouterLink
      v-for="link in links"
      :key="link.name"
      :to="link.to"
      class="flex flex-col items-center gap-0.5 flex-1 py-1 text-xs font-medium transition-colors"
      :class="[(route.name === link.name || (link.name === 'vocabulary' && route.name === 'vocabulary-session')) ? 'text-primary' : '']"
      style="color: inherit;"
    >
      <span class="text-xl">{{ link.icon }}</span>
      {{ link.label }}
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { name: 'home',             to: '/',                  icon: '🏠', label: 'Home' },
  { name: 'quiz-select',      to: '/quiz',               icon: '🎯', label: 'Quiz' },
  { name: 'flashcards',       to: '/flashcards',         icon: '🃏', label: 'Cards' },
  { name: 'vocabulary',       to: '/vocabulary',         icon: '🎮', label: 'Words' },
  { name: 'kanji-dictionary', to: '/kanji-dictionary',   icon: '📖', label: 'Kanji' },
  { name: 'progress',         to: '/progress',           icon: '📊', label: 'Progress' },
]
</script>
