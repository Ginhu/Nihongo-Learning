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
      :class="[(route.name === link.name || (link.name === 'vocabulary' && route.name === 'vocabulary-session') || (link.name === 'flashcards' && route.name === 'flashcards-session')) ? 'text-primary' : '']"
      style="color: inherit;"
    >
      <span class="text-xl">{{ link.icon }}</span>
      {{ $t(link.labelKey) }}
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { name: 'home',             to: '/',                 icon: '🏠', labelKey: 'nav.home'     },
  { name: 'quiz-select',      to: '/quiz',             icon: '🎯', labelKey: 'nav.quiz'     },
  { name: 'flashcards',       to: '/flashcards',       icon: '🃏', labelKey: 'nav.cards'    },
  { name: 'vocabulary',       to: '/vocabulary',       icon: '🎮', labelKey: 'nav.words'    },
  { name: 'kanji-dictionary', to: '/kanji-dictionary', icon: '📖', labelKey: 'nav.kanji'   },
  { name: 'progress',         to: '/progress',         icon: '📊', labelKey: 'nav.progress' },
]
</script>
