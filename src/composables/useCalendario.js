import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'

export function useCalendario() {
  const router = useRouter()
  const store = useTaskStore()

  const hoje = new Date()
  const mesAtual = ref(hoje.getMonth())
  const anoAtual = ref(hoje.getFullYear())

  const busca = ref('')
  const filtroProjeto = ref('todos')
  const filtroStatus = ref('todos')
  const filtroPrioridade = ref('todas')
  const filtroParticipante = ref('todos')

  const projetos = [
    { id: 1, nome: 'Natal Luz' },
    { id: 2, nome: 'Reforma Praça Central' }
  ]

  const participantes = [
    { id: 1, nome: 'Ana' },
    { id: 2, nome: 'Julia' },
    { id: 3, nome: 'Amanda' },
    { id: 4, nome: 'Anna' }
  ]

  const nomeProjetoAtivo = computed(() => {
    if (filtroProjeto.value === 'todos') {
      return 'Natal Luz' // padrão do projeto
    }
    const p = projetos.find(item => String(item.id) === String(filtroProjeto.value))
    return p ? p.nome : 'Natal Luz'
  })

  onMounted(async () => {
    try {
      await store.listarTarefas(1)
    } catch {
      // memória da store
    }
  })

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const nomeMesAno = computed(() => {
    return `${mesesNomes[mesAtual.value]} ${anoAtual.value}`
  })

  function mesAnterior() {
    if (mesAtual.value === 0) {
      mesAtual.value = 11
      anoAtual.value -= 1
    } else {
      mesAtual.value -= 1
    }
  }

  function mesSeguinte() {
    if (mesAtual.value === 11) {
      mesAtual.value = 0
      anoAtual.value += 1
    } else {
      mesAtual.value += 1
    }
  }

  function irParaHoje() {
    const agora = new Date()
    mesAtual.value = agora.getMonth()
    anoAtual.value = agora.getFullYear()
  }

  function responsaveisDaTarefa(tarefa) {
    return (tarefa.responsaveis || []).map(pessoa => {
      if (typeof pessoa === 'object' && pessoa !== null) return pessoa
      return participantes.find(p => Number(p.id) === Number(pessoa))
    }).filter(Boolean)
  }

  function dataHojeFormatada() {
    const agora = new Date()
    const ano = agora.getFullYear()
    const mes = String(agora.getMonth() + 1).padStart(2, '0')
    const dia = String(agora.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  function estaAtrasada(tarefa) {
    return Boolean(
      tarefa.prazo &&
      tarefa.prazo.slice(0, 10) < dataHojeFormatada() &&
      tarefa.status !== 'concluido'
    )
  }

  const tarefasFiltradas = computed(() => {
    return store.tarefas.filter(tarefa => {
      if (filtroProjeto.value !== 'todos') {
        if (Number(tarefa.projeto) !== Number(filtroProjeto.value)) return false
      }

      if (busca.value.trim()) {
        const termo = busca.value.trim().toLowerCase()
        const texto = `${tarefa.titulo} ${tarefa.descricao || ''}`.toLowerCase()
        if (!texto.includes(termo)) return false
      }

      if (filtroStatus.value !== 'todos') {
        if (tarefa.status !== filtroStatus.value) return false
      }

      if (filtroPrioridade.value !== 'todas') {
        if (tarefa.prioridade !== filtroPrioridade.value) return false
      }

      if (filtroParticipante.value !== 'todos') {
        const resp = responsaveisDaTarefa(tarefa)
        const temResp = resp.some(p => String(p.id) === String(filtroParticipante.value))
        if (!temResp) return false
      }

      return true
    })
  })

  const indicadores = computed(() => {
    const lista = store.tarefas.filter(t => {
      if (filtroProjeto.value !== 'todos') {
        return Number(t.projeto) === Number(filtroProjeto.value)
      }
      return true
    })

    const emAndamento = lista.filter(t => t.status === 'em_andamento').length
    const concluidas = lista.filter(t => t.status === 'concluido').length
    const atrasadas = lista.filter(estaAtrasada).length

    return [
      {
        id: 'total',
        nome: 'Total de tarefas',
        valor: lista.length,
        icone: 'layers',
        classe: 'indicador-total'
      },
      {
        id: 'andamento',
        nome: 'Em andamento',
        valor: emAndamento,
        icone: 'schedule',
        classe: 'indicador-andamento'
      },
      {
        id: 'concluidas',
        nome: 'Concluídas',
        valor: concluidas,
        icone: 'check_circle',
        classe: 'indicador-concluido'
      },
      {
        id: 'atrasadas',
        nome: 'Atrasadas',
        valor: atrasadas,
        icone: 'error_outline',
        classe: 'indicador-atrasado'
      }
    ]
  })

  const totalTarefasNoMes = computed(() => {
    const mesStr = String(mesAtual.value + 1).padStart(2, '0')
    const prefixo = `${anoAtual.value}-${mesStr}`
    return tarefasFiltradas.value.filter(t => t.prazo && t.prazo.startsWith(prefixo)).length
  })

  const diasDoMes = computed(() => {
    const ano = anoAtual.value
    const mes = mesAtual.value

    const primeiroDiaMes = new Date(ano, mes, 1)
    const diaSemanaInicio = primeiroDiaMes.getDay() // 0 = Domingo

    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate()
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate()

    const hojeStr = dataHojeFormatada()
    const dias = []

    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const numDia = ultimoDiaMesAnterior - i
      const mesAnt = mes === 0 ? 11 : mes - 1
      const anoAnt = mes === 0 ? ano - 1 : ano
      const dataStr = `${anoAnt}-${String(mesAnt + 1).padStart(2, '0')}-${String(numDia).padStart(2, '0')}`

      dias.push({
        numero: numDia,
        numeroFormatado: String(numDia).padStart(2, '0'),
        dataStr,
        outroMes: true,
        eHoje: dataStr === hojeStr,
        tarefas: []
      })
    }

    for (let d = 1; d <= ultimoDiaMes; d++) {
      const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

      const tarefasDesteDia = tarefasFiltradas.value.filter(t => {
        return t.prazo && t.prazo.slice(0, 10) === dataStr
      })

      dias.push({
        numero: d,
        numeroFormatado: String(d).padStart(2, '0'),
        dataStr,
        outroMes: false,
        eHoje: dataStr === hojeStr,
        tarefas: tarefasDesteDia
      })
    }

    const totalCelulas = Math.ceil(dias.length / 7) * 7
    const diasFaltando = totalCelulas - dias.length
    for (let d = 1; d <= diasFaltando; d++) {
      const mesProx = mes === 11 ? 0 : mes + 1
      const anoProx = mes === 11 ? ano + 1 : ano
      const dataStr = `${anoProx}-${String(mesProx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

      dias.push({
        numero: d,
        numeroFormatado: String(d).padStart(2, '0'),
        dataStr,
        outroMes: true,
        eHoje: dataStr === hojeStr,
        tarefas: []
      })
    }

    return dias
  })

  function abrirTarefaNoKanban(tarefa) {
    const idProjeto = tarefa.projeto || 1
    router.push({
      path: `/kanban/${idProjeto}`,
      query: { tarefa: tarefa.id }
    })
  }

  return {
    mesAtual,
    anoAtual,
    nomeMesAno,
    busca,
    filtroProjeto,
    filtroStatus,
    filtroPrioridade,
    filtroParticipante,
    projetos,
    participantes,
    nomeProjetoAtivo,
    indicadores,
    totalTarefasNoMes,
    diasDoMes,
    mesAnterior,
    mesSeguinte,
    irParaHoje,
    abrirTarefaNoKanban
  }
}
