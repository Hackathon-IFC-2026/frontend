import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '/services/api.js'
import { listarPaginas, mensagemErro } from '/services/apiHelpers.js'
import { useAuthStore } from './auth'

const idUsuario = value => Number(value?.id ?? value)
export const useProjectStore = defineStore('projects', () => {
  const auth = useAuthStore()
  const registros = ref([])
  const vinculos = ref([])
  const usuarios = ref([])
  const resumos = ref({})
  const loading = ref(false)
  const error = ref(null)
  let versao = 0
  const adminRequests = new Map()
  function limpar() { versao++; adminRequests.clear(); registros.value = []; vinculos.value = []; usuarios.value = []; resumos.value = {}; error.value = null }
  window.addEventListener('auth:changed', limpar)
  window.addEventListener('auth:expired', limpar)
  function pessoa(id) {
    const user = (Number(auth.usuario?.id) === Number(id) ? auth.usuario : null) || usuarios.value.find(u => Number(u.id) === Number(id))
    return { id: Number(id), nome: user?.nome || user?.name || user?.email || 'Usuário #' + id, email: user?.email || '' }
  }
  function equipe(projeto) {
    const membros = vinculos.value.filter(v => idUsuario(v.projeto) === Number(projeto.id)).map(v => ({ ...pessoa(idUsuario(v.usuario)), vinculoId: v.id, papel: v.papel }))
    if (!membros.length) membros.unshift({ ...pessoa(idUsuario(projeto.criado_por)), papel: 'admin' })
    return [...new Map(membros.map(p => [p.id, p])).values()]
  }
  function normalizar(p) {
    const resumo = resumos.value[p.id] || { total: 0, concluidas: 0 }
    const progresso = resumo.total ? Math.round(resumo.concluidas / resumo.total * 100) : 0
    return { ...p, owner: idUsuario(p.criado_por), participantes: equipe(p), administrador: equipe(p).find(pessoa => pessoa.papel === 'admin') || pessoa(idUsuario(p.criado_por)),
      totalTarefas: resumo.total, progresso, status: progresso + '% Concluído',
      data: p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—',
    }
  }
  const projetos = computed(() => registros.value.map(normalizar))
  function buscarProjeto(id) { return projetos.value.find(p => Number(p.id) === Number(id)) || null }
  function podeAdministrar(id) { return !!auth.usuario?.id && buscarProjeto(id)?.participantes.some(p => p.id === Number(auth.usuario.id) && p.papel === 'admin') }
  function atualizarResumo(id, tarefas) {
    resumos.value = { ...resumos.value, [id]: { total: tarefas.length, concluidas: tarefas.filter(t => ['concluida', 'concluido'].includes(t.situacao ?? t.status)).length } }
  }
  async function relacionados() {
    const [members, users] = await Promise.all([listarPaginas('/api/participantes-projeto/'), listarPaginas('/api/usuarios/')])
    return { members, users }
  }
  function autorizado(p, members) {
    return (!members.some(v => idUsuario(v.projeto) === Number(p.id)) && idUsuario(p.criado_por) === Number(auth.usuario?.id)) || members.some(v => idUsuario(v.projeto) === Number(p.id) && idUsuario(v.usuario) === Number(auth.usuario?.id))
  }
  async function listarProjetos({ silencioso = false } = {}) {
    const contexto = ++versao
    if (!silencioso) loading.value = true
    error.value = null
    try {
      const [items, tarefas, relations] = await Promise.all([listarPaginas('/api/projetos/'), listarPaginas('/api/tarefas/'), relacionados()])
      if (contexto !== versao) return []
      vinculos.value = relations.members
      usuarios.value = relations.users
      registros.value = items.filter(p => autorizado(p, relations.members))
      registros.value.forEach(p => atualizarResumo(p.id, tarefas.filter(t => idUsuario(t.projeto) === Number(p.id))))
      return projetos.value
    } catch (err) { if (contexto === versao) error.value = mensagemErro(err); throw err }
    finally { if (contexto === versao) loading.value = false }
  }
  async function carregarProjeto(id) {
    const contexto = versao
    error.value = null
    try {
      const [{ data }, relations] = await Promise.all([api.get('/api/projetos/' + id + '/'), relacionados()])
      if (contexto !== versao) throw new Error('Sessão alterada.')
      if (!autorizado(data, relations.members)) throw new Error('Você não participa deste projeto.')
      vinculos.value = relations.members
      usuarios.value = relations.users
      registros.value = [...registros.value.filter(p => Number(p.id) !== Number(id)), data]
      return buscarProjeto(id)
    } catch (err) { error.value = mensagemErro(err); throw err }
  }
  async function garantirAdministrador(id) {
    if (!podeAdministrar(id)) throw new Error('Somente administradores gerenciam o projeto.')
    if (vinculos.value.some(v => idUsuario(v.projeto) === Number(id) && idUsuario(v.usuario) === Number(auth.usuario.id))) return
    if (adminRequests.has(id)) return adminRequests.get(id)
    const contexto = versao
    const promise = (async () => {
      const list = await listarPaginas('/api/participantes-projeto/', { projeto: id })
      if (contexto !== versao) throw new Error('Sessão alterada.')
      const current = list.filter(v => idUsuario(v.projeto) === Number(id))
      vinculos.value = [...vinculos.value.filter(v => idUsuario(v.projeto) !== Number(id)), ...current]
      if (current.some(v => idUsuario(v.usuario) === Number(auth.usuario.id))) return
      const { data } = await api.post('/api/participantes-projeto/', { projeto: Number(id), usuario: auth.usuario.id, papel: 'admin' })
      if (contexto === versao) vinculos.value.push(data)
    })()
      .finally(() => adminRequests.delete(id))
    adminRequests.set(id, promise)
    return promise
  }
  async function criarProjeto(dados) {
    error.value = null
    try {
      const { data } = await api.post('/api/projetos/', { nome: dados.nome.trim(), descricao: dados.descricao.trim() })
      registros.value = [...registros.value, data]
      atualizarResumo(data.id, [])
      try { await garantirAdministrador(data.id) }
      catch (err) { error.value = 'O projeto foi criado, mas a participação do administrador não foi registrada: ' + mensagemErro(err) }
      return buscarProjeto(data.id)
    } catch (err) { error.value = mensagemErro(err); throw err }
  }
  async function atualizarProjeto(id, dados) {
    if (!podeAdministrar(id)) throw new Error('Somente o administrador pode editar o projeto.')
    error.value = null
    try {
      const { data } = await api.patch('/api/projetos/' + id + '/', { nome: dados.nome.trim(), descricao: dados.descricao.trim() })
      registros.value = registros.value.map(p => Number(p.id) === Number(id) ? data : p)
      return buscarProjeto(id)
    } catch (err) { error.value = mensagemErro(err); throw err }
  }
  async function excluirProjeto(id) {
    if (!podeAdministrar(id)) throw new Error('Somente o administrador pode excluir o projeto.')
    await api.delete('/api/projetos/' + id + '/')
    registros.value = registros.value.filter(p => Number(p.id) !== Number(id))
  }
  async function adicionarParticipante(projetoId, nome, email = '') {
    if (!podeAdministrar(projetoId)) throw new Error('Somente o administrador pode adicionar participantes.')
    email = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um e-mail válido.')
    const user = usuarios.value.find(u => u.email?.trim().toLowerCase() === email)
    if (!user) throw new Error('Este e-mail precisa ter uma conta cadastrada no Kando.')
    if (buscarProjeto(projetoId).participantes.some(p => p.id === Number(user.id))) throw new Error('Este e-mail já participa do projeto.')
    const { data } = await api.post('/api/participantes-projeto/', { projeto: Number(projetoId), usuario: user.id, papel: 'participante' })
    vinculos.value.push(data)
    return pessoa(user.id)
  }
  async function removerParticipante(projetoId, pessoaId) {
    if (!podeAdministrar(projetoId)) throw new Error('Somente o administrador pode remover participantes.')
    const projeto = buscarProjeto(projetoId)
    const pessoa = projeto.participantes.find(p => p.id === Number(pessoaId))
    if (pessoa?.papel === 'admin' && projeto.participantes.filter(p => p.papel === 'admin').length <= 1) throw new Error('Mantenha pelo menos um administrador no projeto.')
    const vinculo = vinculos.value.find(v => idUsuario(v.projeto) === Number(projetoId) && idUsuario(v.usuario) === Number(pessoaId))
    if (!vinculo) throw new Error('Participante não encontrado.')
    await api.delete('/api/participantes-projeto/' + vinculo.id + '/')
    vinculos.value = vinculos.value.filter(v => v.id !== vinculo.id)
  }
  async function alterarPapel(projetoId, pessoaId, papel) {
    if (!podeAdministrar(projetoId)) throw new Error('Somente administradores podem alterar funções.')
    if (!['admin', 'participante'].includes(papel)) throw new Error('Função inválida.')
    const projeto = buscarProjeto(projetoId)
    const pessoa = projeto.participantes.find(p => p.id === Number(pessoaId))
    if (papel !== 'admin' && pessoa?.papel === 'admin' && projeto.participantes.filter(p => p.papel === 'admin').length <= 1) throw new Error('Mantenha pelo menos um administrador no projeto.')
    const vinculo = vinculos.value.find(v => idUsuario(v.projeto) === Number(projetoId) && idUsuario(v.usuario) === Number(pessoaId))
    if (!vinculo) throw new Error('Participação não encontrada. Recarregue o projeto.')
    const { data } = await api.patch('/api/participantes-projeto/' + vinculo.id + '/', { papel })
    vinculos.value = vinculos.value.map(v => v.id === data.id ? data : v)
  }
  return { alterarPapel, projetos, usuarios, loading, error, buscarProjeto, pessoa, podeAdministrar, atualizarResumo, listarProjetos, carregarProjeto, criarProjeto, garantirAdministrador, atualizarProjeto, excluirProjeto, adicionarParticipante, removerParticipante, limpar }
})
