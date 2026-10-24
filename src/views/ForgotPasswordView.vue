<script setup>
import { ref } from 'vue'
import { requestPasswordReset } from '@/services/passwordReset'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const isSubmitting = ref(false)
const feedback = ref('')
const hasError = ref(false)

async function handleSubmit() {
  isSubmitting.value = true
  feedback.value = ''
  hasError.value = false

  try {
    await requestPasswordReset(email.value.trim())
    sessionStorage.setItem('passwordResetEmail', email.value.trim())
    await router.push({ name: 'verificacao-codigo' })
    feedback.value =
      'Se existir uma conta associada a esse e-mail, enviaremos as instruções de recuperação.'
  } catch {
    hasError.value = true
    feedback.value = 'Não foi possível processar a solicitação agora. Tente novamente em instantes.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="auth-view auth-view--recovery">
    <section class="form-side">
      <div>
        <h1 class="form-title">Recuperação</h1>
        <p class="description">
          Essa conta está vinculada a um e-mail. Confirme o seu email
          no campo abaixo para receber um código de recuperação:
        </p>

        <form class="form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="email">E-mail</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            name="email"
            autocomplete="email"
            placeholder="digite seu e-mail aqui"
            required
            :disabled="isSubmitting"
          />
          </div>


          <button type="submit" :disabled="isSubmitting" class="btn">
            {{ isSubmitting ? 'Continuando...' : 'Continuar' }}

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

        <RouterLink class="back-link" to="/">Voltar ao início</RouterLink>
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
  padding: 16px 24px;
}

</style>
