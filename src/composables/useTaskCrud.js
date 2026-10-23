import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'

export function useTaskCrud() {
  const route = useRoute()
  const store = useTaskStore()
  const projetoId = computed(() => Number(route.params.id || 1))

  // Dados temporários até integrar
  const usuarioAtual = ref({ id: 1, nome: 'Ana' })
  const isAdmin = ref(true)

  const projetos = {
    1: { nome: 'Natal Luz', descricao: 'Organização das atividades e entregas do projeto.' },
    2: { nome: 'Reforma Praça Central', descricao: 'Planejamento e execução das melhorias.' }
  }

  const projeto = computed(() => projetos[projetoId.value] || {
    nome: 'Projeto Kando',
    descricao: 'Gerenciamento colaborativo de tarefas.'
  })

  const participantes = ref([
    { id: 1, nome: 'Ana' },
    { id: 2, nome: 'Julia' },
    { id: 3, nome: 'Amanda' },
    { id: 4, nome: 'Anna' }
  ])

  const colunas = [
    { id: 'atrasado', nome: 'Atrasado', classe: 'coluna-atrasado' },
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
    return tarefasFiltradas.value.filter(tarefa => colunaId === 'atrasado'
      ? estaAtrasada(tarefa)
      : tarefa.status === colunaId && !estaAtrasada(tarefa))
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
      .some(p => Number(p.id) === Number(usuarioAtual.value.id))
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
    if (id === null || colunaId === 'atrasado') return

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
    participantes.value.push({ id: Date.now(), nome })
    novoParticipante.value = ''
    modalParticipanteAberto.value = false
  }

  watch(projetoId, async id => {
    tarefaSelecionada.value = null
    erro.value = ''
    try {
      await store.listarTarefas(id)
    } catch {
      erro.value = 'Não foi possível carregar as tarefas.'
    }
  }, { immediate: true })

  return {
    projetoId,
    usuarioAtual,
    isAdmin,
    projetos,
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
    adicionarParticipante
  }
}
