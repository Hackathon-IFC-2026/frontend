import api from './api'

export async function listarPaginas(url, params = {}) {
  const items = []
  const visited = new Set()
  const base = new URL(api.defaults.baseURL)
  while (url) {
    const target = new URL(url, base)
    for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null) target.searchParams.set(key, value)
    if (target.origin !== base.origin || visited.has(target.href)) throw new Error('Paginação inválida retornada pela API.')
    visited.add(target.href)
    const { data } = await api.get(target.pathname + target.search)
    const page = Array.isArray(data) ? data : data?.results
    if (!Array.isArray(page)) throw new Error('Lista inválida retornada pela API.')
    items.push(...page)
    url = Array.isArray(data) ? null : data.next
    if (!url && Number(data?.page) < Number(data?.total_pages)) {
      target.searchParams.set('page', Number(data.page) + 1)
      url = target.href
    }
    params = {}
  }
  return items
}

export function mensagemErro(error, padrao = 'Não foi possível concluir a operação.') {
  const data = error.response?.data
  if (typeof data?.detail === 'string') return data.detail
  if (typeof data === 'object' && data) {
    const [field, value] = Object.entries(data)[0] || []
    if (field) return (field === 'non_field_errors' ? '' : field + ': ') + (Array.isArray(value) ? value.join(' ') : String(value))
  }
  if (!error.response && error.isAxiosError) return 'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.'
  return error.message || padrao
}
