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
        :class="[(route.name === link.name || (link.name === 'vocabulary' && route.name === 'vocabulary-session') || (link.name === 'flashcards' && route.name === 'flashcards-session'))
          ? 'bg-primary text-white'
          : 'hover:bg-primary/10']"
        style="color: inherit;"
      >
        <span class="text-lg">{{ link.icon }}</span>
        {{ $t(link.labelKey) }}
      </RouterLink>
    </nav>
    <div class="p-3 border-t space-y-1" style="border-color: var(--color-border);">
      <!-- user avatar + name → /profile -->
      <RouterLink v-if="authStore.isAuthenticated" to="/profile" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-primary/10" style="color: inherit;">
        <span class="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
          {{ authStore.user?.username?.[0]?.toUpperCase() ?? '?' }}
        </span>
        <span class="truncate">{{ authStore.user?.username }}</span>
      </RouterLink>
      <LanguageToggle />
      <ThemeToggle />
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ThemeToggle    from './ThemeToggle.vue'
import LanguageToggle from './LanguageToggle.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const links = [
  { name: 'home',             to: '/',                 icon: '🏠', labelKey: 'nav.home'            },
  { name: 'quiz-select',      to: '/quiz',             icon: '🎯', labelKey: 'nav.quiz'            },
  { name: 'flashcards',       to: '/flashcards',       icon: '🃏', labelKey: 'nav.flashcards'      },
  { name: 'vocabulary',       to: '/vocabulary',       icon: '🎮', labelKey: 'nav.vocabularyQuiz'  },
  { name: 'kanji-dictionary', to: '/kanji-dictionary', icon: '📖', labelKey: 'nav.kanjiDictionary' },
  { name: 'progress',         to: '/progress',         icon: '📊', labelKey: 'nav.progress'        },
]
</script>
