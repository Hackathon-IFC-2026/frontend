import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '/services/api'
import { listarPaginas, mensagemErro } from '/services/apiHelpers'
export const useNotificacoesStore = defineStore('notificacoes', () => {
  const notificacoes = ref([])
  const loading = ref(false)
  const error = ref('')
  let versao = 0
  let pendente = null
  const naoLidasCount = computed(() => notificacoes.value.filter(n => !n.lida).length)
  function limpar() { versao++; notificacoes.value = []; error.value = ''; pendente = null }
  window.addEventListener('auth:changed', limpar)
  window.addEventListener('auth:expired', limpar)
  async function buscarNotificacoes({ silencioso = false } = {}) {
    if (pendente) return pendente
    const contexto = versao
    if (!silencioso) loading.value = true
    pendente = (async () => {
      try {
        const lista = await listarPaginas('/api/notificacoes/')
        if (contexto === versao) { notificacoes.value = lista.map(n => ({ ...n, data: n.criada_em })); error.value = '' }
      } catch (err) { if (contexto === versao) error.value = mensagemErro(err); }
      finally { if (contexto === versao) { loading.value = false; pendente = null } }
    })()
    return pendente
  }
  async function acao(operacao) {
    error.value = ''
    try { await operacao() }
    catch (err) { error.value = mensagemErro(err) }
  }
  const marcarComoLida = id => acao(async () => {
    await api.patch('/api/notificacoes/' + id + '/', { lida: true })
    const item = notificacoes.value.find(n => n.id === id)
    if (item) item.lida = true
  })
  const marcarTodasComoLidas = () => acao(async () => {
    await api.post('/api/notificacoes/ler-todas/')
    notificacoes.value.forEach(n => { n.lida = true })
  })
  const removerNotificacao = id => acao(async () => {
    await api.delete('/api/notificacoes/' + id + '/')
    notificacoes.value = notificacoes.value.filter(n => n.id !== id)
  })
  return { notificacoes, loading, error, naoLidasCount, buscarNotificacoes, marcarComoLida, marcarTodasComoLidas, removerNotificacao }
})
