export function podeEditarTarefa(tarefa, usuarioId, proprietario = false) {
  if (!usuarioId || !tarefa) return false
  if (typeof tarefa.permissions?.can_edit === 'boolean') return tarefa.permissions.can_edit
  return proprietario || (tarefa.responsaveis || []).some(p => Number(p.id ?? p) === Number(usuarioId))
}
export function podeExcluirTarefa(tarefa, usuarioId, proprietario = false) {
  if (!usuarioId || !tarefa) return false
  return tarefa.permissions?.can_delete ?? podeEditarTarefa(tarefa, usuarioId, proprietario)
}
