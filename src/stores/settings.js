import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import api from '@/composables/useApi'

export const useSettingsStore = defineStore('settings', () => {
  const quizLength    = ref(10)
  const romajiVisible = ref(true)
  const soundEnabled  = ref(true)
  const theme         = ref('dark')
  const VALID_LANGS   = ['en', 'pt-BR']
  const language      = ref('en')

  function applyTheme() {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
  }

  function setLanguage(lang) {
    language.value = lang
  }

  async function init() {
    try {
      const { data } = await api.get('/settings')
      if (data.quiz_length    != null) quizLength.value    = data.quiz_length
      if (data.romaji_visible != null) romajiVisible.value = data.romaji_visible
      if (data.sound_enabled  != null) soundEnabled.value  = data.sound_enabled
      if (data.theme          != null) theme.value         = data.theme
      if (data.language != null && VALID_LANGS.includes(data.language)) language.value = data.language
    } catch (err) {
      console.error('[settings] init failed, using defaults:', err)
    }
  }

  let debounceTimer = null
  watch([quizLength, romajiVisible, soundEnabled, theme, language], () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      api.patch('/settings', {
        quiz_length:    quizLength.value,
        romaji_visible: romajiVisible.value,
        sound_enabled:  soundEnabled.value,
        theme:          theme.value,
        language:       language.value
      }).catch(err => console.error('[settings] patch failed:', err))
    }, 500)
  }, { deep: true })

  return { quizLength, romajiVisible, soundEnabled, theme, language, applyTheme, toggleTheme, setLanguage, init }
})
