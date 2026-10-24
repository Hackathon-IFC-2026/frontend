import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createPinia, setActivePinia } from 'pinia'

globalThis.window = new EventTarget()
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }
const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: api } = await server.ssrLoadModule('/services/api.js')
  const { useInsightsStore } = await server.ssrLoadModule('/src/stores/insights.js')
  setActivePinia(createPinia())
  const store = useInsightsStore()
  const response = (config, data) => ({ config, data, status: 200, headers: {}, statusText: 'OK' })
  let firstResolve
  api.defaults.adapter = config => new Promise(resolve => {
    if (config.url.includes('/1/')) firstResolve = () => resolve(response(config, { projeto: 1 }))
    else resolve(response(config, { projeto: 2 }))
  })
  const first = store.carregar(1)
  await new Promise(resolve => setTimeout(resolve, 0))
  await store.carregar(2)
  firstResolve()
  await first
  assert.equal(store.analise.projeto, 2, 'Old project responses must not overwrite the current project')
  let complete
  api.defaults.adapter = config => new Promise(resolve => { complete = () => resolve(response(config, { projeto: 2 })) })
  const load = store.carregar(2)
  await new Promise(resolve => setTimeout(resolve, 0))
  window.dispatchEvent(new Event('auth:changed'))
  complete()
  await load
  assert.equal(store.analise, null, 'A response from an old session must be discarded')
  api.defaults.adapter = async () => { const error = new Error('Missing endpoint'); error.response = { status: 404 }; throw error }
  await store.carregar(7)
  assert.equal(store.loading, false)
  assert.equal(store.analise, null)
  assert.match(store.error, /Análise indisponível/)
  let posts = 0
  api.defaults.adapter = async config => {
    if (config.method === 'post') { posts++; assert.deepEqual(JSON.parse(config.data), { usuario: 9, capacidade: 20 }) }
    return response(config, config.method === 'post' ? {} : { projeto: 7 })
  }
  assert.equal(await store.capacidade(7, 9, 20), true)
  assert.equal(posts, 1)
  assert.equal(store.analise.projeto, 7)
  assert.equal(store.saving, false)
  assert.equal(store.error, '')
  console.log('OK: Insights descarta projetos e sessões antigos, trata endpoint ausente e atualiza a capacidade pela API.')
} finally { await server.close() }
