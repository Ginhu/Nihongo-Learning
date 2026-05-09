<template>
  <button
    class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="settings.toggleTheme()"
  >
    <span class="text-lg">{{ isDark ? '☀️' : '🌙' }}</span>
    <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
const settings = useSettingsStore()
const isDark = computed(() => settings.theme === 'dark')
</script>
