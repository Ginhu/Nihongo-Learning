<template>
  <div class="p-6 max-w-lg mx-auto">
    <h1 class="text-2xl font-bold text-[var(--color-text)] mb-6">Profile</h1>

    <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6">
      <!-- Avatar placeholder + username -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-bold select-none">
          {{ avatarInitial }}
        </div>
        <div>
          <p class="text-xl font-semibold text-[var(--color-text)]">{{ user?.username ?? '—' }}</p>
          <p class="text-sm text-[var(--color-text-muted)]">{{ user?.email ?? '—' }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-[var(--color-border)]"></div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-[var(--color-surface-2)] rounded-xl p-4 text-center">
          <p class="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Level</p>
          <p class="text-2xl font-bold text-[var(--color-accent)]">{{ progressStore.level }}</p>
          <p class="text-sm text-[var(--color-text-muted)] mt-0.5">{{ progressStore.levelTitle }}</p>
        </div>
        <div class="bg-[var(--color-surface-2)] rounded-xl p-4 text-center">
          <p class="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">XP</p>
          <p class="text-2xl font-bold text-[var(--color-accent)]">{{ progressStore.xp }}</p>
          <p class="text-sm text-[var(--color-text-muted)] mt-0.5">experience points</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-[var(--color-border)]"></div>

      <!-- Sign out -->
      <button
        @click="handleLogout"
        class="w-full py-2.5 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:opacity-90 transition"
      >
        Sign Out
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'

const authStore = useAuthStore()
const progressStore = useProgressStore()

const user = computed(() => authStore.user)

const avatarInitial = computed(() => {
  const name = user.value?.username || user.value?.email || '?'
  return name.charAt(0).toUpperCase()
})

function handleLogout() {
  authStore.logout()
}
</script>
