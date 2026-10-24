import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '/services/api.js'
import { listarPaginas, mensagemErro } from '/services/apiHelpers.js'
import { useProjectStore } from './projectStore'
import { useAuthStore } from './auth'
import { podeEditarTarefa } from '../utils/taskPermissions'

const statusUI = { aberta: 'a_fazer', andamento: 'em_andamento', concluida: 'concluido' }
const statusAPI = { a_fazer: 'aberta', em_andamento: 'andamento', concluido: 'concluida' }
const prioridadeUI = { 1: 'baixa', 2: 'media', 3: 'alta' }
const prioridadeAPI = { baixa: 1, media: 2, alta: 3 }
function dataInput(value) {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}
function payload(dados) {
  const result = {}
  for (const campo of ['projeto', 'titulo', 'descricao', 'data_inicio', 'complexidade', 'impedida', 'esperado_responsavel']) if (campo in dados) result[campo] = dados[campo]
  if ('status' in dados) result.situacao = statusAPI[dados.status]
  if ('prioridade' in dados) result.prioridade = prioridadeAPI[dados.prioridade]
  if ('prazo' in dados) result.prazo = dados.prazo ? /^\d{4}-\d{2}-\d{2}$/.test(dados.prazo) ? dados.prazo + 'T23:59:59-03:00' : dados.prazo : null
  if ('responsaveis' in dados) {
    if (dados.responsaveis.length > 1) throw new Error('Selecione apenas um responsável por tarefa.')
    result.responsavel = dados.responsaveis[0]?.id ?? dados.responsaveis[0] ?? null
  }
  return result
}

export const useTaskStore = defineStore('tasks', () => {
  const projects = useProjectStore()
  const auth = useAuthStore()
  const todasTarefas = ref([])
  const projetoSelecionado = ref(null)
  const tarefas = computed(() => projetoSelecionado.value == null ? todasTarefas.value : todasTarefas.value.filter(t => t.projeto === projetoSelecionado.value))
  const tarefaAtual = ref(null)
  const loading = ref(false)
  const error = ref(null)
  let projetoAtivo = null
  let versao = 0
  let detalheVersao = 0
  let revisao = 0
  function limparQuadro() { versao++; detalheVersao++; projetoAtivo = null; projetoSelecionado.value = null; tarefaAtual.value = null; error.value = null; loading.value = false }
  function limparSessao() { limparQuadro(); todasTarefas.value = [] }
  window.addEventListener('auth:changed', limparSessao)
  window.addEventListener('auth:expired', limparSessao)
  function normalizar(t) {
    return { ...t, projeto: Number(t.projeto?.id ?? t.projeto), status: statusUI[t.situacao], prioridade: prioridadeUI[t.prioridade], prazo: dataInput(t.prazo), prazo_em: t.prazo,
      created_by: t.criador, responsaveis: t.responsavel ? [projects.pessoa(t.responsavel?.id ?? t.responsavel)] : [],
      comentarios: t.comentarios || [], checklist: t.checklist || [], materiais: t.materiais || [],
    }
  }
  function upsert(raw) {
    revisao++
    const t = normalizar(raw)
    const i = todasTarefas.value.findIndex(item => item.id === t.id)
    if (i < 0) todasTarefas.value.push(t); else todasTarefas.value[i] = t
    if (tarefaAtual.value?.id === t.id) tarefaAtual.value = { ...tarefaAtual.value, ...t, comentarios: tarefaAtual.value.comentarios, checklist: tarefaAtual.value.checklist, materiais: tarefaAtual.value.materiais }
    projects.atualizarResumo(t.projeto, todasTarefas.value.filter(item => item.projeto === t.projeto))
    return t
  }
  async function executar(operacao) {
    error.value = null
    loading.value = true
    try { return await operacao() }
    catch (err) { error.value = mensagemErro(err); throw err }
    finally { loading.value = false }
  }
  async function listarTarefas(id) {
    const contexto = ++versao
    projetoAtivo = Number(id)
    projetoSelecionado.value = Number(id)
    return executar(async () => {
      const list = await listarPaginas('/api/tarefas/', { projeto: id })
      const selected = list.filter(t => Number(t.projeto?.id ?? t.projeto) === Number(id))
      if (contexto === versao) { todasTarefas.value = [...todasTarefas.value.filter(t => t.projeto !== Number(id)), ...selected.map(normalizar)]; projects.atualizarResumo(id, tarefas.value) }
      return selected
    })
  }
  async function listarTodas({ silencioso = false } = {}) {
    const contexto = versao
    const snapshot = revisao
    const carregar = async () => {
      const lista = await listarPaginas('/api/tarefas/')
      if (contexto !== versao || snapshot !== revisao) return
      todasTarefas.value = lista.filter(t => !!projects.buscarProjeto(t.projeto?.id ?? t.projeto)).map(normalizar)
      projects.projetos.forEach(p => projects.atualizarResumo(p.id, todasTarefas.value.filter(t => t.projeto === Number(p.id))))
      const atual = tarefaAtual.value && todasTarefas.value.find(t => t.id === tarefaAtual.value.id)
      if (tarefaAtual.value && !atual) tarefaAtual.value = null
      else if (atual) tarefaAtual.value = { ...tarefaAtual.value, ...atual, comentarios: tarefaAtual.value.comentarios, checklist: tarefaAtual.value.checklist, materiais: tarefaAtual.value.materiais }
    }
    return silencioso ? carregar() : executar(carregar)
  }
  async function buscarTarefa(id) {
    const contexto = versao
    const detalhe = ++detalheVersao
    return executar(async () => {
      const { data } = await api.get('/api/tarefas/' + id + '/')
      if (contexto !== versao || detalhe !== detalheVersao) return null
      if (!projects.buscarProjeto(data.projeto)) await projects.carregarProjeto(data.projeto)
      const [comments, checklist, materials] = await Promise.all([
        listarPaginas('/api/comentarios/', { tarefa: id }), listarPaginas('/api/checklists/', { tarefa: id }), listarPaginas('/api/materiais-apoio/', { projeto: data.projeto }),
      ])
      if (contexto !== versao || detalhe !== detalheVersao) return null
      const t = upsert(data)
      tarefaAtual.value = { ...t,
        comentarios: comments.filter(c => Number(c.tarefa) === Number(id)).map(c => ({ ...c, texto: c.conteudo, autor: projects.pessoa(c.autor) })),
        checklist: checklist.filter(c => Number(c.tarefa) === Number(id)).map(c => ({ ...c, texto: c.descricao })),
        materiais: materials.filter(m => Number(m.projeto) === Number(data.projeto)),
      }
      return tarefaAtual.value
    })
  }
  async function criarTarefa(dados) {
    return executar(async () => {
      await projects.garantirAdministrador(dados.projeto)
      const envio = payload(dados)
      const { data } = await api.post('/api/tarefas/', envio)
      const criada = upsert(data)
      // Compatibilidade com o servidor atual, que substitui o responsável pelo criador no POST.
      if ('responsavel' in envio && data.responsavel !== envio.responsavel) {
        try {
          const resposta = await api.patch('/api/tarefas/' + data.id + '/', { responsavel: envio.responsavel })
          return upsert(resposta.data)
        } catch (err) {
          return { ...criada, aviso: 'A tarefa foi criada, mas o responsável não foi alterado: ' + mensagemErro(err) }
        }
      }
      return criada
    })
  }
  async function atualizarTarefa(id, dados) { return executar(async () => { exigirEdicao(id); const { data } = await api.patch('/api/tarefas/' + id + '/', payload(dados)); return upsert(data) }) }
  function exigirEdicao(id) {
    const tarefa = todasTarefas.value.find(t => Number(t.id) === Number(id))
    if (!podeEditarTarefa(tarefa, auth.usuario?.id, projects.podeAdministrar(tarefa?.projeto))) throw new Error('Você não pode alterar esta tarefa.')
  }
  async function excluirTarefa(id) {
    return executar(async () => {
      exigirEdicao(id)
      await api.delete('/api/tarefas/' + id + '/')
      revisao++
      const projeto = todasTarefas.value.find(t => Number(t.id) === Number(id))?.projeto
      todasTarefas.value = todasTarefas.value.filter(t => Number(t.id) !== Number(id))
      if (tarefaAtual.value?.id === Number(id)) tarefaAtual.value = null
      projects.atualizarResumo(projeto, todasTarefas.value.filter(t => t.projeto === projeto))
    })
  }
  async function recurso(url, method, data, taskId) {
    await executar(() => api.request({ url, method, data }))
    await buscarTarefa(taskId)
  }
  const adicionarComentario = (id, texto) => recurso('/api/comentarios/', 'post', { tarefa: id, conteudo: texto, autor: auth.usuario.id }, id)
  const adicionarChecklist = (id, texto) => recurso('/api/checklists/', 'post', { tarefa: id, descricao: texto, concluido: false, ordem: tarefaAtual.value?.checklist.length || 0 }, id)
  const atualizarChecklist = (id, itemId, concluido) => recurso('/api/checklists/' + itemId + '/', 'patch', { concluido }, id)
  const removerChecklist = (id, itemId) => recurso('/api/checklists/' + itemId + '/', 'delete', undefined, id)
  const adicionarMaterial = (id, dados) => recurso('/api/materiais-apoio/', 'post', { ...dados, projeto: tarefaAtual.value.projeto, criador: auth.usuario.id }, id)
  const removerMaterial = (id, itemId) => recurso('/api/materiais-apoio/' + itemId + '/', 'delete', undefined, id)
  return { todasTarefas, listarTodas, tarefas, tarefaAtual, loading, error, limparQuadro, listarTarefas, buscarTarefa, criarTarefa, atualizarTarefa, excluirTarefa, adicionarComentario, adicionarChecklist, atualizarChecklist, removerChecklist, adicionarMaterial, removerMaterial }
})
