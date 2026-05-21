<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-[var(--color-primary)]">日本語マスター</h1>
        <p class="mt-1 text-[var(--color-text-muted)]">Nihongo Master</p>
      </div>

      <!-- Card -->
      <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-lg">
        <h2 class="text-xl font-semibold text-[var(--color-text)] mb-6">Sign In</h2>

        <!-- Error message -->
        <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
          {{ error }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-60 transition"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <!-- Footer link -->
        <p class="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Don't have an account?
          <button @click="router.push('/register')" class="text-[var(--color-primary)] font-medium hover:underline ml-1">
            Register
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}


</script>
