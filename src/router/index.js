import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/quiz',
    name: 'quiz-select',
    component: () => import('@/views/QuizSelectView.vue')
  },
  {
    path: '/quiz/:mode',
    name: 'quiz-session',
    component: () => import('@/views/QuizSessionView.vue')
  },
  {
    path: '/flashcards',
    name: 'flashcards',
    component: () => import('@/views/FlashcardsView.vue')
  },
  {
    path: '/vocabulary',
    name: 'vocabulary',
    component: () => import('@/views/VocabularyView.vue')
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('@/views/ProgressView.vue')
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
