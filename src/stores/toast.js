
import { defineStore } from 'pinia'
import { ref } from 'vue'

let timeoutId = null

export const useToastStore = defineStore('toast', () => {
  const mensagem = ref('')
  const tipo = ref('success')
  const visivel = ref(false)

  function mostrar(texto, tipoMensagem = 'success') {
    if (timeoutId) clearTimeout(timeoutId)

    mensagem.value = texto
    tipo.value = tipoMensagem
    visivel.value = true

    timeoutId = setTimeout(() => {
      fechar()
    }, 4000)
  }

  function fechar() {
    visivel.value = false

    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return {
    mensagem,
    tipo,
    visivel,
    mostrar,
    fechar
  }
})
