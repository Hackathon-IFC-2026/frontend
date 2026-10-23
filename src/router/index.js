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

const routes = [
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
    path: '/projetos',
    name: 'projetos',
    component: Projetos,
    meta: { requiresAuthBackground: false },
  },
  {
    path: '/kanban/:id?',
    name: 'projeto-detalhes',
    component: KanbanView,
    meta: { requiresAuthBackground: false },
  },
  {
    path: '/tarefas',
    name: 'tarefas',
    component: Tarefas,
    meta: { requiresAuthBackground: false },
  },
  {
    path: '/minhas-tarefas',
    name: 'minhas-tarefas',
    component: MinhasTarefas,
    meta: { requiresAuthBackground: false },
  },
  {
    path: '/calendario',
    name: 'calendario',
    component: Calendario,
    meta: { requiresAuthBackground: false },
  },
  {
    path: '/configuracoes',
    name: 'configuracoes',
    component: Configuracoes,
    meta: { requiresAuthBackground: false },
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: Perfil,
    meta: { requiresAuthBackground: false },
  },
  {
    path: '/notificacoes',
    name: 'notificacoes',
    component: Notificacoes,
    meta: { requiresAuthBackground: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
