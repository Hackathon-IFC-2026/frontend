import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/LoginView.vue'
import Cadastro from '../views/CadastroView.vue'
import Home from '../views/HomeView.vue'

const routes = [
  { path: '/', redirect: '/cadastro' },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuthBackground: true, side: 'right' }
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: Cadastro,
    meta: { requiresAuthBackground: true, side: 'left' }
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { requiresAuthBackground: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
