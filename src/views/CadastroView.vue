<template>
  <main class="auth-view auth-view--welcome-left">
    <section class="welcome">
      <h1>Olá, bem-vindo ao<br>Kando!</h1>
      <p>Você já possui cadastro?<br />Ótimo, acesse sua conta.</p>
      <RouterLink to="/login" class="btn">Entrar</RouterLink>
    </section>
    <section class="form-side">
      <h2 class="form-title">Cadastro</h2>
      <form class="form" @submit.prevent="enviar">
        <div class="field">
          <label for="nome">Nome</label>
          <input id="nome" v-model="form.nome" type="text" placeholder="Digite seu nome aqui" autocomplete="name" required />
        </div>
        <div class="field">
          <label for="email">E-mail</label>
          <input id="email" v-model="form.email" type="email" placeholder="Digite seu e-mail aqui" autocomplete="email" required />
        </div>
        <div class="field" role="group" aria-labelledby="nascimento">
          <span id="nascimento" class="field__label">Data de nascimento</span>
          <div class="date-row">
            <select v-model="form.dia" aria-label="Dia" required>
              <option value="" disabled>Dia</option>
              <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
            </select>
            <select v-model="form.mes" aria-label="Mês" required>
              <option value="" disabled>Mês</option>
              <option v-for="(m, i) in meses" :key="m" :value="i + 1">{{ m }}</option>
            </select>
            <select v-model="form.ano" aria-label="Ano" required>
              <option value="" disabled>Ano</option>
              <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label for="senha">Senha</label>
          <PasswordInput id="senha" v-model="form.senha" placeholder="Digite sua senha aqui" autocomplete="new-password" required />
        </div>

        <div class="field">
          <label for="confirma">Confirme sua senha</label>
          <PasswordInput id="confirma" v-model="form.confirma" placeholder="Confirme sua senha aqui" autocomplete="new-password" required />
        </div>

        <button type="submit" class="btn">Continuar</button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { reactive } from 'vue'
import PasswordInput from '../components/shared/PasswordInput.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
const router = useRouter()
const authStore = useAuthStore()



const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 100 }, (_, i) => anoAtual - i)

const form = reactive({
  nome: '',
  email: '',
  dia: '',
  mes: '',
  ano: '',
  senha: '',
  confirma: ''
})

async function enviar() {
  if (form.senha !== form.confirma) {
    toast.mostrar('As senhas não coincidem.', 'error')
    return
  }

  if (form.senha.length < 8) {
    toast.mostrar(
      'A senha deve ter pelo menos 8 caracteres.',
      'error'
    )
    return
  }

  try {
    await authStore.cadastrar(form)

    toast.mostrar(
      'Cadastro realizado com sucesso!',
      'success'
    )

    router.push('/login')

  } catch (error) {
    const dados = error.response?.data

    let mensagem = 'Não foi possível realizar o cadastro.'

    if (dados?.email) {
      mensagem = 'Este e-mail já está cadastrado.'
    } else if (dados?.password) {
      mensagem = 'A senha informada não é válida.'
    } else if (dados?.detail) {
      mensagem = dados.detail
    }

    toast.mostrar(mensagem, 'error')
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
