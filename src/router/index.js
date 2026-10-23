import { createRouter, createWebHistory } from 'vue-router'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import VerifyResetCodeView from '../views/VerifyResetCodeView.vue'
import NewPasswordView from '../views/NewPasswordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { requiresAuthBackground: true, side: 'left' }
    },
    {
      path: '/verify-reset-code',
      name: 'verify-reset-code',
      component: VerifyResetCodeView,
      meta: { requiresAuthBackground: true, side: 'right' }
    },
    {
      path: '/new-password',
      name: 'new-password',
      component: NewPasswordView,
      meta: { requiresAuthBackground: true, side: 'left' }
    }

  ],
})

export default router
