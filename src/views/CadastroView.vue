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
        <fieldset class="field nascimento-field">
          <legend>Data de nascimento</legend>
          <div class="date-row">
            <select id="nascimento-dia" v-model="nascimento.dia" aria-label="Dia de nascimento" autocomplete="bday-day" required>
              <option value="" disabled>Dia</option>
              <option v-for="dia in diasDisponiveis" :key="dia" :value="String(dia).padStart(2, '0')">{{ String(dia).padStart(2, '0') }}</option>
            </select>
            <select id="nascimento-mes" v-model="nascimento.mes" aria-label="Mês de nascimento" autocomplete="bday-month" required>
              <option value="" disabled>Mês</option>
              <option v-for="(mes, indice) in meses" :key="mes" :value="String(indice + 1).padStart(2, '0')">{{ mes }}</option>
            </select>
            <select id="nascimento-ano" v-model="nascimento.ano" aria-label="Ano de nascimento" autocomplete="bday-year" required>
              <option value="" disabled>Ano</option>
              <option v-for="ano in anos" :key="ano" :value="String(ano)">{{ ano }}</option>
            </select>
          </div>
        </fieldset>
        <div class="field">
          <label for="senha">Senha</label>
          <PasswordInput id="senha" v-model="form.senha" placeholder="Digite sua senha aqui" autocomplete="new-password" required />
        </div>

        <div class="field">
          <label for="confirma">Confirme sua senha</label>
          <PasswordInput id="confirma" v-model="form.confirma" placeholder="Confirme sua senha aqui" autocomplete="new-password" required />
        </div>

        <button type="submit" class="btn" :disabled="authStore.carregando">{{ authStore.carregando ? 'Cadastrando...' : 'Continuar' }}</button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import PasswordInput from '../components/shared/PasswordInput.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '../stores/toast'

const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const nascimento = reactive({ dia: '', mes: '', ano: '' })
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const anoAtual = Number(hoje.slice(0, 4))
const anos = Array.from({ length: anoAtual - 1900 + 1 }, (_, indice) => anoAtual - indice)
const diasDisponiveis = computed(() => nascimento.mes && nascimento.ano ? new Date(Number(nascimento.ano), Number(nascimento.mes), 0).getDate() : 31)
const dataNascimento = computed(() => nascimento.dia && nascimento.mes && nascimento.ano ? nascimento.ano + '-' + nascimento.mes + '-' + nascimento.dia : '')
watch(diasDisponiveis, limite => { if (Number(nascimento.dia) > limite) nascimento.dia = '' })
const toast = useToastStore()
const router = useRouter()
const authStore = useAuthStore()



const form = reactive({
  nome: '',
  email: '',
  senha: '',
  confirma: ''
})

async function enviar() {
  if (authStore.carregando) return
  if (!dataNascimento.value || Number(nascimento.dia) > diasDisponiveis.value || dataNascimento.value > hoje) { toast.mostrar('Informe uma data de nascimento válida, sem datas futuras.', 'error'); return }
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
    await authStore.cadastrar({ ...form, data_nascimento: dataNascimento.value })

    toast.mostrar(
      'Cadastro realizado com sucesso!',
      'success'
    )

    router.push('/login')

  } catch (error) {
    const dados = error.response?.data

    let mensagem = authStore.erro || 'Não foi possível realizar o cadastro.'

    if (dados?.email) {
      mensagem = dados.email.join ? dados.email.join(' ') : String(dados.email)
    } else if (dados?.password) {
      mensagem = dados.password.join ? dados.password.join(' ') : String(dados.password)
    } else if (dados?.detail) {
      mensagem = dados.detail
    }

    toast.mostrar(mensagem, 'error')
  }
}
</script>

<style scoped>
.nascimento-field { min-width: 0; padding: 0; margin: 0; border: 0; }
.nascimento-field legend { padding: 0; margin-bottom: 6px; font-weight: 600; font-size: 1.125rem; line-height: 1.5; }
.nascimento-field .date-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.nascimento-field select { min-width: 0; padding-left: 14px; padding-right: 28px; background-position: right 10px center; }
@media (max-width: 400px) { .nascimento-field select { font-size: 14px; padding-left: 12px; } }

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
