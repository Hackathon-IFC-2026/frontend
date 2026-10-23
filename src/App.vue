```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from './stores/sidebar.js'
import AuthBackground from './components/AuthBackground.vue'
import ToastNotification from './components/ToastNotification.vue'
import FooterComponent from './components/FooterComponent.vue'
import SidebarComponent from './components/SidebarComponent.vue'

const route = useRoute()
const sidebarStore = useSidebarStore()

const side = computed(() => route.meta.side ?? 'left')

const isAuthRoute = computed(() => {
  return (
    Boolean(route.meta.requiresAuthBackground) ||
    [
      'login',
      'cadastro',
      'recuperar-senha',
      'verificacao-codigo',
      'nova-senha',
    ].includes(route.name) ||
    [
      '/login',
      '/cadastro',
      '/recuperar-senha',
      '/verificacao-codigo',
      '/nova-senha',
    ].includes(route.path)
  )
})
</script>

<template>
  <AuthBackground
    v-if="isAuthRoute"
    :side="side"
  >
    <router-view v-slot="{ Component, route: r }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="r.fullPath" />
      </transition>
    </router-view>

    <ToastNotification />
  </AuthBackground>

  <div v-else class="app-layout">
    <SidebarComponent />

    <div
      class="app-main"
      :class="{ 'sidebar-collapsed': sidebarStore.isCollapsed }"
    >
      <main class="app-content">
        <router-view v-slot="{ Component, route: r }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="r.fullPath" />
          </transition>
        </router-view>
      </main>

      <FooterComponent />
    </div>

    <ToastNotification />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  background-color: #ffffff;
  position: relative;
}

.app-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - 235px);
  margin-left: 235px;
  transition: margin-left 0.25s ease, width 0.25s ease;
  box-sizing: border-box;
}

.app-main.sidebar-collapsed {
  width: calc(100% - 70px);
  margin-left: 70px;
}

.app-content {
  flex: 1;
  padding: 24px;
  box-sizing: border-box;
}

@media (max-width: 767px) {
  .app-main,
  .app-main.sidebar-collapsed {
    width: 100%;
    margin-left: 0;
  }

  .app-content {
    padding: 16px;
    padding-bottom: 95px;
  }
}
</style>
```
