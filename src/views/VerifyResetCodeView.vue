<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getPasswordResetErrorMessage,
  requestPasswordReset,
  verifyPasswordResetCode,
} from '@/services/passwordReset'

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
    return
  }

  if (sessionStorage.getItem('passwordResetRequestAccepted')) {
    sessionStorage.removeItem('passwordResetRequestAccepted')
    feedback.value =
      'Se existir uma conta associada a esse e-mail, enviaremos as instruções de recuperação.'
  }
})

async function handleSubmit() {
  if (isSubmitting.value || isVerified.value) return

  feedback.value = ''
  hasError.value = false

  if (code.value.length !== 6) {
    hasError.value = true
    feedback.value = 'Digite os seis números do código.'
    return
  }

  isSubmitting.value = true

  try {
    await verifyPasswordResetCode(email, code.value)
    sessionStorage.setItem('passwordResetCode', code.value)
    isVerified.value = true
    await router.push({ name: 'nova-senha' })
  } catch (error) {
    hasError.value = true
    feedback.value = getPasswordResetErrorMessage(
      error,
      'Não foi possível verificar o código agora. Tente novamente em instantes.',
    )
  } finally {
    isSubmitting.value = false
  }
}

async function handleResend() {
  if (isResending.value || isSubmitting.value) return

  isResending.value = true
  feedback.value = ''
  hasError.value = false

  try {
    sessionStorage.removeItem('passwordResetCode')
    await requestPasswordReset(email)
    digits.value = Array(6).fill('')
    feedback.value = 'Se existir uma conta associada a esse e-mail, enviaremos um novo código.'
  } catch (error) {
    hasError.value = true
    feedback.value = getPasswordResetErrorMessage(
      error,
      'Não foi possível solicitar outro código agora. Tente novamente em instantes.',
    )
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

function handlePaste(event, index) {
  const pastedCode = event.clipboardData.getData('text').replace(/\D/g, '')
  if (!pastedCode) return

  event.preventDefault()
  const availableDigits = 6 - index
  const codeToInsert = pastedCode.slice(0, availableDigits)

  for (let offset = 0; offset < codeToInsert.length; offset += 1) {
    digits.value[index + offset] = codeToInsert[offset]
  }

  const focusIndex = Math.min(index + codeToInsert.length, 5)
  event.target.parentElement.children[focusIndex]?.focus()
}
</script>

<template>
  <main class="auth-view auth-view--recovery">
    <section class="verify-panel" aria-labelledby="verify-title">
      <h1 id="verify-title" class="form-title">Código de Recuperação</h1>

      <p class="description">
        Insira o código enviado para <strong>{{ email }}</strong>:
      </p>

      <form class="form" @submit.prevent="handleSubmit">
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
            required
            :disabled="isSubmitting || isVerified"
            @input="handleInput($event, index)"
            @keydown.backspace="handleBackspace($event, index)"
            @paste="handlePaste($event, index)"
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

.auth-view--recovery {
  align-items: flex-start;
}

.description{
  margin: 20px auto;
  text-align: center;
}

.btn {
  padding: 16px 10px;
  margin: 10px 0 0 0;
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
