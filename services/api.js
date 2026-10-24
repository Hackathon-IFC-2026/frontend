import axios from 'axios'

export function normalizarBaseURL(value) {
  const url = String(value || 'https://backend.class.fabricadesoftware.ifc.edu.br').trim()
    .replace(/^(https?:\/\/)(?:https?:\/\/)+/i, '$1').replace(/\/+$/, '')
  const completa = /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : (/^(localhost|127\.0\.0\.1)(:|\/|$)/.test(url) ? 'http://' : 'https://') + url
  const parsed = new URL(completa)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('URL da API inválida.')
  return completa
}

const api = axios.create({
  baseURL: normalizarBaseURL(import.meta.env.VITE_API_URL),
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')

  const rotasPublicas = [
    '/api/registro/',
    '/api/token/',
    '/api/token/refresh/',
    '/api/token/verify/',
  ]

  const target = new URL(config.url, config.baseURL)
  if (target.origin !== new URL(api.defaults.baseURL).origin) throw new Error('Destino da API inválido.')
  const rota = target.pathname

  if (token && !rotasPublicas.includes(rota)) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }

  return config
})

let refreshEmAndamento = null

api.interceptors.response.use(response => response, async error => {
  const config = error.config
  const rota = config && new URL(config.url, config.baseURL).pathname
  if (error.response?.status !== 401 || !config || config._retry ||
      ['/api/token/', '/api/token/refresh/'].includes(rota) ||
      !config.headers?.Authorization) throw error
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) {
    localStorage.removeItem('access_token')
    window.dispatchEvent(new Event('auth:expired'))
    throw error
  }
  config._retry = true
  if (!refreshEmAndamento) {
    refreshEmAndamento = api.post('/api/token/refresh/', { refresh })
      .then(({ data }) => {
        if (localStorage.getItem('refresh_token') !== refresh) throw new Error('Sessão alterada durante a renovação.')
        localStorage.setItem('access_token', data.access)
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
        return data.access
      })
      .catch(err => {
        if ([400, 401].includes(err.response?.status) && localStorage.getItem('refresh_token') === refresh) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.dispatchEvent(new Event('auth:expired'))
        }
        throw err
      })
      .finally(() => { refreshEmAndamento = null })
  }
  const access = await refreshEmAndamento
  config.headers.Authorization = 'Bearer ' + access
  return api(config)
})

export default api
