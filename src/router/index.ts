import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import PublishPrompt from '@/pages/PublishPrompt.vue'

// Define routes
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/publish',
    name: 'publish',
    component: PublishPrompt,
  },
  {
    path: '/prompt/:id',
    name: 'prompt-detail',
    component: () => import('@/pages/PromptDetail.vue'), // Lazy load
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
