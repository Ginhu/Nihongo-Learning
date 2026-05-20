import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/quiz',
    name: 'quiz-select',
    component: () => import('@/views/QuizSelectView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quiz/:mode',
    name: 'quiz-session',
    component: () => import('@/views/QuizSessionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/flashcards',
    name: 'flashcards',
    component: () => import('@/views/FlashcardSelectView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/flashcards/session',
    name: 'flashcards-session',
    component: () => import('@/views/FlashcardsSessionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vocabulary',
    name: 'vocabulary',
    component: () => import('@/views/VocabularySelectView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vocabulary/session',
    name: 'vocabulary-session',
    component: () => import('@/views/VocabularySessionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/kanji-dictionary',
    name: 'kanji-dictionary',
    component: () => import('@/views/KanjiDictionaryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('@/views/ProgressView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) return { name: 'login' }
  return true
})

export default router
