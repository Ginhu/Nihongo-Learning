<template>
  <div class="min-h-screen" style="background: var(--color-bg); color: var(--color-text);">
    <AppSidebar />

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
