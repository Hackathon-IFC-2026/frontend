export function tarefaAtrasada(tarefa, agora = Date.now()) {
  if (!tarefa?.prazo || tarefa.status === 'concluido') return false
  const original = tarefa.prazo_em || tarefa.prazo
  const limite = /^\d{4}-\d{2}-\d{2}$/.test(original) ? original + 'T23:59:59-03:00' : original
  return new Date(limite).getTime() < Number(agora)
}
