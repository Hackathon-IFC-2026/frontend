import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '/services/api.js'

// Altere para false quando a API Django estiver pronta.
export const MODO_DEMONSTRACAO = true

const dadosIniciais = [
  {
    id: 1,
    projeto: 1,
    titulo: 'Criar protótipo das telas',
    descricao: 'Desenvolver o protótipo das telas principais do projeto.',
    status: 'a_fazer',
    prioridade: 'alta',
    data_inicio: '2026-10-23',
    prazo: '2026-10-28',
    concluida_em: null,
    responsaveis: [
      { id: 1, nome: 'Ana' }
    ],
    comentarios: [],
    checklist: [
      { id: 1, texto: 'Definir layout', concluido: true },
      { id: 2, texto: 'Criar protótipo', concluido: false }
    ],
    materiais: []
  },
  {
    id: 2,
    projeto: 1,
    titulo: 'Organizar documentação',
    descricao: 'Preparar a documentação do projeto.',
    status: 'em_andamento',
    prioridade: 'media',
    data_inicio: '2026-10-22',
    prazo: '2026-10-30',
    concluida_em: null,
    responsaveis: [
      { id: 2, nome: 'Julia' }
    ],
    comentarios: [],
    checklist: [],
    materiais: []
  }
]

const copiar = (valor) => JSON.parse(JSON.stringify(valor))

export const useTaskStore = defineStore('tasks', () => {
  const tarefas = ref(
    MODO_DEMONSTRACAO ? copiar(dadosIniciais) : []
  )

  const tarefaAtual = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function listarTarefas(projetoId) {
    loading.value = true
    error.value = null

    try {
      if (MODO_DEMONSTRACAO) {
        return tarefas.value.filter(
          tarefa => Number(tarefa.projeto) === Number(projetoId)
        )
      }

      const { data } = await api.get('/tarefas/', {
        params: { projeto: projetoId }
      })

      tarefas.value = Array.isArray(data)
        ? data
        : data.results || []

      return tarefas.value
    } catch (err) {
      error.value = 'Erro ao carregar tarefas.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function buscarTarefa(id) {
    if (MODO_DEMONSTRACAO) {
      const encontrada = tarefas.value.find(
        tarefa => Number(tarefa.id) === Number(id)
      )

      if (!encontrada) {
        throw new Error('Tarefa não encontrada.')
      }

      tarefaAtual.value = copiar(encontrada)
      return tarefaAtual.value
    }

    const { data } = await api.get(`/tarefas/${id}/`)
    tarefaAtual.value = data
    return data
  }

  async function criarTarefa(dados) {
    let criada

    if (MODO_DEMONSTRACAO) {
      criada = {
        id: Date.now(),
        ...copiar(dados),
        comentarios: [],
        checklist: [],
        materiais: [],
        concluida_em: dados.status === 'concluido'
          ? new Date().toISOString()
          : null
      }
    } else {
      const response = await api.post('/tarefas/', dados)
      criada = response.data
    }

    tarefas.value.push(criada)
    return criada
  }

  async function atualizarTarefa(id, dados) {
    let atualizada

    if (MODO_DEMONSTRACAO) {
      const original = tarefas.value.find(
        tarefa => Number(tarefa.id) === Number(id)
      )

      if (!original) throw new Error('Tarefa não encontrada.')

      atualizada = {
        ...original,
        ...copiar(dados)
      }

      if (dados.status === 'concluido' && original.status !== 'concluido') {
        atualizada.concluida_em = new Date().toISOString()
      }

      if (dados.status && dados.status !== 'concluido') {
        atualizada.concluida_em = null
      }
    } else {
      const response = await api.patch(`/tarefas/${id}/`, dados)
      atualizada = response.data
    }

    const index = tarefas.value.findIndex(
      tarefa => Number(tarefa.id) === Number(id)
    )

    if (index !== -1) {
      tarefas.value[index] = atualizada
    }

    if (Number(tarefaAtual.value?.id) === Number(id)) {
      tarefaAtual.value = copiar(atualizada)
    }

    return atualizada
  }

  async function excluirTarefa(id) {
    if (!MODO_DEMONSTRACAO) {
      await api.delete(`/tarefas/${id}/`)
    }

    tarefas.value = tarefas.value.filter(
      tarefa => Number(tarefa.id) !== Number(id)
    )

    if (Number(tarefaAtual.value?.id) === Number(id)) {
      tarefaAtual.value = null
    }
  }

  function arquivarTarefas(projetoId, ids) {
    const idsArquivados = new Set(ids.map(String))
    const removidas = tarefas.value.filter((tarefa) =>
      String(tarefa.projeto) === String(projetoId) &&
      idsArquivados.has(String(tarefa.id)),
    )
    tarefas.value = tarefas.value.filter(
      (tarefa) => !removidas.includes(tarefa),
    )

    if (removidas.some((tarefa) =>
      Number(tarefaAtual.value?.id) === Number(tarefa.id),
    )) {
      tarefaAtual.value = null
    }

    return copiar(removidas)
  }

  function restaurarTarefaDoHistorico(tarefa) {
    const jaExiste = tarefas.value.some((item) =>
      String(item.projeto) === String(tarefa.projeto) &&
      String(item.id) === String(tarefa.id),
    )
    if (jaExiste) throw new Error('A tarefa já está no fluxo normal do projeto.')
    tarefas.value.push(copiar(tarefa))
  }

  async function adicionarComentario(tarefaId, texto, autor = null) {
    if (MODO_DEMONSTRACAO) {
      const tarefa = tarefas.value.find(
        item => Number(item.id) === Number(tarefaId)
      )

      if (!tarefa) throw new Error('Tarefa não encontrada.')

      const comentario = {
        id: Date.now(),
        autor: autor || { id: 1, nome: 'Usuário' },
        texto,
        criado_em: new Date().toISOString()
      }

      tarefa.comentarios.push(comentario)
      await buscarTarefa(tarefaId)
      return comentario
    }

    const { data } = await api.post('/comentarios/', {
      tarefa: tarefaId,
      texto
    })

    await buscarTarefa(tarefaId)
    return data
  }

  async function adicionarChecklist(tarefaId, texto) {
    if (MODO_DEMONSTRACAO) {
      const tarefa = tarefas.value.find(
        item => Number(item.id) === Number(tarefaId)
      )

      if (!tarefa) throw new Error('Tarefa não encontrada.')

      tarefa.checklist.push({
        id: Date.now(),
        texto,
        concluido: false
      })

      await buscarTarefa(tarefaId)
      return
    }

    await api.post(`/tarefas/${tarefaId}/checklist/`, { texto })
    await buscarTarefa(tarefaId)
  }

  async function atualizarChecklist(tarefaId, itemId, concluido) {
    if (MODO_DEMONSTRACAO) {
      const tarefa = tarefas.value.find(
        item => Number(item.id) === Number(tarefaId)
      )

      const item = tarefa?.checklist.find(
        item => Number(item.id) === Number(itemId)
      )

      if (!item) throw new Error('Item não encontrado.')

      item.concluido = concluido
    } else {
      await api.patch(
        `/tarefas/${tarefaId}/checklist/${itemId}/`,
        { concluido }
      )
    }

    await buscarTarefa(tarefaId)
  }

  return {
    tarefas,
    tarefaAtual,
    loading,
    error,
    listarTarefas,
    buscarTarefa,
    criarTarefa,
    atualizarTarefa,
    excluirTarefa,
    arquivarTarefas,
    restaurarTarefaDoHistorico,
    adicionarComentario,
    adicionarChecklist,
    atualizarChecklist
  }
})
