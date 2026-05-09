<template>
  <button
    @click="settings.romajiVisible = !settings.romajiVisible"
    class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10"
    :title="settings.romajiVisible ? 'Hide rōmaji' : 'Show rōmaji'"
  >
    <span class="text-lg">{{ settings.romajiVisible ? '👁' : '🚫' }}</span>
    <span class="hidden md:inline">Rōmaji {{ settings.romajiVisible ? 'ON' : 'OFF' }}</span>
  </button>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
const settings = useSettingsStore()
</script>
