<template>
  <div class="min-h-screen" style="background: var(--color-bg); color: var(--color-text);">
    <AppSidebar />

    <!-- Mobile controls (fixed top-right, hidden on desktop where sidebar handles it) -->
    <div class="md:hidden fixed top-3 right-3 z-30 flex gap-2">
      <button
        class="p-2 rounded-lg border text-lg transition-colors hover:bg-primary/10"
        style="background: var(--color-surface); border-color: var(--color-border);"
        :aria-label="locale === 'en' ? 'Switch to Português' : 'Switch to English'"
        :title="locale === 'en' ? 'Switch to Português' : 'Switch to English'"
        @click="toggleLanguage"
      >🌐</button>
      <button
        class="p-2 rounded-lg border text-lg transition-colors hover:bg-primary/10"
        style="background: var(--color-surface); border-color: var(--color-border);"
        :aria-label="settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="settings.toggleTheme()"
      >{{ settings.theme === 'dark' ? '☀️' : '🌙' }}</button>
    </div>

    <main class="md:ml-56 pb-16 md:pb-0 min-h-screen">
      <RouterView />
    </main>

    <AppBottomNav />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useProgressStore } from '@/stores/progress'
import { useContentStore } from '@/stores/content'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'

const { locale } = useI18n()
const authStore = useAuthStore()
const settings = useSettingsStore()
const progressStore = useProgressStore()
const contentStore = useContentStore()

function toggleLanguage() {
  const next = locale.value === 'en' ? 'pt-BR' : 'en'
  locale.value = next
  settings.setLanguage(next)
  contentStore.refetchLang(next)
}

onMounted(async () => {
  settings.applyTheme()
  await authStore.checkSession()
  if (authStore.isAuthenticated) {
    await settings.init()
    settings.applyTheme()
    await contentStore.fetchAll(settings.language)
    await progressStore.init()
  }
})
</script>
