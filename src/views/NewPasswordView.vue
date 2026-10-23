<script setup>
import {ref} from 'vue'
// import { useRouter } from 'vue-router'
//import { resetPassword } from '@/services/passwordReset'

// const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const  feedback = ref('')
const hasError = ref(false)

async function handleSubmit() {
  feedback.value = ''
  hasError.value = false


  if (password.value !== confirmPassword.value) {
    hasError.value = true
    feedback.value = 'Senhas diferentes. Tente novamente.'
    return
  }

  isSubmitting.value = true

  try {
    //await resetPassword(resetToken, password.value)
    feedback.value = 'Senha alterada com sucesso.'
  } catch {
    hasError.value = true
    feedback.value = 'Não foi possível alterar a senha. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>
  <main class="auth-view">
    <section class="form-side">
      <div>
        <h1 class="form-title">Nova Senha</h1>
        <p class="description">
          Digite sua nova senha e confirme no campo abaixo.
        </p>

        <form class="form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="password">Nova senha</label>
            <input
              id="password"
              v-model="password"
              type="password"
              name="password"
              autocomplete="new-password"
              required
              :disabled="isSubmitting"
              />
          </div>

          <div class="field">
            <label for="confirm-password">Confirmar nova senha</label>
            <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            name="confirmPassword"
            autocomplete="new-password"
            required
            :disabled="isSubmitting"
            />
          </div>

          <button class="btn" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Salvando...' : 'Salvar nova senha' }}
          </button>

          <p
            v-if="feedback"
            class="feedback"
            :class="{ 'feedback-error': hasError }"
            role="status"
            aria-live="polite"
            >
            {{ feedback }}
          </p>
        </form>
      </div>
    </section>
  </main>
</template>


<style scoped>
main{
  display: flex;
  justify-content: flex-end;
  margin: 0 16vw 0 0;

}
.description{
  margin: 40px 0;
}

.auth-view {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 32px;
  padding: 40px 10px 40px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}

.form-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 32px;
  max-width: 400px;
  width: 100%;
}

.auth-view > :first-child {
  margin-top: auto;
}
.auth-view > :last-child {
  margin-bottom: auto;
}

.btn {
  padding: 20px 5px;
  width: min(100%, 290px);
  height: 52px;
}

.back-link {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  font-size: 1rem;
  color: #fff9e3;
  text-decoration: none;
}

.back-link:hover {
  margin-top: 20px;
  color: #4E7855;
}
</style>

