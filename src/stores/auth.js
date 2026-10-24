import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '/services/api.js'
import { mensagemErro } from '/services/apiHelpers.js'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null)
  const carregando = ref(false)
  const erro = ref(null)
  let consulta = null
  let versao = 0
  function limparSessao() { versao++; usuario.value = null; consulta = null; carregando.value = false }
  window.addEventListener('auth:expired', limparSessao)

  async function cadastrar(dados) {
    if (carregando.value) return
    carregando.value = true
    erro.value = null
    try {
      const { data } = await api.post('/api/registro/', {
        name: dados.nome.trim(), email: dados.email.trim().toLowerCase(), password: dados.senha, data_nascimento: dados.data_nascimento,
      })
      return data
    } catch (error) { erro.value = mensagemErro(error); throw error }
    finally { carregando.value = false }
  }
  async function buscarUsuario() {
    if (consulta) return consulta
    const contexto = versao
    consulta = api.get('/api/usuarios/me/').then(({ data }) => {
      if (contexto === versao) usuario.value = { ...data, nome: data.name || data.nome || data.email }
      return data
    }).finally(() => { if (contexto === versao) consulta = null })
    return consulta
  }
  async function login(email, senha) {
    if (carregando.value) return
    limparSessao()
    carregando.value = true
    erro.value = null
    try {
      const { data } = await api.post('/api/token/', { email: email.trim().toLowerCase(), password: senha })
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      window.dispatchEvent(new Event('auth:changed'))
      await buscarUsuario()
      return data
    } catch (error) {
      logout()
      erro.value = mensagemErro(error, 'Não foi possível realizar o login.')
      throw error
    } finally { carregando.value = false }
  }
  async function renovarToken() {
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) { logout(); return null }
    try {
      const { data } = await api.post('/api/token/refresh/', { refresh })
      localStorage.setItem('access_token', data.access)
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
      return data.access
    } catch (error) { if ([400, 401].includes(error.response?.status)) logout(); throw error }
  }
  async function restaurarSessao() {
    if (!localStorage.getItem('access_token') && !localStorage.getItem('refresh_token')) { if (usuario.value) logout(); return null }
    if (usuario.value && localStorage.getItem('access_token')) return usuario.value
    if (!localStorage.getItem('access_token')) {
      if (!localStorage.getItem('refresh_token')) return null
      await renovarToken()
    }
    return buscarUsuario()
  }
  async function atualizarPerfil(dados) {
    const contexto = versao
    carregando.value = true
    erro.value = null
    try {
      const { data } = await api.patch('/api/usuarios/' + usuario.value.id + '/', {
        name: dados.nome.trim(), email: dados.email.trim().toLowerCase(), data_nascimento: dados.data_nascimento || null,
      })
      if (contexto !== versao) throw new Error('Sessão alterada. Entre novamente.')
      usuario.value = { ...data, nome: data.name || data.email }
      return usuario.value
    } catch (err) { if (contexto === versao) erro.value = mensagemErro(err); throw err }
    finally { if (contexto === versao) carregando.value = false }
  }
  async function atualizarFoto(arquivo) {
    const contexto = versao
    const envio = arquivo ? new FormData() : { foto: null }
    if (arquivo) envio.append('foto', arquivo)
    carregando.value = true
    erro.value = null
    try {
      const { data } = await api.patch('/api/usuarios/' + usuario.value.id + '/', envio)
      if (arquivo && !data.foto) throw new Error('O servidor não confirmou o armazenamento da foto.')
      if (contexto !== versao) throw new Error('Sessão alterada. Entre novamente.')
      usuario.value = { ...data, nome: data.name || data.email }
      return usuario.value
    } catch (err) { if (contexto === versao) erro.value = mensagemErro(err); throw err }
    finally { if (contexto === versao) carregando.value = false }
  }
  async function alterarSenha(dados) {
    const contexto = versao
    carregando.value = true
    erro.value = null
    try {
      const { data } = await api.post('/api/usuarios/alterar-senha/', dados)
      if (contexto !== versao) throw new Error('Sessão alterada. Entre novamente.')
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
    } catch (err) { if (contexto === versao) erro.value = mensagemErro(err); throw err }
    finally { if (contexto === versao) carregando.value = false }
  }
  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('access')
    limparSessao()
    erro.value = null
    window.dispatchEvent(new Event('auth:changed'))
  }
  return { atualizarFoto, atualizarPerfil, alterarSenha, usuario, carregando, erro, cadastrar, login, buscarUsuario, renovarToken, restaurarSessao, logout }
})
