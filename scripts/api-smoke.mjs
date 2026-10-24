import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'

const base = 'https://backend.class.fabricadesoftware.ifc.edu.br'
const actors = []
const created = []
let failures = 0
async function request(path, method = 'GET', body, actor, expected) {
  const response = await fetch(base + path, { method, signal: AbortSignal.timeout(30000), headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(actor?.access ? { Authorization: 'Bearer ' + actor.access } : {}) }, body: body ? JSON.stringify(body) : undefined })
  let data
  try { data = await response.json() } catch { data = null }
  if (expected && !expected.includes(response.status)) throw new Error(method + ' ' + path + ': HTTP ' + response.status + ' (esperado ' + expected.join('/') + '), campos: ' + Object.keys(data || {}).join(', ') + (data?.projeto ? ', projeto: ' + JSON.stringify(data.projeto) : ''))
  return { status: response.status, data }
}
async function newActor() {
  const actor = { email: 'kando-smoke-' + randomUUID() + '@example.invalid', password: randomBytes(24).toString('base64url') }
  const registered = await request('/api/registro/', 'POST', { name: 'Validação temporária Kando', email: actor.email, password: actor.password, data_nascimento: '2000-01-01' }, null, [201])
  actor.id = registered.data.id
  actors.push(actor)
  const login = await request('/api/token/', 'POST', { email: actor.email, password: actor.password }, null, [200])
  actor.access = login.data.access
  actor.refresh = login.data.refresh
  const me = await request('/api/usuarios/me/', 'GET', undefined, actor, [200])
  assert.equal(me.data.id, actor.id)
  return actor
}
function check(label, actual, expected) {
  if (expected.includes(actual)) console.log('OK: ' + label + ' HTTP ' + actual)
  else { failures++; console.log('PENDÊNCIA NO SERVIDOR: ' + label + ' HTTP ' + actual + ' (esperado ' + expected.join('/') + ')') }
}
try {
  const cors = await fetch(base + '/api/projetos/', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' }, signal: AbortSignal.timeout(20000) })
  console.log('CORS localhost: ' + (cors.headers.get('access-control-allow-origin') || 'não autorizado'))
  const owner = await newActor()
  console.log('OK: cadastro, login JWT e consulta do usuário autenticado')
  const refresh = await request('/api/token/refresh/', 'POST', { refresh: owner.refresh }, null, [200])
  owner.access = refresh.data.access
  console.log('OK: renovação JWT')
  const project = (await request('/api/projetos/', 'POST', { nome: 'Validação temporária Kanban', descricao: 'Registro de teste a ser removido automaticamente.' }, owner, [201])).data
  created.push({ path: '/api/projetos/' + project.id + '/', owner })
  assert.equal(project.criado_por, owner.id)
  await request('/api/projetos/' + project.id + '/', 'GET', undefined, owner, [200])
  await request('/api/projetos/' + project.id + '/', 'PATCH', { nome: 'Validação temporária editada' }, owner, [200])
  console.log('OK: projeto criado com administrador automático, consultado e editado')
  const admin = await request('/api/participantes-projeto/', 'POST', { projeto: project.id, usuario: owner.id, papel: 'admin' }, owner, [201])
  created.push({ path: '/api/participantes-projeto/' + admin.data.id + '/', owner })
  console.log('OK: criador registrado automaticamente como administrador participante')
  const task = (await request('/api/tarefas/', 'POST', { projeto: project.id, titulo: 'Tarefa temporária', descricao: 'Validação de persistência', prioridade: 3, situacao: 'aberta', responsavel: owner.id, prazo: '2027-12-31T23:59:59-03:00' }, owner, [201])).data
  created.push({ path: '/api/tarefas/' + task.id + '/', owner })
  await request('/api/tarefas/' + task.id + '/', 'PATCH', { titulo: 'Tarefa temporária editada', situacao: 'andamento' }, owner, [200])
  const finished = (await request('/api/tarefas/' + task.id + '/', 'PATCH', { situacao: 'concluida' }, owner, [200])).data
  assert.equal(finished.situacao, 'concluida')
  console.log('Conclusão registrada: ' + Boolean(finished.concluida_em))
  console.log('OK: tarefa criada, editada, movimentada e concluída')
  for (const [path, data] of [
    ['/api/checklists/', { tarefa: task.id, descricao: 'Item temporário', concluido: false }],
    ['/api/comentarios/', { tarefa: task.id, autor: owner.id, conteudo: 'Comentário temporário' }],
    ['/api/materiais-apoio/', { projeto: project.id, criador: owner.id, titulo: 'Material temporário', url: 'https://example.com' }],
  ]) {
    const result = await request(path, 'POST', data, owner)
    check(path, result.status, [201])
    if (result.status === 201) created.push({ path: path + result.data.id + '/', owner })
  }
  const member = await newActor()
  check('privacidade do projeto antes da participação', (await request('/api/projetos/' + project.id + '/', 'GET', undefined, member)).status, [403, 404])
  const membership = await request('/api/participantes-projeto/', 'POST', { projeto: project.id, usuario: member.id, papel: 'participante' }, owner, [201])
  created.push({ path: '/api/participantes-projeto/' + membership.data.id + '/', owner })
  check('acesso do participante', (await request('/api/projetos/' + project.id + '/', 'GET', undefined, member)).status, [200])
  check('participante não edita o projeto', (await request('/api/projetos/' + project.id + '/', 'PATCH', { nome: project.nome }, member)).status, [403, 404])
  await request('/api/tarefas/' + task.id + '/', 'PATCH', { responsavel: member.id, situacao: 'aberta' }, owner, [200])
  check('responsável pode movimentar tarefa', (await request('/api/tarefas/' + task.id + '/', 'PATCH', { situacao: 'andamento' }, member)).status, [200])
  console.log('Validação concluída. Pendências do servidor: ' + failures)
} catch (error) {
  failures++
  console.log('FALHA: ' + error.message)
} finally {
  for (const record of created.reverse()) {
    try { const result = await request(record.path, 'DELETE', undefined, record.owner); console.log('Limpeza ' + record.path + ': HTTP ' + result.status) }
    catch { console.log('Não foi possível remover registro temporário: ' + record.path) }
  }
  for (const actor of actors.reverse()) {
    try { const result = await request('/api/usuarios/' + actor.id + '/', 'DELETE', undefined, actor); console.log('Limpeza da conta temporária: HTTP ' + result.status) }
    catch { console.log('Não foi possível remover a conta temporária de ID ' + actor.id) }
  }
}
process.exitCode = failures ? 1 : 0
