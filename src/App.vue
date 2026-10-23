<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthBackground from './components/AuthBackground.vue'
import ToastNotification from './components/ToastNotification.vue'
import SidebarComponent from './components/SidebarComponent.vue'

const route = useRoute()

const side = computed(() => route.meta.side ?? 'left')

const showSidebar = computed(() =>
  !['login', 'cadastro'].includes(route.name)
)
</script>
<template>
  <component
    :is="route.meta.requiresAuthBackground ? AuthBackground : 'div'"
    :side="side"
  >
    <SidebarComponent v-if="showSidebar" />
    <router-view v-slot="{ Component, route: r }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="r.path" />
      </transition>
    </router-view>
    <ToastNotification />
  </component>
</template>
