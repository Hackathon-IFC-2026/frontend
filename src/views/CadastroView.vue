<template>
  <main class="auth-view auth-view--welcome-left">
    <section class="welcome">
      <h1>Olá, bem-vindo!</h1>
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
          <input id="senha" v-model="form.senha" type="password" placeholder="Digite sua senha aqui" autocomplete="new-password" required />
        </div>

        <div class="field">
          <label for="confirma">Confirme sua senha</label>
          <input id="confirma" v-model="form.confirma" type="password" placeholder="Confirme sua senha aqui" autocomplete="new-password" required />
        </div>

        <button type="submit" class="btn">Continuar</button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { reactive } from 'vue'

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 100 }, (_, i) => anoAtual - i)

const form = reactive({ nome: '', email: '', dia: '', mes: '', ano: '', senha: '', confirma: '' })

function enviar() {
  if (form.senha !== form.confirma) {
    alert('As senhas não coincidem.')
    return
  }
  console.log('cadastro', { ...form })
}
</script>
