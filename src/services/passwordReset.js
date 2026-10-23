import api from '/services/api.js'

export async function requestPasswordReset(email) {
  await api.post('/api/auth/password-reset/request/', { email })
}

export async function verifyPasswordResetCode(email, code) {
  await api.post('/api/auth/password-reset/verify/', { email, code })
}


export async function resetPassword(email, code, newPassword, confirmPassword) {
  await api.post('/api/auth/password-reset/confirm/', {
    email,
    code,
    new_password: newPassword,
    confirm_password: confirmPassword,
  })
}
