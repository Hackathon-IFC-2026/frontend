import api from '/services/api.js'

export async function requestPasswordReset(email) {
  const { data } = await api.post('/api/auth/password-reset/request/', { email })
  return data
}

export async function verifyPasswordResetCode(email, code) {
  const { data } = await api.post('/api/auth/password-reset/verify/', { email, code })
  return data
}

export async function resetPassword(email, code, newPassword, confirmPassword) {
  const { data } = await api.post('/api/auth/password-reset/confirm/', {
    email,
    code,
    new_password: newPassword,
    confirm_password: confirmPassword,
  })
  return data
}

function validationMessages(value) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(validationMessages)
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(validationMessages)
  }
  return []
}

export function getPasswordResetErrorMessage(error, fallback) {
  if (!error.response) {
    return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'
  }

  if (error.response.status === 429) {
    return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
  }

  if (error.response.status === 400) {
    const responseData = error.response.data
    const messages = validationMessages(responseData)

    if (responseData?.email) {
      return 'Informe um endereço de e-mail válido.'
    }

    if (messages.includes('Código inválido ou expirado.')) {
      return 'O código é inválido ou expirou. Confira e tente novamente.'
    }

    if (responseData?.code) {
      return 'O código deve conter exatamente seis dígitos.'
    }

    if (responseData?.confirm_password) {
      return 'As senhas não coincidem.'
    }

    if (messages.length) return messages.join(' ')
  }

  return fallback
}
