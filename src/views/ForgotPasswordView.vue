<script>
import { defineComponent, ref } from 'vue'
import useAuthUser from 'src/composables/UseAuthUser' // Trocar
import useNotify from 'src/composables/UseNotify' // Trocar

export default defineComponent({
  setup () {
    const { sendPasswordResetEmail } = useAuthUser()
    const { notifyError, notifySuccess } = useNotify()

    const email = ref('')

    const handleForgotPassoword = async () => {
      try {
        await sendPasswordResetEmail(email.value)
        notifySuccess(`E-mail para redefinição de senha enviado para: ${email.value}`)
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      email,
      handleForgotPassoword
    }
  }
})
</script>

<template>
  <main>
    <form @submit.prevent="handleForgotPassoword">
      <h2> Redefinir Senha</h2>
      <p>Essa conta está vinculada ao e-mail xyz******@gmail.com.
        Confirme o seu email no campo abaixo para receber um código
        de recuperação:</p>

      <div>
        <input
        id="email"
        v-model="email"
        type="email"
        required
        placeholder="Digite seu email"
        />

        <div>
          <button class="button-send" type="submit">Enviar e-mail de recuperação</button>

          <button class="button-back" type="button">Voltar</button>
        </div>
      </div>
    </form>
  </main>
</template>


<style>
h2 {
  color:black
}
</style>
