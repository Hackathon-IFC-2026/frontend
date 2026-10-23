
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')

  const rotasPublicas = [
    '/api/registro/',
    '/api/token/',
    '/api/token/refresh/',
    '/api/token/verify/',
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
