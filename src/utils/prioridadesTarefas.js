export const OPCOES_PRIORIDADE = [
  { value: 'todas', label: 'Todas as prioridades' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
]

export function normalizarPrioridade(prioridade) {
  return String(prioridade ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
