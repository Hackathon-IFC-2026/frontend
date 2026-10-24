import axios from 'axios'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'https://backend.class.fabricadesoftware.ifc.edu.br',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')

  const rotasPublicas = [
    '/api/registro/',
    '/api/token/',
    '/api/token/refresh/',
    '/api/token/verify/',
    '/api/auth/password-reset/request/',
    '/api/auth/password-reset/verify/',
    '/api/auth/password-reset/confirm/',
  ]

  const rota = new URL(config.url, config.baseURL).pathname

  if (token && !rotasPublicas.includes(rota)) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }

  return config
})

export default api
