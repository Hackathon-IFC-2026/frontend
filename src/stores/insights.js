import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '/services/api'
import { mensagemErro } from '/services/apiHelpers'
import { useTaskStore } from './taskStore'

export const useInsightsStore = defineStore('insights', () => {
  const analise = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  let versao = 0
  let sessao = 0
  function limpar() { sessao++; versao++; saving.value = false; analise.value = null; error.value = ''; loading.value = false }
  window.addEventListener('auth:changed', limpar)
  window.addEventListener('auth:expired', limpar)
  async function carregar(id, silencioso = false) {
    const contexto = ++versao
    if (Number(analise.value?.projeto) !== Number(id)) analise.value = null
    if (!silencioso) loading.value = true
    try {
      const { data } = await api.get('/api/projetos/' + id + '/carga-trabalho/')
      if (contexto === versao) { analise.value = data; error.value = '' }
    } catch (err) {
      if (contexto === versao) {
        analise.value = null
        error.value = err.response?.status === 404
          ? 'Análise indisponível. Confirme seu acesso ao projeto ou solicite a atualização do sistema.'
          : mensagemErro(err)
      }
    } finally { if (contexto === versao) loading.value = false }
  }
  async function capacidade(projeto, usuario, valor) {
    if (saving.value) return false
    saving.value = true
    const contexto = sessao
    try {
      await api.post('/api/projetos/' + projeto + '/capacidade/', { usuario, capacidade: valor })
      if (contexto !== sessao) return false
      await carregar(projeto, true)
      return true
    } catch (err) { if (contexto === sessao) error.value = mensagemErro(err); return false }
    finally { if (contexto === sessao) saving.value = false }
  }
  async function redistribuir(projeto, sugestao, destino) {
    if (saving.value) return false
    saving.value = true
    const contexto = sessao
    try {
      await useTaskStore().atualizarTarefa(sugestao.tarefa, {
        responsaveis: [Number(destino)], esperado_responsavel: sugestao.origem,
      })
      if (contexto !== sessao) return false
      await carregar(projeto, true)
      return true
    } catch (err) { if (contexto === sessao) error.value = mensagemErro(err); return false }
    finally { if (contexto === sessao) saving.value = false }
  }
  return { analise, loading, saving, error, limpar, carregar, capacidade, redistribuir }
})
