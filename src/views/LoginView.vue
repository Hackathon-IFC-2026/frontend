<template>
  <main class="auth-view auth-view--welcome-right">
    <section class="form-side">
      <h2 class="form-title">Entrar</h2>

      <form class="form" @submit.prevent="entrar">
        <div class="field">
          <label for="email">E-mail</label>
          <input id="email" v-model="form.email" type="email" placeholder="Digite seu e-mail aqui" autocomplete="email" required />
        </div>

        <div class="field">
          <label for="senha">Senha</label>
          <input id="senha" v-model="form.senha" type="password" placeholder="Digite sua senha aqui" autocomplete="current-password" required />
        </div>

        <button type="submit" class="btn">Entrar</button>
      </form>
    </section>

    <section class="welcome">
      <h1>Bem-vindo de volta!</h1>
      <p>Não possui conta?<br />Faça seu cadastro.</p>
      <RouterLink to="/cadastro" class="btn">Cadastrar-se</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const form = reactive({
  email: '',
  senha: ''
})

async function entrar() {
  try {
    await authStore.login(form.email, form.senha)

    toast.mostrar('Login realizado com sucesso!', 'success')
    router.push('/inicio')

  } catch (error) {
    const mensagem = error.response?.data?.detail

    if (mensagem === 'No active account found with the given credentials') {
      toast.mostrar('E-mail ou senha incorretos.', 'error')
    } else {
      toast.mostrar(
        mensagem || 'Não foi possível realizar o login.',
        'error'
      )
    }
  }
}
</script>
