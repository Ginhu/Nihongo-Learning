import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  async function checkSession() {
    try {
      const response = await api.get('/auth/me')
      user.value = response.data
    } catch {
      user.value = null
      // Do NOT redirect — router guard handles it
    }
  }

  async function login(email, password) {
    await api.post('/auth/login', { email, password })
    await checkSession()
  }

  async function register(email, username, password) {
    await api.post('/auth/register', { email, username, password })
    await login(email, password)
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      user.value = null
      const router = await import('@/router').then((m) => m.default)
      router.push('/login')
    }
  }

  return { user, isAuthenticated, checkSession, login, register, logout }
})
