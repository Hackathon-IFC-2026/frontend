const USE_MOCK = true
export const PASSWORD_RESET_TEST_CODE = '123456'

export async function requestPasswordReset(email) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return
  }

  const response = await fetch('/api/auth/password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error('A solicitação de recuperação falhou.')
  }
}

export async function verifyPasswordResetCode(email, code) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (code !== PASSWORD_RESET_TEST_CODE) {
      throw new Error('O código informado não é válido.')
    }

    return
  }


  const response = await fetch('/api/auth/password-reset/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  })

  if (!response.ok) {
    throw new Error('O código informado não é válido ou expirou.')
  }
}

export async function resetPassword(resetToken, password) {}

