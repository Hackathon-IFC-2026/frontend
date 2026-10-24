function operacaoIndisponivel(nome) {
  throw new Error(
    `A API ainda não oferece suporte para ${nome}. A operação não foi enviada ao servidor.`,
  )
}

export async function listarProjetosDoCriador() {
  return operacaoIndisponivel('listar projetos criados pelo usuário')
}

export async function listarHistoricoDoProjeto() {
  return operacaoIndisponivel('consultar o histórico do projeto')
}

export async function removerParticipanteDoProjeto() {
  return operacaoIndisponivel('remover participante e arquivar tarefas pendentes')
}

export async function sairDoProjeto() {
  return operacaoIndisponivel('sair do projeto e arquivar tarefas pendentes')
}

export async function reatribuirTarefaHistorica() {
  return operacaoIndisponivel('reatribuir tarefa histórica')
}
