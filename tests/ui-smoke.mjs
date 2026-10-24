import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { port: 5188, strictPort: true, host: '127.0.0.1' } })
await server.listen()
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'kando-ui-'))
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9229', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
let ws, cdp
const pending = new Map()
let counter = 0
const errors = []
try {
  let targets
  for (let i = 0; i < 80; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9229/json/list', { signal: AbortSignal.timeout(500) })).json(); if (targets.length) break } catch {}
    await sleep(100)
  }
  assert.ok(targets?.length, 'Chrome não abriu')
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl)
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))
  cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++counter; const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)) }, 15000); pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value) }, reject: err => { clearTimeout(timer); reject(err) } }); ws.send(JSON.stringify({ id, method, params }))
  })
  const users = [{ id: 1, name: 'Ana Teste', email: 'ana@example.test', data_nascimento: '2000-01-01' }, { id: 2, name: 'Julia Teste', email: 'julia@example.test' }]
  const projects = [{ id: 10, nome: 'Projeto de integração', descricao: 'Validar o gerenciamento colaborativo.', criado_por: 1 }]
  const members = [{ id: 1, projeto: 10, usuario: 1, papel: 'admin' }, { id: 2, projeto: 10, usuario: 2, papel: 'participante' }]
  const today = new Date().toISOString().slice(0, 10)
  const tasks = [{ id: 1, projeto: 10, titulo: 'Validar integração', descricao: 'Mesma tarefa no Kanban e no calendário.', situacao: 'aberta', prioridade: 3, responsavel: 1, criador: 1, data_inicio: today.slice(0,8) + '01', prazo: today + 'T23:59:59-03:00' }, { id: 2, projeto: 10, titulo: 'Tarefa da Julia', descricao: 'Verificar permissões.', situacao: 'andamento', prioridade: 2, responsavel: 2, criador: 1, prazo: null }]
  let avatarData = ''
  const notifications = [{ id: 1, usuario: 1, projeto: 10, tarefa: 1, titulo: 'Nova tarefa', mensagem: 'Você recebeu uma nova tarefa.', tipo: 'atribuicao', lida: false, criada_em: new Date().toISOString() }]
  ws.addEventListener('message', async e => {
    const message = JSON.parse(e.data)
    if (message.id) {
      const call = pending.get(message.id); pending.delete(message.id)
      if (message.error) call?.reject(new Error(JSON.stringify(message.error))); else call?.resolve(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ' ' + (message.params.exceptionDetails.exception?.description || ''))
    if (message.method !== 'Fetch.requestPaused') return
    const { requestId, request } = message.params
    const url = new URL(request.url)
    const multipart = Object.values(request.headers).some(value => String(value).includes('multipart/form-data'))
    const data = request.postData && !multipart ? JSON.parse(request.postData) : {}
    const headers = [{ name: 'Content-Type', value: 'application/json; charset=utf-8' }, { name: 'Access-Control-Allow-Origin', value: '*' }, { name: 'Access-Control-Allow-Headers', value: 'authorization,content-type' }, { name: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' }]
    let result = {}
    if (request.method !== 'OPTIONS') {
      if (url.pathname === '/api/usuarios/me/') result = users[0]
      else if (url.pathname === '/api/usuarios/alterar-senha/') result = { access: 'test-access', refresh: 'test-refresh' }
      else {
        const [, , resource, id] = url.pathname.split('/')
        const table = { projetos: projects, 'participantes-projeto': members, tarefas: tasks, usuarios: users, notificacoes: notifications, comentarios: [], checklists: [], 'materiais-apoio': [] }[resource]
        if (!table) { errors.push('Endpoint inesperado ' + url.pathname); result = {} }
        else if (request.method === 'GET') result = id ? table.find(t => t.id === Number(id)) : { results: table, page: 1, total_pages: 1 }
        else if (request.method === 'PATCH') { result = table.find(t => t.id === Number(id)); Object.assign(result, multipart ? { foto: avatarData } : data) }
        else if (request.method === 'POST' && id === 'ler-todas') { table.forEach(n => { n.lida = true }); result = {} }
        else if (request.method === 'POST') { result = { id: table.length + 10, criado_por: 1, ...data }; table.push(result) }
        else if (request.method === 'DELETE') { table.splice(table.findIndex(t => t.id === Number(id)), 1); result = null }
      }
    }
    await cdp('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: headers, body: Buffer.from(JSON.stringify(result ?? {})).toString('base64') })
  })
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Fetch.enable', { patterns: [{ urlPattern: '*/api/*' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('access_token','test-access');localStorage.setItem('refresh_token','test-refresh')" })
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    return result.result.value
  }
  async function wait(expression) {
    for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await sleep(100) }
    throw new Error('Tempo esgotado: ' + expression)
  }
  const navigate = async route => {
    await cdp('Page.navigate', { url: 'http://127.0.0.1:5188' + route })
    await wait("document.querySelector('.sidebar')")
  }
  await fs.mkdir('docs/ui-checks', { recursive: true })
  const screenshot = async file => {
    await wait("!document.querySelector('.page-enter-active, .page-leave-active')")
    await sleep(150)
    await evaluate("Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]).then(() => true)")
    const image = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    await fs.writeFile('docs/ui-checks/' + file + '.png', Buffer.from(image.data, 'base64'))
  }
  await navigate('/projects')
  await wait("document.querySelector('.card-moderno')")
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.projetos-grid')).display"), 'grid')
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.card-moderno')).borderRadius"), '15px')
  await wait("Math.round(document.querySelector('.sidebar').getBoundingClientRect().width) === 260")
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.sidebar')).backgroundColor"), 'rgb(250, 250, 248)')
  await screenshot('projetos-claro')
  await evaluate("document.querySelector('.toggle-sidebar').click()")
  await wait("Math.round(document.querySelector('.sidebar').getBoundingClientRect().width) === 76")
  assert.equal(await evaluate("Math.round(parseFloat(getComputedStyle(document.querySelector('.app-main')).marginLeft))"), 76)
  assert.equal(await evaluate("localStorage.getItem('kando:sidebar')"), 'compacta')
  await evaluate("document.querySelector('a[aria-label=Projetos]').focus()")
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true })
  await evaluate("document.querySelector('a[aria-label=Projetos]').focus()")
  await wait("parseFloat(getComputedStyle(document.querySelector('a[aria-label=Projetos] .sidebar-tooltip')).opacity) > .9")
  await screenshot('sidebar-compacta')
  await navigate('/projects')
  await wait("Math.round(document.querySelector('.sidebar').getBoundingClientRect().width) === 76")
  await evaluate("document.querySelector('.toggle-sidebar').click()")
  await wait("Math.round(document.querySelector('.sidebar').getBoundingClientRect().width) === 260")

  await evaluate("document.querySelector('.card-moderno').click()")
  await wait("document.querySelector('.task-card')")
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.kanban-area')).display"), 'grid')
  assert.equal(await evaluate("document.querySelectorAll('.kanban-coluna').length"), 4)
  await screenshot('kanban-claro')
  await evaluate("document.querySelector('.btn-criar').click()")
  await wait("document.querySelector('.task-form-dialog')")
  assert.equal(await evaluate("Math.round(document.querySelector('.task-form-dialog').getBoundingClientRect().width)"), 520)
  await evaluate("for (const [id, value] of Object.entries({ 'task-title': 'Planejamento real', 'task-description': 'Testar início e prazo.', 'task-start': '2026-10-25', 'task-due': '2026-10-30' })) { const input = document.getElementById(id); input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })) }")
  await screenshot('nova-tarefa-compacta')
  await evaluate("document.querySelector('.task-form-dialog form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))")
  await wait("!document.querySelector('.task-form-dialog')")
  const criada = tasks.find(t => t.titulo === 'Planejamento real')
  assert.equal(criada.data_inicio, '2026-10-25')
  assert.equal(criada.prazo, '2026-10-30T23:59:59-03:00')
  tasks.splice(tasks.indexOf(criada), 1)

  await evaluate("document.querySelectorAll('.participante-item select')[1].value = 'admin'; document.querySelectorAll('.participante-item select')[1].dispatchEvent(new Event('change', { bubbles: true }))")
  await wait("document.querySelectorAll('.participante-item select')[1].value === 'admin'")
  await evaluate("document.querySelector('.participante-item select').value = 'participante'; document.querySelector('.participante-item select').dispatchEvent(new Event('change', { bubbles: true }))")
  await wait("document.querySelector('.btn-criar') === null")
  await screenshot('kanban-participante')
  members[0].papel = 'admin'
  await navigate('/minhas-tarefas')
  await wait("document.querySelector('.abrir-tarefa')")
  assert.equal(await evaluate("document.querySelectorAll('.abrir-tarefa').length"), 1)
  await evaluate("document.querySelector('.abrir-tarefa').click()")
  await wait("document.querySelector('.task-modal h1')")
  await screenshot('minhas-tarefas-detalhes')
  await evaluate("document.querySelector('.section-heading .edit-btn').click()")
  await wait("document.querySelector('.task-form-dialog')")
  await screenshot('editar-tarefa-compacta')
  await evaluate("const start = document.getElementById('task-start'); start.value = " + JSON.stringify(today.slice(0,8) + '02') + "; start.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('.task-form-dialog form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))")
  await wait("!document.querySelector('.task-form-dialog')")
  assert.equal(tasks[0].data_inicio, today.slice(0,8) + '02')

  await navigate('/calendario')
  await wait("document.querySelector('.evento')")
  assert.ok(await evaluate("[...document.querySelectorAll('.evento')].some(b => b.textContent.includes('Início'))"))
  await screenshot('calendario-claro')
  await navigate('/perfil')
  await wait("document.querySelector('#nome')?.value === 'Ana Teste'")
  assert.equal(await evaluate("document.querySelector('#data-nascimento').value"), '2000-01-01')
  assert.equal(await evaluate("!!document.querySelector('.photo-editor')"), false)
  await screenshot('perfil-claro')

  await evaluate("document.querySelector('.edit-btn').click()")
  await wait("document.querySelector('.photo-editor')")
  avatarData = await evaluate("(() => { const canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 300; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#73967f'; ctx.fillRect(0,0,400,300); ctx.fillStyle = '#ece6d8'; ctx.beginPath(); ctx.arc(200,150,90,0,Math.PI*2); ctx.fill(); return canvas.toDataURL('image/png') })()")
  await evaluate("(async () => { const blob = await (await fetch(" + JSON.stringify(avatarData) + ")).blob(); const transfer = new DataTransfer(); transfer.items.add(new File([blob], 'foto.png', { type: 'image/png' })); const input = document.querySelector('.photo-editor input[type=file]'); input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true })) })()")
  await wait("document.querySelector('.crop-window img')")
  await screenshot('perfil-recorte')
  await evaluate("[...document.querySelectorAll('.photo-tools button')].find(b => b.textContent.includes('Salvar foto')).click()")
  await wait("document.querySelector('.user-avatar img')")
  assert.equal(users[0].foto, avatarData)
  await screenshot('perfil-foto-salva')

  await evaluate("const nome = document.querySelector('#nome'); nome.value = 'Ana Atualizada'; nome.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('.profile-card form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))")
  await wait("document.querySelector('.sidebar-footer').textContent.includes('Ana Atualizada')")
  assert.equal(users[0].name, 'Ana Atualizada')
  await evaluate("for (const [id, value] of Object.entries({ 'senha-atual': 'OriginalPassword123!', 'nova-senha': 'DifferentPassword456!', 'confirmar-senha': 'DifferentPassword456!' })) { const input = document.getElementById(id); input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })) }")
  await evaluate("document.querySelector('.password-card form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))")
  await wait("document.querySelector('.password-card').textContent.includes('Senha atualizada com sucesso.')")

  await navigate('/notificacoes')
  await wait("document.querySelector('.notificacao-item')")
  await evaluate("localStorage.setItem('tema','escuro'); document.documentElement.classList.add('dark-mode')")
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.sidebar')).backgroundColor"), 'rgb(25, 35, 30)')
  await screenshot('notificacoes-escuro')
  await evaluate("document.querySelector('.mark-all-btn').click()")
  await wait("!document.querySelector('.notificacao-item.nao-lida')")
  assert.equal(notifications[0].lida, true)
  await evaluate("document.querySelector('.action-btn.delete').click()")
  await wait("!document.querySelector('.notificacao-item')")
  assert.equal(notifications.length, 0)

  await navigate('/projetos/10/kanban')
  await wait("document.querySelector('.task-card')")
  await evaluate("document.documentElement.classList.add('dark-mode')")
  await screenshot('kanban-escuro')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await screenshot('kanban-celular')
  assert.equal(await evaluate("document.querySelector('.mobile-trigger').getAttribute('aria-expanded')"), 'false')
  await evaluate("document.querySelector('.mobile-trigger').click()")
  await wait("document.querySelector('.sidebar-backdrop')")
  await wait("document.querySelector('.sidebar').getBoundingClientRect().left >= -1")
  await screenshot('sidebar-celular-aberta')
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' })
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' })
  await wait("!document.querySelector('.sidebar-backdrop')")
  await evaluate("document.querySelector('.mobile-trigger').click()")
  await sleep(350)
  await evaluate("document.querySelector('a[aria-label=Dashboard]').click()")
  await wait("document.querySelector('.dashboard')")
  await wait("!document.querySelector('.sidebar-backdrop')")
  await screenshot('dashboard-celular')

  assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'A tela não deve transbordar horizontalmente no celular')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 950, height: 950, deviceScaleFactor: 1, mobile: false })
  await evaluate("localStorage.removeItem('kando:sidebar')")
  await navigate('/projects')
  await wait("Math.round(document.querySelector('.sidebar').getBoundingClientRect().width) === 76")
  await screenshot('sidebar-tablet')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await evaluate("document.querySelector('.toggle-sidebar').click()")
  await wait("Math.round(document.querySelector('.sidebar').getBoundingClientRect().width) === 260")
  await cdp('Emulation.setEmulatedMedia', { features: [] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: 'http://127.0.0.1:5188/cadastro' })
  await wait("document.querySelector('#nascimento-dia')")
  assert.equal(await evaluate("document.querySelectorAll('.nascimento-field select[required]').length"), 3)
  await evaluate("for (const [id, value] of Object.entries({ 'nascimento-dia': '31', 'nascimento-mes': '01', 'nascimento-ano': '2000' })) { const input = document.getElementById(id); input.value = value; input.dispatchEvent(new Event('change', { bubbles: true })) }")
  await evaluate("const mes = document.getElementById('nascimento-mes'); mes.value = '02'; mes.dispatchEvent(new Event('change', { bubbles: true }))")
  await wait("document.getElementById('nascimento-dia').value === ''")
  assert.equal(await evaluate("document.getElementById('nascimento-dia').options.length"), 30)
  assert.equal(await evaluate("!!document.querySelector('input[type=file]')"), false)
  await screenshot('cadastro-nascimento')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await screenshot('cadastro-celular')
  assert.equal(errors.length, 0, errors.join('\n'))
  console.log('OK: Projetos e Kanban com CSS, mudança de função, Minhas Tarefas, detalhes, calendário, perfil, notificações e tema escuro. Capturas em docs/ui-checks.')
} finally {
  if (cdp) { try { await cdp('Browser.close') } catch {} }
  if (ws) ws.close()
  chrome.kill()
  await server.close()
}

