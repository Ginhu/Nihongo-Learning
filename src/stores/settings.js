import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'nihongo-settings'

export const useSettingsStore = defineStore('settings', () => {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { /* use defaults */ }

  const quizLength = ref(saved.quizLength ?? 10)
  const romajiVisible = ref(saved.romajiVisible ?? true)
  const soundEnabled = ref(saved.soundEnabled ?? true)
  const theme = ref(saved.theme ?? 'dark')

  function applyTheme() {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      quizLength: quizLength.value,
      romajiVisible: romajiVisible.value,
      soundEnabled: soundEnabled.value,
      theme: theme.value
    }))
  }

  watch([quizLength, romajiVisible, soundEnabled, theme], persist, { deep: true })

  return { quizLength, romajiVisible, soundEnabled, theme, applyTheme, toggleTheme }
})
