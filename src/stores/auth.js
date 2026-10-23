import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '/services/api.js'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null)
  const carregando = ref(false)
  const erro = ref(null)

  async function cadastrar(dados) {
    carregando.value = true
    erro.value = null

    try {
      const response = await api.post('/api/registro/', {
        name: dados.nome,
        email: dados.email,
        password: dados.senha,
      })

      return response.data
    } catch (error) {
      erro.value = error.response?.data || {
        detail: 'Erro ao realizar cadastro.',
      }
      throw error
    } finally {
      carregando.value = false
    }
  }

  async function login(email, senha) {
    carregando.value = true
    erro.value = null

    try {
      const response = await api.post('/api/token/', {
        email,
        password: senha,
      })

      const { access, refresh } = response.data

      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)

      await buscarUsuario()

      return response.data
    } catch (error) {
      erro.value = error.response?.data || {
        detail: 'Não foi possível realizar o login.',
      }
      throw error
    } finally {
      carregando.value = false
    }
  }

  async function buscarUsuario() {
    const response = await api.get('/api/usuarios/me/')
    usuario.value = response.data
    return response.data
  }

  async function renovarToken() {
    const refresh = localStorage.getItem('refresh_token')

    if (!refresh) {
      logout()
      return null
    }

    try {
      const response = await api.post('/api/token/refresh/', {
        refresh,
      })

      localStorage.setItem('access_token', response.data.access)

      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh)
      }

      return response.data.access
    } catch (error) {
      logout()
      throw error
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    usuario.value = null
    erro.value = null
  }

  return {
    usuario,
    carregando,
    erro,
    cadastrar,
    login,
    buscarUsuario,
    renovarToken,
    logout,
  }
})
