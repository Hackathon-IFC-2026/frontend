import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useSidebarStore = defineStore('sidebar', () => {
  const preferencia = localStorage.getItem('kando:sidebar')
  const isCollapsed = ref(
    preferencia
      ? preferencia === 'compacta'
      : window.matchMedia('(min-width: 768px) and (max-width: 1100px)').matches,
  )
  const mobileOpen = ref(false)
  function setCollapsed(value) {
    isCollapsed.value = Boolean(value)
    localStorage.setItem('kando:sidebar', isCollapsed.value ? 'compacta' : 'expandida')
  }
  const toggle = () => setCollapsed(!isCollapsed.value)
  const closeMobile = () => {
    mobileOpen.value = false
  }
  return { isCollapsed, mobileOpen, setCollapsed, toggle, closeMobile }
})
