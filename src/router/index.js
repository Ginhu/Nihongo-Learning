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
    component: () => import('@/views/FlashcardSelectView.vue')
  },
  {
    path: '/flashcards/session',
    name: 'flashcards-session',
    component: () => import('@/views/FlashcardsSessionView.vue')
  },
  {
    path: '/vocabulary',
    name: 'vocabulary',
    component: () => import('@/views/VocabularySelectView.vue')
  },
  {
    path: '/vocabulary/session',
    name: 'vocabulary-session',
    component: () => import('@/views/VocabularySessionView.vue')
  },
  {
    path: '/kanji-dictionary',
    name: 'kanji-dictionary',
    component: () => import('@/views/KanjiDictionaryView.vue')
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
