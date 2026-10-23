<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PASSWORD_RESET_TEST_CODE, verifyPasswordResetCode } from '@/services/passwordReset'

const router = useRouter()
const email = sessionStorage.getItem('passwordResetEmail') ?? ''
const isSubmitting = ref(false)
const isResending = ref(false)
const isVerified = ref(false)
const feedback = ref('')
const hasError = ref(false)

onMounted(() => {
  if (!email) {
    router.replace({ name: 'recuperar-senha' })
  }
})

async function handleSubmit() {
  isSubmitting.value = true
  feedback.value = ''
  hasError.value = false

  try {
    await verifyPasswordResetCode(email, code.value)
    isVerified.value = true
    feedback.value = 'Código confirmado. A próxima etapa será cadastrar uma nova senha.'
  } catch {
    hasError.value = true
    feedback.value = 'O código informado não é válido ou expirou. Confira e tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleResend() {
  isResending.value = true
  feedback.value = ''
  hasError.value = false

  try {
    const { requestPasswordReset } = await import('@/services/passwordReset')
    await requestPasswordReset(email)
    feedback.value = 'Se existir uma conta associada a esse e-mail, enviaremos um novo código.'
  } catch {
    hasError.value = true
    feedback.value = 'Não foi possível solicitar outro código agora. Tente novamente em instantes.'
  } finally {
    isResending.value = false
  }
}


const digits = ref(Array(6).fill(''))
const code = computed(() => digits.value.join(''))


function handleInput(event, index) {
  const input = event.target
  const value = input.value.replace(/\D/g, '').slice(-1)

  digits.value[index] = value
  input.value = value

  if (value && index < 5) {
    input.nextElementSibling?.focus()
  }
}

function handleBackspace(event, index) {
  if (!digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    event.target.previousElementSibling?.focus()
  }
}

// const response = await fetch('/api/auth/password-reset/verify', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({ email, code}),
// })

// if (!response.ok) {
//   throw new Error('O código é inválido ou expirou.')
// }

// const data = await response.json()
// return data.resetToken

// { "resetToken": "token-temporario" } o back está assim?

</script>

<template>
  <main class="auth-view">
    <section class="verify-panel" aria-labelledby="verify-title">
      <h1 class="form-title">Código de Recuperação</h1>

      <form class="form" @submit.prevent="handleSubmit">
      <p class="description">Insira o código enviado por email no campo abaixo:</p>

      <div class="verification-code">
        <input
          v-for="(_, index) in 6"
          :key="index"
          v-model="digits[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          pattern="[0-9]"
          :autocomplete="index === 0 ? 'one-time-code' : 'off'"
          :aria-label="`Dígito ${index + 1} do código`"
          aria-labelledby="verification-code-label"
          required
          :disabled="isSubmitting || isVerified"
          @input="handleInput($event, index)"
          @keydown.backspace="handleBackspace($event, index)"
        />
      </div>
        <p
          v-if="feedback"
          class="feedback"
          :class="{ 'feedback-error': hasError }"
          role="status"
          aria-live="polite"
        >
          {{ feedback }}
        </p>

        <button class="btn" type="submit" :disabled="isSubmitting || isVerified">
          {{
            isSubmitting ? 'Verificando...' : isVerified ? 'Confirmado' : 'Confirmar'
          }}
        </button>
      </form>
      <RouterLink class="back-link" to="/recuperar-senha">Voltar</RouterLink>


      <p v-if="PASSWORD_RESET_TEST_CODE" class="description">
        Modo de demonstração: use o código {{ PASSWORD_RESET_TEST_CODE }}.
      </p>

      <button
        class="back-link"
        type="button"
        :disabled="isResending || isSubmitting"
        @click="handleResend"
      >
        {{ isResending ? 'Solicitando novo código...' : 'Não recebeu? Enviar outro código' }}
      </button>
    </section>
  </main>
</template>

<style scoped>
main{
  display: flex;
  justify-content: flex-start;
  margin: 0 0 0 190px;
}

.auth-view {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 32px;
  padding: 40px 10px 40px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}

.auth-view > :first-child {
  margin-top: auto;
}
.auth-view > :last-child {
  margin-bottom: auto;
}

.description{
  margin: 20px auto;
}

.btn {
  padding: 16px 10px;
  margin: 10px 0 0 0;
}

.text-button,
.back-link {
  display: block;
  margin-top: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #315e3b;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  text-decoration: underline;
  text-underline-offset: 3px;
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
  color: #4E7855;
}

.verification-code {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.verification-code input {
  flex: 0 0 42px;
  width: 38px;
  height: 60px;
  padding: 0;
  box-sizing: border-box;
  border: 1px solid #a0aaa1;
  border-radius: 22px;
  background: transparent;
  color: #fff9e3;
  font-size: 25px;
  text-align: center;
  outline: none;
  box-shadow: none;

}

.verification-code input:focus {
  border-color: #fff9e3;
}



</style>
