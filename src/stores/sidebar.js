import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const isCollapsed = ref(false)

  function toggle() {
    isCollapsed.value = !isCollapsed.value
  }

  function setCollapsed(value) {
    isCollapsed.value = Boolean(value)
  }

  return {
    isCollapsed,
    toggle,
    setCollapsed
  }
})

