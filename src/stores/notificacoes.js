import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '/services/api.js'

export const useNotificacoesStore = defineStore('notificacoes', () => {
  const notificacoes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Retorna a quantidade de notificações não lidas
  const naoLidasCount = computed(() => {
    return notificacoes.value.filter(n => !n.lida).length
  })

  // Buscar notificações da API (ou fallback para lista inicial)
  async function buscarNotificacoes() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/api/notificacoes/')
      notificacoes.value = response.data
    } catch (error) {
      // Caso a API ainda não tenha o endpoint pronto, mantém os dados fictícios para teste
      if (notificacoes.value.length === 0) {
        notificacoes.value = [
          {
            id: 1,
            titulo: 'Perfil Atualizado',
            mensagem: 'Suas informações de perfil foram alteradas com sucesso.',
            data: new Date().toISOString(),
            lida: false,
            tipo: 'sucesso' // 'sucesso', 'alerta', 'info', 'erro'
          },
          {
            id: 2,
            titulo: 'Bem-vindo ao Kando!',
            mensagem: 'Explore todas as funcionalidades disponíveis na plataforma.',
            data: new Date(Date.now() - 86400000).toISOString(),
            lida: true,
            tipo: 'info'
          }
        ]
      }
    } finally {
      loading.value = false
    }
  }

  // Marcar uma notificação específica como lida
  async function marcarComoLida(id) {
    const notif = notificacoes.value.find(n => n.id === id)
    if (!notif) return

    notif.lida = true

    try {
      await api.patch(`/api/notificacoes/${id}/`, { lida: true })
    } catch (err) {
      // Se falhar no backend, mantém alterado no front para boa UX
    }
  }

  // Marcar todas como lidas
  async function marcarTodasComoLidas() {
    notificacoes.value.forEach(n => (n.lida = true))
    try {
      await api.post('/api/notificacoes/marcar-todas-lidas/')
    } catch (err) {
      // Ignora se não houver backend
    }
  }

  // Excluir notificação
  async function removerNotificacao(id) {
    notificacoes.value = notificacoes.value.filter(n => n.id !== id)
    try {
      await api.delete(`/api/notificacoes/${id}/`)
    } catch (err) {
      // Ignora se não houver backend
    }
  }

  return {
    notificacoes,
    loading,
    error,
    naoLidasCount,
    buscarNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    removerNotificacao
  }
})
