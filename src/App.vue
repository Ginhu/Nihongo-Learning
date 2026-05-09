<template>
  <div class="min-h-screen" style="background: var(--color-bg); color: var(--color-text);">
    <AppSidebar />

    <!-- Mobile theme toggle (fixed top-right, hidden on desktop where sidebar handles it) -->
    <button
      class="md:hidden fixed top-3 right-3 z-30 p-2 rounded-lg border text-lg transition-colors hover:bg-primary/10"
      style="background: var(--color-surface); border-color: var(--color-border);"
      :aria-label="settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      :title="settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="settings.toggleTheme()"
    >{{ settings.theme === 'dark' ? '☀️' : '🌙' }}</button>

    <main class="md:ml-56 pb-16 md:pb-0 min-h-screen">
      <RouterView />
    </main>

    <AppBottomNav />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useProgressStore } from '@/stores/progress'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'

const settings = useSettingsStore()
const progress = useProgressStore()

onMounted(() => {
  settings.applyTheme()
  progress.checkStreak()
})
</script>
