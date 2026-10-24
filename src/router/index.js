import { createRouter, createWebHistory } from 'vue-router'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import VerifyResetCodeView from '../views/VerifyResetCodeView.vue'
import NewPasswordView from '../views/NewPasswordView.vue'
import Login from '../views/LoginView.vue'
import Cadastro from '../views/CadastroView.vue'
import Projetos from '../views/ProjetosView.vue'
import Tarefas from '../views/TarefasView.vue'
import MinhasTarefas from '../views/MinhasTarefasView.vue'
import Calendario from '../views/CalendarioView.vue'
import Configuracoes from '../views/ConfiguracoesView.vue'
import KanbanView from '../views/KanbanView.vue'
import Perfil from '../views/PerfilView.vue'
import Notificacoes from '../views/NotificacoesView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/kanban', redirect: '/projects' },
  {
    path: '/',
    redirect: '/cadastro',
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuthBackground: true, side: 'right' },
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: Cadastro,
    meta: { requiresAuthBackground: true, side: 'left' },
  },
  {
    path: '/recuperar-senha',
    name: 'recuperar-senha',
    component: ForgotPasswordView,
    meta: { requiresAuthBackground: true, side: 'left' },
  },
  {
    path: '/verificacao-codigo',
    name: 'verificacao-codigo',
    component: VerifyResetCodeView,
    meta: { requiresAuthBackground: true, side: 'right' },
  },
  {
    path: '/nova-senha',
    name: 'nova-senha',
    component: NewPasswordView,
    meta: { requiresAuthBackground: true, side: 'left' },
  },
  {
    path: '/projects',
    alias: '/projetos',
    name: 'projetos',
    component: Projetos,
    meta: { requiresAuthBackground: false, requiresAuth: true },
  },
  {
    path: '/projects/:id',
    alias: ['/projetos/:id', '/kanban/:id', '/projetos/:id/kanban'],
    name: 'projeto-detalhes',
    component: KanbanView,
    meta: { requiresAuthBackground: false, requiresAuth: true },
  },
  {
    path: '/tarefas',
    name: 'tarefas',
    component: Tarefas,
    meta: { requiresAuthBackground: false, requiresAuth: true },
  },
  {
    path: '/minhas-tarefas',
    name: 'minhas-tarefas',
    component: MinhasTarefas,
    meta: { requiresAuthBackground: false, requiresAuth: true },
  },
  {
    path: '/calendario',
    name: 'calendario',
    component: Calendario,
    meta: { requiresAuthBackground: false, requiresAuth: true },
  },
  {
    path: '/configuracoes',
    name: 'configuracoes',
    component: Configuracoes,
    meta: { requiresAuthBackground: false, requiresAuth: true },
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: Perfil,
    meta: { requiresAuthBackground: false, requiresAuth: true },
  },
  {
    path: '/notificacoes',
    name: 'notificacoes',
    component: Notificacoes,
    meta: { requiresAuthBackground: false, requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async to => {
  if (!to.meta.requiresAuth) return true
  const auth = useAuthStore()
  try {
    if (await auth.restaurarSessao()) return true
  } catch { /* O login permite refazer uma sessão inválida. */ }
  return { name: 'login', query: { redirect: to.fullPath } }
})
window.addEventListener('auth:expired', () => {
  if (router.currentRoute.value.meta.requiresAuth) router.replace({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
})
export default router
