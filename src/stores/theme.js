import { ref } from 'vue'
import { defineStore } from 'pinia'

export function lerTema() {
  try { return localStorage.getItem('tema') === 'escuro' }
  catch { return false }
}

export const useThemeStore = defineStore('theme', () => {
  const temaEscuro = ref(lerTema())
  function aplicarTema() {
    document.documentElement.classList.toggle('dark-mode', temaEscuro.value)
  }
  function alternarTema() {
    temaEscuro.value = !temaEscuro.value
    aplicarTema()
    try { localStorage.setItem('tema', temaEscuro.value ? 'escuro' : 'claro') }
    catch { /* A preferência continua válida nesta sessão. */ }
  }
  function inicializar() { temaEscuro.value = lerTema(); aplicarTema() }
  return { temaEscuro, alternarTema, inicializar }
})
