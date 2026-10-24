import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/auth'
import { useProjectHistoryStore } from '@/stores/projectHistory'

export function useTaskCrud() {
  const route = useRoute()
  const store = useTaskStore()
  const authStore = useAuthStore()
  const projectHistoryStore = useProjectHistoryStore()
  const projetoId = computed(() => Number(route.params.id || 1))

  const usuarioAtual = computed(() => authStore.usuario)
  const projeto = computed(() => projectHistoryStore.projetoPorId(projetoId.value) || {
    nome: 'Projeto Kando',
    descricao: 'Gerenciamento colaborativo de tarefas.'
  })

  const creatorId = computed(() =>
    projectHistoryStore.projetoPorId(projetoId.value)?.creatorId ?? null,
  )
  const isAdmin = computed(() =>
    Boolean(
      usuarioAtual.value?.id &&
      creatorId.value !== null &&
      String(usuarioAtual.value.id) === String(creatorId.value),
    ),
  )
  const participantes = computed(() =>
    projectHistoryStore.participantesDoProjeto(projetoId.value),
  )
  const isMember = computed(() =>
    participantes.value.some(
      (participante) => String(participante.id) === String(usuarioAtual.value?.id),
    ),
  )

  const colunas = [
    { id: 'a_fazer', nome: 'A fazer', classe: 'coluna-fazer' },
    { id: 'em_andamento', nome: 'Em andamento', classe: 'coluna-andamento' },
    { id: 'concluido', nome: 'Concluído', classe: 'coluna-concluido' }
  ]

  const tarefas = computed(() => store.tarefas.filter(
    tarefa => Number(tarefa.projeto) === projetoId.value
  ))

  const busca = ref('')
  const filtroPrioridade = ref('todas')
  const filtroParticipante = ref('todos')
  const erro = ref('')
  const modalCadastroAberto = ref(false)
  const modalParticipanteAberto = ref(false)
  const tarefaSelecionada = ref(null)
  const statusInicial = ref('a_fazer')
  const novoParticipante = ref('')
  const colunaSobreposta = ref(null)
  const tarefaArrastadaId = ref(null)

  onMounted(async () => {
    if (authStore.usuario?.id || !localStorage.getItem('access_token')) return

    try {
      await authStore.buscarUsuario()
    } catch (error) {
      projectHistoryStore.erro =
        error.response?.data?.detail || 'Não foi possível identificar o usuário atual.'
    }
  })

  function responsaveisDaTarefa(tarefa) {
    return (tarefa.responsaveis || []).map(pessoa => {
      if (typeof pessoa === 'object' && pessoa !== null) return pessoa
      return participantes.value.find(p => Number(p.id) === Number(pessoa))
    }).filter(Boolean)
  }

  function dataHoje() {
    const agora = new Date()
    const ano = agora.getFullYear()
    const mes = String(agora.getMonth() + 1).padStart(2, '0')
    const dia = String(agora.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  function estaAtrasada(tarefa) {
    return Boolean(tarefa.prazo && tarefa.prazo.slice(0, 10) < dataHoje() && tarefa.status !== 'concluido')
  }

  const tarefasAtrasadas = computed(() => tarefas.value.filter(estaAtrasada))

  function contarStatus(status) {
    return tarefas.value.filter(tarefa => tarefa.status === status).length
  }

  const indicadores = computed(() => [
    { nome: 'Total de tarefas', valor: tarefas.value.length },
    { nome: 'Em andamento', valor: contarStatus('em_andamento') },
    { nome: 'Concluídas', valor: contarStatus('concluido') },
    { nome: 'Atrasadas', valor: tarefasAtrasadas.value.length }
  ])

  const tarefasFiltradas = computed(() => tarefas.value.filter(tarefa => {
    const texto = `${tarefa.titulo} ${tarefa.descricao || ''}`.toLowerCase()
    const buscaOk = texto.includes(busca.value.trim().toLowerCase())
    const prioridadeOk = filtroPrioridade.value === 'todas' || tarefa.prioridade === filtroPrioridade.value
    const participanteOk = filtroParticipante.value === 'todos' || responsaveisDaTarefa(tarefa)
      .some(p => String(p.id) === filtroParticipante.value)
    return buscaOk && prioridadeOk && participanteOk
  }))

  function tarefasDaColuna(colunaId) {
    return tarefasFiltradas.value.filter(tarefa => tarefa.status === colunaId)
  }

  function prioridadeLabel(prioridade) {
    return { alta: 'Alta', media: 'Média', baixa: 'Baixa' }[prioridade] || prioridade
  }

  function formatarPrazo(data) {
    const [ano, mes, dia] = data.slice(0, 10).split('-')
    return `${dia}/${mes}/${ano}`
  }

  function podeGerenciar(tarefa) {
    return isAdmin.value || responsaveisDaTarefa(tarefa)
      .some(p => Number(p.id) === Number(usuarioAtual.value?.id))
  }

  function abrirCadastro(status = 'a_fazer') {
    statusInicial.value = status
    modalCadastroAberto.value = true
  }

  function abrirDetalhes(id) {
    tarefaSelecionada.value = Number(id)
  }

  async function atualizarQuadro() {
    try {
      await store.listarTarefas(projetoId.value)
    } catch {
      erro.value = 'Não foi possível atualizar o quadro.'
    }
  }

  function iniciarArrasto(event, tarefa) {
    if (!podeGerenciar(tarefa)) return event.preventDefault()
    tarefaArrastadaId.value = tarefa.id
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(tarefa.id))
  }

  function finalizarArrasto() {
    tarefaArrastadaId.value = null
    colunaSobreposta.value = null
  }

  function sairDaColuna(event, colunaId) {
    if (!event.currentTarget.contains(event.relatedTarget) && colunaSobreposta.value === colunaId) {
      colunaSobreposta.value = null
    }
  }

  async function soltarTarefa(event, colunaId) {
    const id = tarefaArrastadaId.value
    finalizarArrasto()
    if (id === null) return

    const tarefa = tarefas.value.find(item => Number(item.id) === Number(id))
    if (!tarefa || !podeGerenciar(tarefa) || tarefa.status === colunaId) return

    try {
      await store.atualizarTarefa(id, { status: colunaId })
    } catch {
      erro.value = 'Não foi possível mover a tarefa.'
    }
  }

  function adicionarParticipante() {
    const nome = novoParticipante.value.trim()
    if (!nome) return
    try {
      projectHistoryStore.adicionarParticipante(projetoId.value, {
        id: Date.now(),
        nome,
      })
    } catch (error) {
      projectHistoryStore.erro = error.message || 'Não foi possível adicionar o participante.'
      return
    }
    novoParticipante.value = ''
    modalParticipanteAberto.value = false
  }

  async function removerParticipante(participante) {
    if (!isAdmin.value) {
      projectHistoryStore.erro = 'Somente o criador pode remover participantes.'
      return
    }

    const confirmado = window.confirm(
      `Remover ${participante.nome} do projeto? As tarefas pendentes atribuídas a essa pessoa serão encaminhadas ao histórico deste projeto; tarefas concluídas serão preservadas.`,
    )
    if (!confirmado) return

    try {
      await projectHistoryStore.removerParticipante(
        projetoId.value,
        participante.id,
        usuarioAtual.value.id,
      )
    } catch (error) {
      projectHistoryStore.erro = error.message ||
        'Não foi possível remover o participante.'
    }
  }

  async function sairDoProjeto() {
    if (isAdmin.value) {
      projectHistoryStore.erro =
        'O criador não pode sair do projeto sem transferir sua responsabilidade.'
      return
    }
    if (!isMember.value) {
      projectHistoryStore.erro = 'Você não participa deste projeto.'
      return
    }

    const confirmado = window.confirm(
      'Sair deste projeto? Suas tarefas pendentes serão encaminhadas ao histórico do projeto. Tarefas concluídas serão preservadas.',
    )
    if (!confirmado) return

    try {
      await projectHistoryStore.sairDoProjetoAtual(
        projetoId.value,
        usuarioAtual.value.id,
      )
    } catch (error) {
      projectHistoryStore.erro = error.message || 'Não foi possível sair do projeto.'
    }
  }

  watch([projetoId, isMember], async ([id, temAcesso]) => {
    if (!route.query.tarefa) {
      tarefaSelecionada.value = null
    }
    erro.value = ''
    if (!temAcesso) return
    try {
      await store.listarTarefas(id)
      if (route.query.tarefa) {
        tarefaSelecionada.value = Number(route.query.tarefa)
      }
    } catch {
      erro.value = 'Não foi possível carregar as tarefas.'
    }
  }, { immediate: true })

  watch(() => route.query.tarefa, (tarefaId) => {
    if (tarefaId) {
      tarefaSelecionada.value = Number(tarefaId)
    }
  })

  return {
    projetoId,
    usuarioAtual,
    isAdmin,
    creatorId,
    isMember,
    projeto,
    participantes,
    colunas,
    tarefas,
    busca,
    filtroPrioridade,
    filtroParticipante,
    erro,
    modalCadastroAberto,
    modalParticipanteAberto,
    tarefaSelecionada,
    statusInicial,
    novoParticipante,
    colunaSobreposta,
    tarefaArrastadaId,
    responsaveisDaTarefa,
    dataHoje,
    estaAtrasada,
    tarefasAtrasadas,
    indicadores,
    tarefasFiltradas,
    tarefasDaColuna,
    contarStatus,
    prioridadeLabel,
    formatarPrazo,
    podeGerenciar,
    abrirCadastro,
    abrirDetalhes,
    atualizarQuadro,
    iniciarArrasto,
    finalizarArrasto,
    sairDaColuna,
    soltarTarefa,
    adicionarParticipante,
    removerParticipante,
    sairDoProjeto,
    projectHistoryStore
  }
}
