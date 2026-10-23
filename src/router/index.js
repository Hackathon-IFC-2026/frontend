import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/LoginView.vue'
import Cadastro from '../views/CadastroView.vue'
import Projetos from '../views/ProjetosView.vue'
import Tarefas from '../views/TarefasView.vue'
import Calendario from '../views/CalendarioView.vue'
import Configuracoes from '../views/ConfiguracoesView.vue'

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
    path: '/projetos',
    name: 'projetos',
    component: Projetos,
    meta: { requiresAuthBackground: false }
  },
  {
    path: '/tarefas',
    name: 'tarefas',
    component: Tarefas,
    meta: { requiresAuthBackground: false }
  },
  {
    path: '/calendario',
    name: 'calendario',
    component: Calendario,
    meta: { requiresAuthBackground: false }
  },
  {
    path: '/configuracoes',
    name: 'configuracoes',
    component: Configuracoes,
    meta: { requiresAuthBackground: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
