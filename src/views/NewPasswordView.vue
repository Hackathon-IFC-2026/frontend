<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getPasswordResetErrorMessage,
  resetPassword,
} from '@/services/passwordReset'

const router = useRouter()
const email = sessionStorage.getItem('passwordResetEmail') ?? ''
const code = sessionStorage.getItem('passwordResetCode') ?? ''
const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const isComplete = ref(false)
const feedback = ref('')
const hasError = ref(false)

onMounted(() => {
  if (!email || !code) {
    router.replace({ name: email ? 'verificacao-codigo' : 'recuperar-senha' })
  }
})

async function handleSubmit() {
  if (isSubmitting.value || isComplete.value) return

  feedback.value = ''
  hasError.value = false

  if (!password.value) {
    hasError.value = true
    feedback.value = 'Informe a nova senha.'
    return
  }
  if (password.value !== confirmPassword.value) {
    hasError.value = true
    feedback.value = 'Senhas diferentes. Tente novamente.'
    return
  }

  isSubmitting.value = true

  try {
    await resetPassword(email, code, password.value, confirmPassword.value)
    sessionStorage.removeItem('passwordResetEmail')
    sessionStorage.removeItem('passwordResetCode')
    sessionStorage.removeItem('passwordResetRequestAccepted')
    isComplete.value = true
    feedback.value = 'Senha alterada com sucesso.'
  } catch (error) {
    hasError.value = true
    feedback.value = getPasswordResetErrorMessage(
      error,
      'Não foi possível alterar a senha. Tente novamente.',
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="auth-view auth-view--recovery">
    <section class="form-side">
      <div>
        <h1 class="form-title">Nova Senha</h1>
        <template v-if="isComplete">
          <p class="description">{{ feedback }}</p>
          <RouterLink class="back-link" to="/login">Ir para o login</RouterLink>
        </template>

        <form v-else class="form" @submit.prevent="handleSubmit">
          <p class="description">
            Digite sua nova senha e confirme no campo abaixo.
          </p>
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

          <RouterLink class="back-link" to="/login">Voltar ao login</RouterLink>
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

.auth-view--recovery {
  align-items: flex-end;
}

.btn {
  padding: 20px 5px;
  width: min(100%, 290px);
  height: 52px;
}

</style>
