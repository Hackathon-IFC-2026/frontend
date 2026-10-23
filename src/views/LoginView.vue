
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
          <div class="senha-container">
            <input
              id="senha"
              v-model="form.senha"
              :type="mostrarSenha ? 'text' : 'password'"
              placeholder="Digite sua senha aqui"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="senha-toggle"
              :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
              @click="mostrarSenha = !mostrarSenha"
            >
              <span class="material-symbols-outlined">
                {{ mostrarSenha ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>
        <button type="submit" class="btn">Entrar</button>
      </form>
    </section>

    <section class="welcome">
      <h1>KANDO</h1>
      <p>Gerenciamento de tarefas</p>
      <p>Não possui conta?<br />Faça seu cadastro.</p>
      <RouterLink to="/cadastro" class="btn">Cadastrar-se</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const mostrarSenha = ref(false)

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

<style scoped>
.senha-container {
  position: relative;
  width: 100%;
}

.senha-container input {
  padding-right: 55px;
}

.senha-toggle {
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #fff9e3;
  cursor: pointer;
}

.senha-toggle .material-symbols-outlined {
  font-size: 23px;
}

.welcome h1 + p {
  margin-top: 8px;
}

.welcome p + p {
  margin-top: 28px;
}

.welcome p + .btn {
  margin-top: 12px;
}
</style>
