<template>
  <button
    class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10"
    style="color: inherit;"
    @click="toggle"
  >
    <span class="text-lg">🌐</span>
    <span>{{ locale === 'en' ? $t('language.ptBR') : $t('language.en') }}</span>
  </button>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'

const { locale } = useI18n()
const settings = useSettingsStore()

function toggle() {
  const next = locale.value === 'en' ? 'pt-BR' : 'en'
  locale.value = next
  settings.setLanguage(next)
}
</script>
