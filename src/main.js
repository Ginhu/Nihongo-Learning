import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import i18n from './i18n'
import { useSettingsStore } from './stores/settings'
import './assets/main.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

const settings = useSettingsStore()
i18n.global.locale.value = settings.language
settings.applyTheme()

app.mount('#app')
