<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { useSidebarStore } from '@/stores/sidebar'
import { useAuthStore } from '@/stores/auth'
import { useNotificacoesStore } from '@/stores/notificacoes'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const notificacoes = useNotificacoesStore()
const route = useRoute()
const router = useRouter()
const panel = ref(null)
const nav = ref(null)
const indicator = ref(null)
const opener = ref(null)
const mobile = ref(window.matchMedia('(max-width: 767px)').matches)
const compacta = computed(() => sidebarStore.isCollapsed && !mobile.value)
const nomeUsuario = computed(
  () => authStore.usuario?.nome || authStore.usuario?.name || 'Minha conta',
)
const iniciais = computed(() =>
  nomeUsuario.value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase(),
)
const itens = [
  { nome: 'Dashboard', icon: 'dashboard', to: '/dashboard', key: 'dashboard' },
  { nome: 'Projetos', icon: 'folder', to: '/projects', key: 'projetos' },
  { nome: 'Minhas Tarefas', icon: 'task_alt', to: '/minhas-tarefas', key: 'minhas-tarefas' },
  { nome: 'Calendário', icon: 'calendar_month', to: '/calendario', key: 'calendario' },
  { nome: 'Notificações', icon: 'notifications', to: '/notificacoes', key: 'notificacoes' },
]
const ativa = (item) =>
  item.key === route.name || (item.key === 'projetos' && route.name === 'projeto-detalhes')
const tituloPagina = computed(
  () =>
    itens.find(ativa)?.nome ||
    { perfil: 'Meu perfil', configuracoes: 'Configurações' }[route.name] ||
    'Kando',
)
let context, media, animation, mobileAnimation, observer
let bodyOverflow = null
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
function unlockBody() {
  if (bodyOverflow !== null) {
    document.body.style.overflow = bodyOverflow
    bodyOverflow = null
  }
}
function setIndicator(animate = true) {
  const selected = nav.value?.querySelector('.menu-item.is-active')
  if (!indicator.value) return
  if (!selected) {
    gsap.set(indicator.value, { opacity: 0 })
    return
  }
  const target = {
    y: selected.offsetTop,
    height: selected.offsetHeight,
    opacity: 1,
    duration: animate && !reduce() ? 0.28 : 0,
    ease: 'power2.out',
    overwrite: true,
  }
  context?.add(() => gsap.to(indicator.value, target))
}
function animateWidth(animate = true) {
  if (!panel.value) return
  animation?.kill()
  const layout = panel.value.closest('.app-layout')
  context.add(() => {
    animation = gsap
      .timeline({ defaults: { ease: 'power2.inOut', duration: animate && !reduce() ? 0.3 : 0 } })
      .to(layout, { '--sidebar-width': sidebarStore.isCollapsed ? '76px' : '260px' }, 0)
      .to(
        panel.value.querySelectorAll('.nav-copy, .brand-copy, .group-label'),
        { opacity: compacta.value ? 0 : 1 },
        0,
      )
  })
}
async function animateMobile(open) {
  mobileAnimation?.kill()
  if (!mobile.value) {
    unlockBody()
    gsap.set(panel.value, { clearProps: 'transform' })
    return
  }
  if (open) {
    if (bodyOverflow === null) {
      bodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    await nextTick()
  }
  context.add(() => {
    mobileAnimation = gsap.to(panel.value, {
      x: 0,
      xPercent: open ? 0 : -105,
      duration: reduce() ? 0 : 0.3,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: () => {
        if (open) panel.value?.querySelector('button, a')?.focus()
        else {
          unlockBody()
          opener.value?.focus()
        }
      },
    })
  })
}
function handleKey(event) {
  if (!mobile.value || !sidebarStore.mobileOpen) return
  if (event.key === 'Escape') {
    event.preventDefault()
    sidebarStore.closeMobile()
    return
  }
  if (event.key !== 'Tab') return
  const focusable = [...panel.value.querySelectorAll('a[href], button:not([disabled])')]
  const first = focusable[0],
    last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
function resize() {
  mobile.value = window.matchMedia('(max-width: 767px)').matches
  sidebarStore.closeMobile()
  animateWidth(false)
  animateMobile(false)
  setIndicator(false)
}
watch(
  () => sidebarStore.isCollapsed,
  () => {
    animateWidth()
    nextTick(() => setIndicator(false))
  },
)
watch(
  () => sidebarStore.mobileOpen,
  (value) => {
    if (context) animateMobile(value)
  },
)
watch(
  () => route.fullPath,
  () => {
    sidebarStore.closeMobile()
    nextTick(() => setIndicator())
  },
)
async function handleLogout() {
  sidebarStore.closeMobile()
  authStore.logout()
  await router.push('/login')
}
onMounted(() => {
  context = gsap.context(() => {}, panel.value)
  media = window.matchMedia('(max-width: 767px)')
  media.addEventListener('change', resize)
  document.addEventListener('keydown', handleKey)
  animateWidth(false)
  if (mobile.value) gsap.set(panel.value, { x: 0, xPercent: -105 })
  observer = new ResizeObserver(() => setIndicator(false))
  observer.observe(nav.value)
  setIndicator(false)
})
onUnmounted(() => {
  animation?.kill()
  mobileAnimation?.kill()
  context?.revert()
  observer?.disconnect()
  media?.removeEventListener('change', resize)
  document.removeEventListener('keydown', handleKey)
  unlockBody()
})
</script>

<template>
  <div class="sidebar-wrapper">
    <header class="mobile-topbar">
      <button
        ref="opener"
        class="icon-button mobile-trigger"
        aria-label="Abrir menu de navegação"
        aria-controls="kando-sidebar"
        :aria-expanded="sidebarStore.mobileOpen"
        @click="sidebarStore.mobileOpen = true"
      >
        <span class="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>
      <span>{{ tituloPagina }}</span>
      <RouterLink to="/perfil" class="mobile-avatar" aria-label="Meu perfil"
        ><img v-if="authStore.usuario?.foto" :src="authStore.usuario.foto" alt="" /><span v-else>{{
          iniciais
        }}</span></RouterLink
      >
    </header>
    <button
      v-if="mobile && sidebarStore.mobileOpen"
      class="sidebar-backdrop"
      aria-label="Fechar menu de navegação"
      tabindex="-1"
      @click="sidebarStore.closeMobile"
    />
    <aside
      id="kando-sidebar"
      ref="panel"
      class="sidebar"
      :class="{ compacta }"
      :role="mobile ? 'dialog' : undefined"
      :aria-modal="mobile && sidebarStore.mobileOpen ? 'true' : undefined"
      aria-label="Navegação do Kando"
      :inert="mobile && !sidebarStore.mobileOpen"
    >
      <div class="sidebar-header">
        <RouterLink to="/dashboard" class="sidebar-logo" aria-label="Kando — Dashboard">
          <span class="brand-mark" aria-hidden="true">k<span></span></span>
          <span class="brand-copy"><strong>Kando</strong><small>you can do this.</small></span>
        </RouterLink>
        <button
          class="icon-button toggle-sidebar"
          :aria-label="mobile ? 'Fechar menu' : compacta ? 'Expandir sidebar' : 'Recolher sidebar'"
          :aria-expanded="mobile ? sidebarStore.mobileOpen : !compacta"
          aria-controls="kando-sidebar"
          @click="mobile ? sidebarStore.closeMobile() : sidebarStore.toggle()"
        >
          <span class="material-symbols-outlined" aria-hidden="true">{{
            mobile ? 'close' : compacta ? 'left_panel_open' : 'left_panel_close'
          }}</span>
        </button>
      </div>
      <nav ref="nav" class="sidebar-menu" aria-label="Principal">
        <span ref="indicator" class="active-indicator" aria-hidden="true"></span>
        <RouterLink
          v-for="item in itens"
          :key="item.key"
          :to="item.to"
          class="menu-item"
          :class="{ 'is-active': ativa(item) }"
          :aria-current="ativa(item) ? 'page' : undefined"
          :aria-label="item.nome"
        >
          <span class="icon-slot"
            ><span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span
            ><span
              v-if="item.key === 'notificacoes' && notificacoes.naoLidasCount && compacta"
              class="notification-dot"
              aria-hidden="true"
            ></span
          ></span>
          <span class="nav-copy" :aria-hidden="compacta">{{ item.nome }}</span>
          <span
            v-if="item.key === 'notificacoes' && notificacoes.naoLidasCount"
            class="notification-badge"
            :class="{ 'compact-count': compacta }"
            :aria-label="notificacoes.naoLidasCount + ' não lidas'"
            >{{ notificacoes.naoLidasCount > 99 ? '99+' : notificacoes.naoLidasCount }}</span
          >
          <span v-if="compacta" class="sidebar-tooltip" role="tooltip"
            >{{ item.nome
            }}{{
              item.key === 'notificacoes' && notificacoes.naoLidasCount
                ? ' · ' + notificacoes.naoLidasCount + ' não lidas'
                : ''
            }}</span
          >
        </RouterLink>
      </nav>
      <div class="sidebar-footer">
        <RouterLink
          to="/configuracoes"
          class="menu-item utility"
          :class="{ 'is-active': route.name === 'configuracoes' }"
          aria-label="Configurações"
          ><span class="icon-slot material-symbols-outlined" aria-hidden="true">settings</span
          ><span class="nav-copy" :aria-hidden="compacta">Configurações</span
          ><span v-if="compacta" class="sidebar-tooltip" role="tooltip"
            >Configurações</span
          ></RouterLink
        >
        <div class="account-divider"></div>
        <RouterLink
          to="/perfil"
          class="account-link"
          :class="{ 'is-active': route.name === 'perfil' }"
          :aria-label="'Perfil de ' + nomeUsuario"
        >
          <span class="user-avatar"
            ><img v-if="authStore.usuario?.foto" :src="authStore.usuario.foto" alt="" /><span
              v-else
              >{{ iniciais }}</span
            ></span
          >
          <span class="nav-copy account-copy" :aria-hidden="compacta"
            ><strong>{{ nomeUsuario }}</strong
            ><small>{{ authStore.usuario?.email }}</small></span
          >
          <span v-if="compacta" class="sidebar-tooltip" role="tooltip">Meu perfil</span>
        </RouterLink>
        <button class="menu-item logout" aria-label="Sair da conta" @click="handleLogout">
          <span class="icon-slot material-symbols-outlined" aria-hidden="true">logout</span
          ><span class="nav-copy" :aria-hidden="compacta">Sair da conta</span
          ><span v-if="compacta" class="sidebar-tooltip" role="tooltip">Sair da conta</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-width, 260px);
  height: 100dvh;
  padding: 24px 14px 16px;
  display: flex;
  flex-direction: column;
  background: var(--sidebar-surface);
  border-right: 1px solid var(--sidebar-border);
  color: var(--sidebar-ink);
  z-index: 1050;
  font-family: Poppins, sans-serif;
}

.sidebar-header {
  display: flex;
  align-items: center;
  height: 56px;
  gap: 8px;
  margin-bottom: 34px;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  text-decoration: none;
  color: inherit;
  padding-left: 9px;
  flex: 1;
}
.brand-mark {
  flex-shrink: 0;
  position: relative;
  font-size: 34px;
  line-height: 1;
  font-weight: 700;
  color: var(--color-primary-dark);
  letter-spacing: -3px;
  width: 28px;
}
.brand-mark > span {
  position: absolute;
  top: 0;
  right: 1px;
  width: 7px;
  height: 10px;
  background: #87a98e;
  border-radius: 7px 1px 7px 1px;
  transform: rotate(12deg);
}
.brand-copy {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
}
.brand-copy strong {
  font-size: 23px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.6px;
}
.brand-copy small {
  color: var(--sidebar-muted);
  font-size: 10px;
  margin-top: 3px;
}
.icon-button {
  width: 30px;
  height: 32px;
  border: 0;
  background: transparent;
  border-radius: 9px;
  color: var(--sidebar-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.icon-button:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-ink);
}
.icon-button .material-symbols-outlined {
  font-size: 21px;
}
.group-label {
  color: var(--sidebar-muted);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.35px;
  padding: 0 12px;
  margin-bottom: 12px;
  height: 16px;
  white-space: nowrap;
  overflow: hidden;
}
.sidebar-menu {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 46px;
  padding: 0 12px;
  border: 0;
  border-radius: 12px;
  text-decoration: none;
  background: transparent;
  color: var(--sidebar-muted);
  cursor: pointer;
  font:
    400 12px Poppins,
    sans-serif;
  white-space: nowrap;
  width: 100%;
  transition:
    color 0.18s,
    background 0.18s;
}
.menu-item:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-ink);
}
.menu-item:active {
  transform: scale(0.98);
}
.menu-item.is-active {
  color: var(--sidebar-ink);
  font-weight: 600;
}
.menu-item.is-active .material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
}
.active-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  background: var(--sidebar-hover);
  border-radius: 12px;
  pointer-events: none;
}
.icon-slot {
  width: 24px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  position: relative;
}
.material-symbols-outlined {
  font-size: 23px;
}
.nav-copy {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notification-badge {
  font-size: 10px;
  font-weight: 500;
  background: #e6ebe7;
  color: #435849;
  padding: 1px 6px;
  border-radius: 7px;
}
.compact-count {
  position: absolute;
  right: 0;
  top: 1px;
  padding: 0 3px;
  font-size: 8px;
}
.notification-dot {
  position: absolute;
  right: -2px;
  top: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #7a9581;
}
.sidebar-footer {
  margin-top: auto;
  padding-top: 30px;
}
.utility.is-active {
  background: var(--sidebar-hover);
}
.account-divider {
  height: 1px;
  background: var(--sidebar-border);
  margin: 14px 4px;
}
.account-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 7px;
  border-radius: 12px;
  color: inherit;
  text-decoration: none;
  transition: background 0.18s;
  min-width: 0;
}
.account-link:hover,
.account-link.is-active {
  background: var(--sidebar-hover);
}
.user-avatar,
.mobile-avatar {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  background: #e8ede5;
  color: #4c6652;
  border: 1px solid var(--sidebar-border);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
}
.user-avatar img,
.mobile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.account-copy {
  display: flex;
  flex-direction: column;
}
.account-copy strong {
  font-size: 11px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}
.account-copy small {
  font-size: 9px;
  color: var(--sidebar-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 3px;
}
.logout {
  height: 38px;
  margin-top: 9px;
  font-size: 11px;
}
.logout:hover {
  color: #a35c5c;
}
.brand-copy,
.nav-copy {
  max-width: 190px;
  transition: max-width 0.3s ease;
}
.compacta .brand-copy,
.compacta .nav-copy {
  max-width: 0;
  padding: 0;
  margin-right: 0;
}
.compacta .group-label {
  opacity: 0;
}
.compacta .sidebar-header {
  position: relative;
  margin-bottom: 34px;
}
.compacta .sidebar-logo {
  padding-left: 10px;
}
.compacta .toggle-sidebar {
  position: absolute;
  top: 51px;
  left: 9px;
  width: 30px;
  height: 26px;
}
.compacta .menu-item {
  gap: 0;
}
.compacta .account-link {
  gap: 0;
  justify-content: center;
  padding: 9px 0;
}
.sidebar-tooltip {
  pointer-events: none;
  position: absolute;
  left: calc(100% + 13px);
  top: 50%;
  transform: translate(4px, -50%);
  opacity: 0;
  padding: 7px 11px;
  background: var(--sidebar-ink);
  color: var(--sidebar-surface);
  font-size: 11px;
  font-weight: 400;
  border-radius: 8px;
  box-shadow: 0 3px 12px #00000010;
  transition:
    opacity 0.15s,
    transform 0.15s;
  z-index: 1200;
  white-space: nowrap;
}
.menu-item:hover .sidebar-tooltip,
.menu-item:focus .sidebar-tooltip,
.account-link:hover .sidebar-tooltip,
.account-link:focus .sidebar-tooltip {
  opacity: 1;
  transform: translate(0, -50%);
}
.sidebar :is(button, a):focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
.mobile-topbar,
.sidebar-backdrop {
  display: none;
}
@media (max-width: 767px) {
  .sidebar-wrapper {
    position: sticky;
    top: 0;
    z-index: 1050;
  }
  .mobile-topbar {
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
    height: 62px;
    padding: 0 18px;
    z-index: 100;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    font-size: 13px;
    font-weight: 500;
  }
  .mobile-topbar > span {
    flex: 1;
  }
  .mobile-avatar {
    text-decoration: none;
    width: 30px;
    height: 30px;
    font-size: 10px;
  }
  .mobile-trigger {
    color: var(--color-text);
  }
  .sidebar {
    width: min(280px, calc(100vw - 32px));
    padding-top: 20px;
    box-shadow: 8px 0 35px #0000000d;
    transform: translateX(-105%);
  }
  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    border: 0;
    background: #14211c66;
    z-index: 1040;
    cursor: default;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sidebar * {
    transition: none !important;
  }
}
</style>
