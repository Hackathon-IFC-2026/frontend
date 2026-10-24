import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { DEMO_PROJECTS, copiarDadosDemo } from '@/data/demoProjects'
import { MODO_DEMONSTRACAO, useTaskStore } from '@/stores/taskStore'
import {
  listarHistoricoDoProjeto,
  listarProjetosDoCriador,
  reatribuirTarefaHistorica,
  removerParticipanteDoProjeto,
  sairDoProjeto,
} from '@/services/projectHistoryService'

export const useProjectHistoryStore = defineStore('projectHistory', () => {
  const projetos = ref(copiarDadosDemo(DEMO_PROJECTS))
  const historico = ref([])
  const carregando = ref(false)
  const operacaoEmAndamento = ref(false)
  const erro = ref('')
  const sucesso = ref('')

  const historicoPorProjeto = computed(() => (projetoId) =>
    historico.value.filter((registro) => String(registro.projetoId) === String(projetoId)),
  )

  function participantesDoProjeto(projetoId) {
    return projetos.value.find(
      (projeto) => String(projeto.id) === String(projetoId),
    )?.participants || []
  }

  function projetoPorId(projetoId) {
    return projetos.value.find(
      (projeto) => String(projeto.id) === String(projetoId),
    )
  }

  function exigirCriador(projetoId, usuarioId) {
    const projeto = projetoPorId(projetoId)
    if (!projeto) throw new Error('Projeto não encontrado.')
    if (String(projeto.creatorId) !== String(usuarioId)) {
      throw new Error('Somente o criador do projeto pode realizar esta ação.')
    }
    return projeto
  }

  function setErro(error, padrao) {
    erro.value = error?.message || padrao
  }

  async function listarProjetosDoUsuario(usuarioId) {
    erro.value = ''
    carregando.value = true
    try {
      if (MODO_DEMONSTRACAO) {
        return projetos.value
          .filter((projeto) => String(projeto.creatorId) === String(usuarioId))
          .map(({ participants, ...projeto }) => copiarDadosDemo(projeto))
      }
      return await listarProjetosDoCriador(usuarioId)
    } catch (error) {
      setErro(error, 'Não foi possível carregar os projetos do histórico.')
      throw error
    } finally {
      carregando.value = false
    }
  }

  async function listarHistoricoProjeto(projetoId, usuarioId) {
    exigirCriador(projetoId, usuarioId)
    erro.value = ''
    carregando.value = true
    try {
      if (MODO_DEMONSTRACAO) return historicoPorProjeto.value(projetoId)
      return await listarHistoricoDoProjeto(projetoId)
    } catch (error) {
      setErro(error, 'Não foi possível carregar o histórico deste projeto.')
      throw error
    } finally {
      carregando.value = false
    }
  }

  async function arquivarTarefasDoUsuario(projetoId, usuarioId, autorId, motivo) {
    const taskStore = useTaskStore()
    const tarefasPendentes = taskStore.tarefas.filter((tarefa) =>
      String(tarefa.projeto) === String(projetoId) &&
      tarefa.status !== 'concluido' &&
      (tarefa.responsaveis || []).some((responsavel) =>
        String(
          typeof responsavel === 'object' && responsavel !== null
            ? responsavel.id
            : responsavel,
        ) === String(usuarioId),
      ),
    )
    const tarefasNovasNoHistorico = tarefasPendentes.filter((tarefa) =>
      !historico.value.some((registro) =>
        String(registro.projetoId) === String(projetoId) &&
        String(registro.tarefa.id) === String(tarefa.id),
      ),
    )

    const removidas = taskStore.arquivarTarefas(
      projetoId,
      tarefasPendentes.map((tarefa) => tarefa.id),
    )
    const usuario = participantesDoProjeto(projetoId).find(
      (participante) => String(participante.id) === String(usuarioId),
    )

    const idsNovas = new Set(tarefasNovasNoHistorico.map((tarefa) => String(tarefa.id)))
    historico.value.push(...removidas.filter((tarefa) => idsNovas.has(String(tarefa.id))).map((tarefa) => ({
      id: `${projetoId}:${tarefa.id}`,
      projetoId,
      tarefa: copiarDadosDemo(tarefa),
      responsavelAnterior: copiarDadosDemo(usuario || { id: usuarioId, nome: 'Participante' }),
      removidoPor: autorId,
      motivo,
      arquivadaEm: new Date().toISOString(),
    })))

    return removidas.length
  }

  async function removerParticipante(projetoId, participanteId, autorId) {
    erro.value = ''
    sucesso.value = ''
    operacaoEmAndamento.value = true
    try {
      const projeto = exigirCriador(projetoId, autorId)
      if (String(projeto.creatorId) === String(participanteId)) {
        throw new Error('O criador não pode remover a si mesmo do projeto.')
      }

      const indice = projeto.participants.findIndex(
        (participante) => String(participante.id) === String(participanteId),
      )
      if (indice === -1) throw new Error('Esse usuário não participa do projeto.')

      if (MODO_DEMONSTRACAO) {
        const participante = projeto.participants[indice]
        const tarefasArquivadas = await arquivarTarefasDoUsuario(
          projetoId,
          participanteId,
          autorId,
          'removido pelo criador',
        )
        projeto.participants.splice(indice, 1)
        sucesso.value = `${participante.nome} foi removido(a). ${tarefasArquivadas} tarefa(s) pendente(s) encaminhada(s) ao histórico do projeto.`
        return { tarefasArquivadas }
      }

      return await removerParticipanteDoProjeto(projetoId, participanteId)
    } catch (error) {
      setErro(error, 'Não foi possível remover o participante.')
      throw error
    } finally {
      operacaoEmAndamento.value = false
    }
  }

  async function sairDoProjetoAtual(projetoId, usuarioId) {
    erro.value = ''
    sucesso.value = ''
    operacaoEmAndamento.value = true
    try {
      const projeto = projetoPorId(projetoId)
      if (!projeto) throw new Error('Projeto não encontrado.')
      if (String(projeto.creatorId) === String(usuarioId)) {
        throw new Error('O criador não pode sair do projeto sem transferir sua responsabilidade.')
      }

      const indice = projeto.participants.findIndex(
        (participante) => String(participante.id) === String(usuarioId),
      )
      if (indice === -1) throw new Error('Você não participa deste projeto.')

      if (MODO_DEMONSTRACAO) {
        const tarefasArquivadas = await arquivarTarefasDoUsuario(
          projetoId,
          usuarioId,
          usuarioId,
          'usuário saiu do projeto',
        )
        projeto.participants.splice(indice, 1)
        sucesso.value = `Você saiu do projeto. ${tarefasArquivadas} tarefa(s) pendente(s) encaminhada(s) ao histórico do projeto.`
        return { tarefasArquivadas }
      }

      return await sairDoProjeto(projetoId)
    } catch (error) {
      setErro(error, 'Não foi possível sair do projeto.')
      throw error
    } finally {
      operacaoEmAndamento.value = false
    }
  }

  async function reatribuirTarefa(projetoId, historicoId, novoResponsavelId, autorId) {
    erro.value = ''
    sucesso.value = ''
    operacaoEmAndamento.value = true
    try {
      exigirCriador(projetoId, autorId)
      const registro = historico.value.find((item) =>
        item.id === historicoId &&
        String(item.projetoId) === String(projetoId),
      )
      if (!registro) throw new Error('A tarefa não está no histórico deste projeto.')

      const novoResponsavel = participantesDoProjeto(projetoId).find(
        (participante) => String(participante.id) === String(novoResponsavelId),
      )
      if (!novoResponsavel) {
        throw new Error('Selecione um participante atual deste projeto.')
      }

      if (MODO_DEMONSTRACAO) {
        const taskStore = useTaskStore()
        const idsAtuais = new Set(
          participantesDoProjeto(projetoId).map((participante) => String(participante.id)),
        )
        const responsaveisMantidos = (registro.tarefa.responsaveis || [])
          .map((responsavel) => typeof responsavel === 'object'
            ? responsavel
            : participantesDoProjeto(projetoId).find(
              (participante) => String(participante.id) === String(responsavel),
            ))
          .filter((responsavel) =>
            responsavel &&
            idsAtuais.has(String(responsavel.id)) &&
            String(responsavel.id) !== String(registro.responsavelAnterior.id),
          )
        const tarefaAtualizada = {
          ...copiarDadosDemo(registro.tarefa),
          responsaveis: [
            ...responsaveisMantidos,
            copiarDadosDemo(novoResponsavel),
          ],
        }

        taskStore.restaurarTarefaDoHistorico(tarefaAtualizada)
        historico.value = historico.value.filter((item) => item.id !== historicoId)
        sucesso.value = `A tarefa “${tarefaAtualizada.titulo}” voltou ao fluxo normal atribuída a ${novoResponsavel.nome}.`
        return tarefaAtualizada
      }

      return await reatribuirTarefaHistorica(
        projetoId,
        historicoId,
        novoResponsavelId,
      )
    } catch (error) {
      setErro(error, 'Não foi possível reatribuir a tarefa.')
      throw error
    } finally {
      operacaoEmAndamento.value = false
    }
  }

  function adicionarParticipante(projetoId, participante) {
    const projeto = projetoPorId(projetoId)
    if (!projeto) throw new Error('Projeto não encontrado.')
    if (projeto.participants.some((item) => String(item.id) === String(participante.id))) {
      throw new Error('Este usuário já participa do projeto.')
    }
    projeto.participants.push(copiarDadosDemo(participante))
  }

  function registrarProjeto(dadosProjeto) {
    const criador = dadosProjeto.criador || dadosProjeto.creator
    if (!dadosProjeto.id || !criador?.id) {
      throw new Error('O projeto precisa ter um ID e um criador identificado.')
    }

    const atual = projetoPorId(dadosProjeto.id)
    const creatorId = atual ? atual.creatorId : criador.id
    if (creatorId === null || String(creatorId) !== String(criador.id)) {
      throw new Error('Não é permitido alterar o criador do projeto.')
    }

    const participantes = (dadosProjeto.participantes || dadosProjeto.membros || [])
      .filter((participante) => participante?.id)
      .map((participante) => ({
        id: participante.id,
        nome: participante.nome || participante.name || participante.email || 'Participante',
      }))
    const listaParticipantes = new Map(
      participantes.map((participante) => [String(participante.id), participante]),
    )
    listaParticipantes.set(String(criador.id), {
      id: criador.id,
      nome: criador.nome || criador.name || criador.email || 'Criador',
    })

    const registro = {
      id: dadosProjeto.id,
      nome: dadosProjeto.nome || dadosProjeto.title || 'Projeto',
      descricao: dadosProjeto.descricao || '',
      creatorId,
      participants: [...listaParticipantes.values()],
    }

    if (atual) {
      Object.assign(atual, registro)
    } else {
      projetos.value.push(registro)
    }
  }

  return {
    projetos,
    historico,
    carregando,
    operacaoEmAndamento,
    erro,
    sucesso,
    historicoPorProjeto,
    participantesDoProjeto,
    projetoPorId,
    listarProjetosDoUsuario,
    listarHistoricoProjeto,
    removerParticipante,
    sairDoProjetoAtual,
    reatribuirTarefa,
    adicionarParticipante,
    registrarProjeto,
  }
})
