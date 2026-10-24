import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createPinia, setActivePinia } from 'pinia'
import { AxiosError } from 'axios'

const memory = new Map()
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, String(value)), removeItem: key => memory.delete(key) }
globalThis.window = new EventTarget()
const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: api, normalizarBaseURL } = await server.ssrLoadModule('/services/api.js')
  const { listarPaginas } = await server.ssrLoadModule('/services/apiHelpers.js')
  const { useAuthStore } = await server.ssrLoadModule('/src/stores/auth.js')
  const { useProjectStore } = await server.ssrLoadModule('/src/stores/projectStore.js')
  const { useTaskStore } = await server.ssrLoadModule('/src/stores/taskStore.js')
  setActivePinia(createPinia())
  const auth = useAuthStore()
  const projects = useProjectStore()
  const tasks = useTaskStore()
  const requests = []
  const db = {
    users: [{ id: 1, name: 'Ana', email: 'ana@example.com' }, { id: 2, name: 'Julia', email: 'julia@example.com' }],
    projects: [{ id: 10, nome: 'Projeto real', descricao: 'Descrição real', criado_por: 1 }, { id: 20, nome: 'Outro projeto privado', descricao: 'Privado', criado_por: 2 }],
    members: [{ id: 1, projeto: 10, usuario: 1, papel: 'admin' }],
    tasks: [{ id: 1, projeto: 10, titulo: 'Tarefa', descricao: 'Real', prioridade: 3, situacao: 'aberta', responsavel: 1, criador: 1, prazo: null }],
    comments: [], checklist: [], materials: [],
  }
  let refusePatch = false
  const result = (config, data) => ({ config, status: 200, statusText: 'OK', headers: {}, data })
  const denied = (config, status = 403) => new AxiosError('Denied', 'ERR_BAD_REQUEST', config, null, { config, status, data: { detail: 'Sem permissão' }, headers: {} })
  const adapter = async config => {
    requests.push(config)
    const url = new URL(config.url, api.defaults.baseURL)
    const path = url.pathname
    const method = config.method
    const payload = config.data ? JSON.parse(config.data) : {}
    if (path === '/api/registro/') {
      assert.equal(config.headers.Authorization, undefined)
      assert.equal(payload.email, 'novo@example.com')
      assert.equal(payload.name, 'Nova pessoa')
      assert.equal(payload.data_nascimento, '2000-01-01')
      return result(config, { id: 3, email: payload.email })
    }
    if (path === '/api/token/') return result(config, { access: 'access', refresh: 'refresh' })
    if (path === '/api/usuarios/me/') return result(config, db.users[0])
    if (path === '/api/usuarios/') return result(config, db.users)
    const routes = { projetos: 'projects', 'participantes-projeto': 'members', tarefas: 'tasks', comentarios: 'comments', checklists: 'checklist', 'materiais-apoio': 'materials' }
    const [, , resource, id] = path.split('/')
    const table = routes[resource]
    if (!table) throw new Error('Endpoint inesperado: ' + path)
    if (method === 'get') {
      if (id) return result(config, db[table].find(item => item.id === Number(id)))
      // Deliberately ignore filters to emulate the published API; stores must still isolate projects.
      return result(config, { results: db[table], page: 1, total_pages: 1 })
    }
    if (method === 'post') {
      const item = { id: Math.max(0, ...db[table].map(x => x.id)) + 1, ...payload }
      if (table === 'projects') {
        assert.equal(payload.criado_por, undefined)
        item.criado_por = 1
      }
      if (table === 'tasks') { item.responsavel = 1; item.criador = 1; item.concluida_em = null }
      db[table].push(item)
      return result(config, item)
    }
    if (method === 'patch') {
      if (refusePatch) throw denied(config)
      const item = db[table].find(x => x.id === Number(id))
      Object.assign(item, payload)
      if (payload.situacao) item.concluida_em = payload.situacao === 'concluida' ? '2026-10-24T12:00:00Z' : null
      return result(config, { ...item })
    }
    if (method === 'delete') { db[table] = db[table].filter(x => x.id !== Number(id)); return result(config, null) }
    throw new Error('Método inesperado')
  }
  api.defaults.adapter = adapter
  assert.equal(normalizarBaseURL('https://https://backend.class.fabricadesoftware.ifc.edu.br/'), 'https://backend.class.fabricadesoftware.ifc.edu.br')
  await auth.cadastrar({ nome: ' Nova pessoa ', email: ' NOVO@EXAMPLE.COM ', senha: 'Senha123!', data_nascimento: '2000-01-01' })
  await auth.login(' ANA@EXAMPLE.COM ', 'Senha123!')
  assert.equal(auth.usuario.id, 1)
  assert.equal(localStorage.getItem('access_token'), 'access')
  console.log('OK: URL corrigida, cadastro, normalização do e-mail, login e usuário real')

  await projects.listarProjetos()
  assert.equal(projects.projetos.length, 1)
  assert.equal(projects.projetos[0].totalTarefas, 1)
  assert.equal(projects.projetos[0].administrador.nome, 'Ana')
  await assert.rejects(projects.carregarProjeto(20), /não participa/)
  const p = await projects.criarProjeto({ nome: 'Novo', descricao: 'Persistido no backend' })
  assert.equal(p.owner, 1)
  assert.ok(db.members.some(v => v.projeto === p.id && v.usuario === 1 && v.papel === 'admin'))
  await projects.atualizarProjeto(p.id, { nome: 'Editado', descricao: 'Descrição editada' })
  assert.equal(projects.buscarProjeto(p.id).nome, 'Editado')
  console.log('OK: projetos reais, isolamento, criação, administrador automático e edição')

  await tasks.listarTarefas(p.id)
  assert.equal(tasks.tarefas.length, 0)
  await projects.adicionarParticipante(p.id, '', 'JULIA@EXAMPLE.COM')
  await assert.rejects(projects.adicionarParticipante(p.id, 'Julia', ''), /e-mail válido/)
  const task = await tasks.criarTarefa({ projeto: p.id, titulo: 'Criada', descricao: 'Descrição', prioridade: 'alta', status: 'em_andamento', responsaveis: [2], data_inicio: '2026-10-20', prazo: '2026-10-30' })
  const post = requests.findLast(r => r.method === 'post' && new URL(r.url, api.defaults.baseURL).pathname === '/api/tarefas/')
  const payload = JSON.parse(post.data)
  assert.equal(payload.situacao, 'andamento')
  assert.equal(payload.data_inicio, '2026-10-20')
  assert.equal(task.data_inicio, '2026-10-20')
  assert.equal(payload.prioridade, 3)
  assert.equal(payload.responsavel, 2)
  assert.equal(payload.prazo, '2026-10-30T23:59:59-03:00')
  assert.equal(task.responsaveis[0].nome, 'Julia')
  assert.equal(task.prazo, '2026-10-30')
  await tasks.atualizarTarefa(task.id, { status: 'concluido' })
  assert.equal(projects.buscarProjeto(p.id).progresso, 100)
  refusePatch = true
  await assert.rejects(tasks.atualizarTarefa(task.id, { status: 'a_fazer' }))
  assert.equal(tasks.tarefas[0].status, 'concluido')
  refusePatch = false
  console.log('OK: tarefas e responsáveis persistidos, conversões do contrato e PATCH negado sem alteração local')

  await tasks.buscarTarefa(task.id)
  await tasks.adicionarComentario(task.id, 'Comentário real')
  await tasks.adicionarChecklist(task.id, 'Item real')
  await tasks.adicionarMaterial(task.id, { titulo: 'Material', url: 'https://example.com' })
  assert.equal(tasks.tarefaAtual.comentarios[0].texto, 'Comentário real')
  assert.equal(tasks.tarefaAtual.checklist[0].texto, 'Item real')
  assert.equal(tasks.tarefaAtual.materiais[0].projeto, p.id)
  await tasks.excluirTarefa(task.id)
  assert.equal(tasks.tarefas.length, 0)
  await projects.excluirProjeto(p.id)
  assert.equal(projects.buscarProjeto(p.id), null)
  console.log('OK: detalhes, comentários, checklist, materiais e exclusões usam a API')

  await projects.carregarProjeto(10)
  await projects.adicionarParticipante(10, '', 'julia@example.com')
  await projects.alterarPapel(10, 2, 'admin')
  await projects.alterarPapel(10, 1, 'participante')
  assert.equal(projects.podeAdministrar(10), false)
  await assert.rejects(projects.atualizarProjeto(10, { nome: 'Proibido', descricao: '' }), /administrador/)
  auth.usuario = { ...db.users[1], nome: 'Julia' }
  assert.equal(projects.podeAdministrar(10), true)
  await assert.rejects(projects.alterarPapel(10, 2, 'participante'), /pelo menos um administrador/)
  await projects.alterarPapel(10, 1, 'admin')
  auth.usuario = { ...db.users[0], nome: 'Ana' }
  // All pages share records, including when no board is currently selected.
  await tasks.listarTodas()
  assert.equal(tasks.todasTarefas.find(t => t.id === 1).projeto, 10)
  await tasks.buscarTarefa(1)
  await tasks.atualizarTarefa(1, { prazo: '2026-11-15', status: 'em_andamento' })
  assert.equal(tasks.todasTarefas.find(t => t.id === 1).prazo, '2026-11-15')
  assert.equal(tasks.tarefaAtual.status, 'em_andamento')
  await tasks.listarTarefas(10)
  assert.equal(tasks.tarefas.find(t => t.id === 1).status, 'em_andamento')
  console.log('OK: promoção/rebaixamento, último Admin e registros compartilhados entre todas as páginas')

  let count = 0
  api.defaults.adapter = async config => {
    count++
    const page = new URL(config.url, api.defaults.baseURL).searchParams.get('page')
    return result(config, { results: [{ id: count }], page: Number(page || 1), total_pages: 2 })
  }
  assert.equal((await listarPaginas('/api/tarefas/', { projeto: 10 })).length, 2)
  api.defaults.adapter = async config => result(config, { results: [], next: 'https://external.invalid/token' })
  await assert.rejects(listarPaginas('/api/tarefas/'), /Paginação/)
  let refreshCount = 0
  api.defaults.adapter = async config => {
    if (config.url === '/api/token/refresh/') { refreshCount++; await new Promise(resolve => setTimeout(resolve, 10)); return result(config, { access: 'renewed' }) }
    if (!config._retry) throw denied(config, 401)
    assert.equal(config.headers.Authorization, 'Bearer renewed')
    return result(config, {})
  }
  await Promise.all([api.get('/api/projetos/'), api.get('/api/tarefas/')])
  assert.equal(refreshCount, 1)
  let concluirPerfil
  api.defaults.adapter = config => new Promise(resolve => { concluirPerfil = () => resolve(result(config, { ...db.users[0], foto: null })) })
  const perfilPendente = auth.atualizarFoto(null)
  await new Promise(resolve => setTimeout(resolve, 10))
  auth.logout()
  concluirPerfil()
  await assert.rejects(perfilPendente, /Sessão alterada/)
  assert.equal(auth.usuario, null)
  assert.equal(auth.carregando, false)
  assert.equal(localStorage.getItem('access_token'), null)
  assert.equal(projects.projetos.length, 0)
  assert.equal(tasks.tarefas.length, 0)
  console.log('OK: paginação completa, origem segura, renovação JWT única e limpeza no logout')
} finally { await server.close() }
