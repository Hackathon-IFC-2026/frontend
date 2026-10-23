<template>
  <component :is="route.meta.requiresAuthBackground ? AuthBackground : 'div'" :side="side">
    <router-view v-slot="{ Component, route: r }">
      <transition name="page">
        <component :is="Component" :key="r.path" />
      </transition>
    </router-view>
    <ToastNotification />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthBackground from './components/AuthBackground.vue'
import ToastNotification from './components/ToastNotification.vue'

const route = useRoute()
const side = computed(() => route.meta.side ?? 'left')
</script>

