<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthBackground from './components/AuthBackground.vue'
import ToastNotification from './components/ToastNotification.vue'
import FooterComponent from './components/FooterComponent.vue'
import SidebarComponent from './components/SidebarComponent.vue'

import { useWorkspaceSync } from './composables/useWorkspaceSync'
useWorkspaceSync()

const route = useRoute()

const side = computed(() => route.meta.side ?? 'left')

const isAuthRoute = computed(() => {
  return (
    Boolean(route.meta.requiresAuthBackground) ||
    ['login', 'cadastro'].includes(route.name) ||
    ['/login', '/cadastro'].includes(route.path)
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
  --sidebar-width: 260px;
  background-color: var(--theme-bg-ffffff, #ffffff);
  position: relative;
}

.app-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - var(--sidebar-width, 260px));
  margin-left: var(--sidebar-width, 260px);
  min-width: 0;
  box-sizing: border-box;
}

.app-content {
  flex: 1;
  padding: 24px;
  box-sizing: border-box;
}

@media (max-width: 767px) {
  .app-layout { flex-direction: column; }
  .app-main {
    width: 100%;
    margin-left: 0;
  }

  .app-content {
    padding: 16px;
    padding-bottom: 24px;
  }
}
</style>
