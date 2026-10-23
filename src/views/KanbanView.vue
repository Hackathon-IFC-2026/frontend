<template>
  <div class="kanban-pagina" @click="fecharDropdowns">
    <!-- Cabeçalho do Projeto -->
    <header class="projeto-cabecalho">
      <h1 class="projeto-titulo">{{ projeto.nome }}</h1>
      <p class="projeto-descricao">{{ projeto.descricao }}</p>
    </header>

    <!-- Barra de Filtros e Botão Principal -->
    <div class="barra-acoes">
      <div class="filtros-grupo">
        <!-- Dropdown: Todos (Filtro por Participante) -->
        <div class="dropdown-wrapper" @click.stop>
          <button
            type="button"
            class="btn-filtro"
            @click="alternarDropdown('participante')"
          >
            <span>{{ rotuloFiltroParticipante }}</span>
            <span class="material-symbols-outlined icone-seta">expand_more</span>
          </button>

          <ul v-if="dropdownAberto === 'participante'" class="dropdown-menu">
            <li
              class="dropdown-item"
              :class="{ ativo: filtroParticipante === 'todos' }"
              @click="selecionarFiltroParticipante('todos')"
            >
              Todos
            </li>
            <li
              v-for="(part, idx) in opcoesParticipantesUnicos"
              :key="idx"
              class="dropdown-item"
              :class="{ ativo: filtroParticipante === part }"
              @click="selecionarFiltroParticipante(part)"
            >
              {{ part }}
            </li>
          </ul>
        </div>

        <!-- Dropdown: Prioridades -->
        <div class="dropdown-wrapper" @click.stop>
          <button
            type="button"
            class="btn-filtro"
            @click="alternarDropdown('prioridade')"
          >
            <span>{{ rotuloFiltroPrioridade }}</span>
            <span class="material-symbols-outlined icone-seta">expand_more</span>
          </button>

          <ul v-if="dropdownAberto === 'prioridade'" class="dropdown-menu">
            <li
              class="dropdown-item"
              :class="{ ativo: filtroPrioridade === 'todas' }"
              @click="selecionarFiltroPrioridade('todas')"
            >
              Prioridades (Todas)
            </li>
            <li
              v-for="prio in ['Alta', 'Média', 'Baixa']"
              :key="prio"
              class="dropdown-item"
              :class="{ ativo: filtroPrioridade === prio }"
              @click="selecionarFiltroPrioridade(prio)"
            >
              {{ prio }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Botão Principal: Adicionar Tarefa -->
      <button
        type="button"
        class="btn-adicionar-topo"
        @click="abrirModalNovaTarefa('fazer')"
      >
        <span class="icone-mais-topo">+</span>
        <span>Adicionar tarefa</span>
      </button>
    </div>

    <!-- Área Principal: Colunas do Kanban + Painel de Participantes -->
    <section class="kanban-area">
      <!-- 4 Colunas do Kanban -->
      <div
        v-for="coluna in colunas"
        :key="coluna.id"
        class="kanban-coluna"
        :class="{ 'coluna-drop-ativa': colunaSobreposta === coluna.id }"
        @dragover.prevent="aoArrastarSobreColuna($event, coluna.id)"
        @dragenter.prevent="aoEntrarNaColuna(coluna.id)"
        @dragleave="aoSairDaColuna($event, coluna.id)"
        @drop="aoSoltarNaColuna($event, coluna.id)"
      >
        <!-- Cabeçalho Colorido da Coluna -->
        <div class="coluna-topo" :class="coluna.classeCor">
          <h2 class="coluna-titulo">{{ coluna.titulo }}</h2>
        </div>

        <!-- Lista de Cards da Coluna -->
        <div class="coluna-cards">
          <div
            v-for="tarefa in obterTarefasDaColuna(coluna.id)"
            :key="tarefa.id"
            class="card-slot"
            @dragover.prevent
            @drop.stop="aoSoltarSobreCard($event, coluna.id, tarefa.id)"
          >
            <cardsKabanComponent
              :tarefa="tarefa"
              @dragstart-card="aoIniciarArrastoCard"
              @dragend-card="aoFinalizarArrastoCard"
            />
          </div>
        </div>

        <!-- Rodapé da Coluna (+ Adicionar tarefa) -->
        <div v-if="coluna.mostrarBotaoAdicionar" class="coluna-rodape">
          <div class="linha-divisoria-coluna"></div>
          <button
            type="button"
            class="btn-adicionar-coluna"
            @click="abrirModalNovaTarefa(coluna.id)"
          >
            <span class="icone-mais-coluna">+</span>
            <span>Adicionar tarefa</span>
          </button>
        </div>
      </div>

      <!-- Painel Lateral Direito: Participantes -->
      <participantesKanbanComponent
        :participantes="participantes"
        @adicionar="modalParticipanteAberto = true"
      />
    </section>

    <!-- Modal: Adicionar Nova Tarefa -->
    <div
      v-if="modalTarefaAberto"
      class="modal-overlay"
      @click.self="modalTarefaAberto = false"
    >
      <div class="modal-caixa">
        <div class="modal-cabecalho">
          <h3>Nova tarefa</h3>
          <button type="button" class="btn-fechar-modal" @click="modalTarefaAberto = false">
            &times;
          </button>
        </div>

        <form class="modal-formulario" @submit.prevent="salvarNovaTarefa">
          <label class="campo-form">
            <span>Título da tarefa</span>
            <input
              v-model="novaTarefa.titulo"
              type="text"
              placeholder="Ex: Criar protótipo da tela"
              required
            />
          </label>

          <div class="campos-duplos">
            <label class="campo-form">
              <span>Data de início</span>
              <input
                v-model="novaTarefa.dataInicio"
                type="text"
                placeholder="DD/MM/AAAA"
                required
              />
            </label>

            <label class="campo-form">
              <span>Data de fim</span>
              <input
                v-model="novaTarefa.dataFim"
                type="text"
                placeholder="DD/MM/AAAA"
                required
              />
            </label>
          </div>

          <div class="campos-duplos">
            <label class="campo-form">
              <span>Prioridade</span>
              <select v-model="novaTarefa.prioridade">
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </label>

            <label class="campo-form">
              <span>Coluna</span>
              <select v-model="novaTarefa.coluna">
                <option v-for="col in colunas" :key="col.id" :value="col.id">
                  {{ col.titulo }}
                </option>
              </select>
            </label>
          </div>

          <div class="modal-botoes">
            <button
              type="button"
              class="btn-cancelar"
              @click="modalTarefaAberto = false"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-salvar">Adicionar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Adicionar Participante -->
    <div
      v-if="modalParticipanteAberto"
      class="modal-overlay"
      @click.self="modalParticipanteAberto = false"
    >
      <div class="modal-caixa">
        <div class="modal-cabecalho">
          <h3>Adicionar participante</h3>
          <button
            type="button"
            class="btn-fechar-modal"
            @click="modalParticipanteAberto = false"
          >
            &times;
          </button>
        </div>

        <form class="modal-formulario" @submit.prevent="salvarNovoParticipante">
          <label class="campo-form">
            <span>Nome do participante</span>
            <input
              v-model="novoParticipanteNome"
              type="text"
              placeholder="Ex: Maria Oliveira"
              required
            />
          </label>

          <div class="modal-botoes">
            <button
              type="button"
              class="btn-cancelar"
              @click="modalParticipanteAberto = false"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-salvar">Adicionar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import cardsKabanComponent from '@/components/cardsKabanComponent.vue'
import participantesKanbanComponent from '@/components/participantesKanbanComponent.vue'
import api from '/services/api.js'

const route = useRoute()

// Definição das 4 colunas com as cores exatas da imagem
const colunas = [
  {
    id: 'atrasado',
    titulo: 'Atrasado',
    classeCor: 'topo-atrasado',
    mostrarBotaoAdicionar: false,
  },
  {
    id: 'fazer',
    titulo: 'Fazer',
    classeCor: 'topo-fazer',
    mostrarBotaoAdicionar: true,
  },
  {
    id: 'em_processo',
    titulo: 'Em processo',
    classeCor: 'topo-em-processo',
    mostrarBotaoAdicionar: true,
  },
  {
    id: 'concluido',
    titulo: 'Concluído',
    classeCor: 'topo-concluido',
    mostrarBotaoAdicionar: true,
  },
]

// =========================================================================
// DADOS ESTÁTICOS INICIAIS (espelhando fielmente a imagem de referência)
// =========================================================================
const projetosMapeados = {
  1: { nome: 'Natal luz', descricao: 'Decoração e iluminação natalina da cidade.' },
  2: { nome: 'Reforma Praça Central', descricao: 'Paisagismo, bancos e iluminação pública.' },
  3: { nome: 'Mutirão Verde', descricao: 'Plantio de árvores e conscientização ambiental.' },
  4: { nome: 'Festival de Inverno', descricao: 'Shows culturais, gastronomia e artesanato.' },
  5: { nome: 'Feira Tecnológica', descricao: 'Exposição de startups e palestras de inovação.' },
  6: { nome: 'Iluminação Pública LED', descricao: 'Instalação de lâmpadas LED sustentáveis.' },
  7: { nome: 'Revitalização Orla', descricao: 'Ciclovia e nova calçada para caminhada.' },
  8: { nome: 'Horta Comunitária', descricao: 'Cultivo de hortaliças e oficinas ecológicas.' },
}

const idAtual = computed(() => route.params.id || 1)
const dadosProjetoAtual = computed(() => {
  return (
    projetosMapeados[idAtual.value] || {
      nome: 'Projeto Hackathon',
      descricao: 'Pequena descrição do projeto',
    }
  )
})

const projeto = computed(() => ({
  id: idAtual.value,
  nome: dadosProjetoAtual.value.nome,
  descricao: dadosProjetoAtual.value.descricao,
}))

const participantes = ref([
  { id: 1, nome: 'Fulano Ciclano', avatar: null },
  { id: 2, nome: 'Fulano Ciclano', avatar: null },
  { id: 3, nome: 'Fulano Ciclano', avatar: null },
  { id: 4, nome: 'Fulano Ciclano', avatar: null },
  { id: 5, nome: 'Fulano Ciclano', avatar: null },
])

const tarefas = ref([
  {
    id: 1,
    titulo: 'Título da tarefa',
    dataInicio: '12/10/2020',
    dataFim: '12/10/2020',
    prioridade: 'Alta',
    coluna: 'fazer',
    participantes: [
      { id: 1, nome: 'Fulano Ciclano', avatar: null },
      { id: 2, nome: 'Fulano Ciclano', avatar: null },
    ],
  },
  {
    id: 2,
    titulo: 'Título da tarefa',
    dataInicio: '12/10/2020',
    dataFim: '12/10/2020',
    prioridade: 'Baixa',
    coluna: 'em_processo',
    participantes: [
      { id: 1, nome: 'Fulano Ciclano', avatar: null },
      { id: 3, nome: 'Fulano Ciclano', avatar: null },
    ],
  },
])

// =========================================================================
// FILTROS (Todos / Prioridades)
// =========================================================================
const dropdownAberto = ref(null)
const filtroParticipante = ref('todos')
const filtroPrioridade = ref('todas')

const opcoesParticipantesUnicos = computed(() => {
  const nomes = participantes.value.map((p) => p.nome).filter(Boolean)
  return [...new Set(nomes)]
})

const rotuloFiltroParticipante = computed(() => {
  return filtroParticipante.value === 'todos' ? 'Todos' : filtroParticipante.value
})

const rotuloFiltroPrioridade = computed(() => {
  return filtroPrioridade.value === 'todas' ? 'Prioridades' : filtroPrioridade.value
})

function alternarDropdown(nome) {
  dropdownAberto.value = dropdownAberto.value === nome ? null : nome
}

function fecharDropdowns() {
  dropdownAberto.value = null
}

function selecionarFiltroParticipante(valor) {
  filtroParticipante.value = valor
  dropdownAberto.value = null
}

function selecionarFiltroPrioridade(valor) {
  filtroPrioridade.value = valor
  dropdownAberto.value = null
}

const tarefasFiltradas = computed(() => {
  return tarefas.value.filter((tarefa) => {
    const passaPrioridade =
      filtroPrioridade.value === 'todas' ||
      String(tarefa.prioridade || '').toLowerCase() ===
        filtroPrioridade.value.toLowerCase()

    const passaParticipante =
      filtroParticipante.value === 'todos' ||
      (Array.isArray(tarefa.participantes) &&
        tarefa.participantes.some((p) => p.nome === filtroParticipante.value))

    return passaPrioridade && passaParticipante
  })
})

function obterTarefasDaColuna(colunaId) {
  return tarefasFiltradas.value.filter((t) => t.coluna === colunaId)
}

// =========================================================================
// DRAG AND DROP (Arrastar e soltar entre colunas e reordenação)
// =========================================================================
const tarefaArrastadaId = ref(null)
const colunaSobreposta = ref(null)

function aoIniciarArrastoCard(tarefa) {
  tarefaArrastadaId.value = tarefa.id
}

function aoFinalizarArrastoCard() {
  tarefaArrastadaId.value = null
  colunaSobreposta.value = null
}

function aoArrastarSobreColuna(event, colunaId) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  if (colunaSobreposta.value !== colunaId) {
    colunaSobreposta.value = colunaId
  }
}

function aoEntrarNaColuna(colunaId) {
  colunaSobreposta.value = colunaId
}

function aoSairDaColuna(event, colunaId) {
  const destinoRelacionado = event.relatedTarget
  if (!event.currentTarget.contains(destinoRelacionado)) {
    if (colunaSobreposta.value === colunaId) {
      colunaSobreposta.value = null
    }
  }
}

async function moverTarefaParaColuna(idTarefa, novaColuna, idCardAlvo = null) {
  const indiceOrigem = tarefas.value.findIndex(
    (t) => String(t.id) === String(idTarefa)
  )
  if (indiceOrigem === -1) return

  const [tarefaMovida] = tarefas.value.splice(indiceOrigem, 1)
  tarefaMovida.coluna = novaColuna

  if (idCardAlvo !== null && String(idCardAlvo) !== String(idTarefa)) {
    const indiceAlvo = tarefas.value.findIndex(
      (t) => String(t.id) === String(idCardAlvo)
    )
    if (indiceAlvo !== -1) {
      tarefas.value.splice(indiceAlvo, 0, tarefaMovida)
    } else {
      tarefas.value.push(tarefaMovida)
    }
  } else {
    tarefas.value.push(tarefaMovida)
  }

  // INTEGRAÇÃO COM BACKEND (pronta para descomentar):
  /*
  try {
    await api.patch(`/api/tarefas/${tarefaMovida.id}/`, {
      coluna: novaColuna,
      status: novaColuna,
    })
  } catch (erro) {
    console.error('Erro ao atualizar coluna da tarefa no backend:', erro)
  }
  */
}

function obterIdTarefaDoEvento(event) {
  if (tarefaArrastadaId.value !== null) {
    return tarefaArrastadaId.value
  }
  return event.dataTransfer?.getData('text/plain') || null
}

function aoSoltarNaColuna(event, colunaId) {
  const idTarefa = obterIdTarefaDoEvento(event)
  colunaSobreposta.value = null
  tarefaArrastadaId.value = null

  if (idTarefa !== null) {
    moverTarefaParaColuna(idTarefa, colunaId)
  }
}

function aoSoltarSobreCard(event, colunaId, cardAlvoId) {
  const idTarefa = obterIdTarefaDoEvento(event)
  colunaSobreposta.value = null
  tarefaArrastadaId.value = null

  if (idTarefa !== null) {
    moverTarefaParaColuna(idTarefa, colunaId, cardAlvoId)
  }
}

// =========================================================================
// CRIAÇÃO DE TAREFA E PARTICIPANTE + ESTRUTURA BACKEND
// =========================================================================
const modalTarefaAberto = ref(false)
const modalParticipanteAberto = ref(false)

const novaTarefa = ref({
  titulo: '',
  dataInicio: '12/10/2026',
  dataFim: '20/10/2026',
  prioridade: 'Alta',
  coluna: 'fazer',
})

const novoParticipanteNome = ref('')

function abrirModalNovaTarefa(colunaPadrao = 'fazer') {
  novaTarefa.value = {
    titulo: '',
    dataInicio: new Date().toLocaleDateString('pt-BR'),
    dataFim: new Date().toLocaleDateString('pt-BR'),
    prioridade: 'Alta',
    coluna: colunaPadrao,
  }
  modalTarefaAberto.value = true
}

async function salvarNovaTarefa() {
  if (!novaTarefa.value.titulo.trim()) return

  const itemCriado = {
    id: Date.now(),
    titulo: novaTarefa.value.titulo.trim(),
    dataInicio: novaTarefa.value.dataInicio,
    dataFim: novaTarefa.value.dataFim,
    prioridade: novaTarefa.value.prioridade,
    coluna: novaTarefa.value.coluna,
    participantes: participantes.value.slice(0, 2),
  }

  // INTEGRAÇÃO COM BACKEND (pronta para descomentar):
  /*
  try {
    const response = await api.post(`/api/projetos/${projeto.value.id}/tarefas/`, itemCriado)
    tarefas.value.push(response.data)
  } catch (erro) {
    console.error('Erro ao criar tarefa:', erro)
  }
  */

  tarefas.value.push(itemCriado)
  modalTarefaAberto.value = false
}

async function salvarNovoParticipante() {
  if (!novoParticipanteNome.value.trim()) return

  const novoMembro = {
    id: Date.now(),
    nome: novoParticipanteNome.value.trim(),
    avatar: null,
  }

  // INTEGRAÇÃO COM BACKEND (pronta para descomentar):
  /*
  try {
    const response = await api.post(`/api/projetos/${projeto.value.id}/participantes/`, novoMembro)
    participantes.value.push(response.data)
  } catch (erro) {
    console.error('Erro ao adicionar participante:', erro)
  }
  */

  participantes.value.push(novoMembro)
  novoParticipanteNome.value = ''
  modalParticipanteAberto.value = false
}

async function buscarDadosKanban() {
  try {
    void api // Mantém a referência pronta para uso ao descomentar abaixo
    // const idProjeto = route.params.id || 1
    // const { data } = await api.get(`/api/projetos/${idProjeto}/`)
    // projeto.value = {
    //   id: data.id,
    //   nome: data.nome || data.titulo,
    //   descricao: data.descricao,
    // }
    // participantes.value = data.participantes || []
    // tarefas.value = (data.tarefas || []).map((t) => ({
    //   id: t.id,
    //   titulo: t.titulo || t.nome,
    //   dataInicio: t.data_inicio || t.dataInicio,
    //   dataFim: t.data_fim || t.dataFim,
    //   prioridade: t.prioridade || 'Média',
    //   coluna: t.coluna || t.status || 'fazer',
    //   participantes: t.participantes || [],
    // }))
  } catch (erro) {
    console.error('Erro ao carregar dados do Kanban:', erro)
  }
}

onMounted(() => {
  buscarDadosKanban()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.kanban-pagina {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
  color: #000000;
  box-sizing: border-box;
  padding: 6px 4px 24px;
}

/* Cabeçalho do Projeto */
.projeto-cabecalho {
  margin-bottom: 24px;
}

.projeto-titulo {
  margin: 0;
  font-size: 2.35rem;
  font-weight: 500;
  color: #000000;
  line-height: 1.15;
  letter-spacing: -0.4px;
}

.projeto-descricao {
  margin: 4px 0 0 0;
  font-size: 1.05rem;
  font-weight: 400;
  color: #999999; /* #999999 100% */
}

/* Barra de Filtros e Botão Superior */
.barra-acoes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.filtros-grupo {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.dropdown-wrapper {
  position: relative;
}

.btn-filtro {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 132px;
  padding: 6px 20px;
  background-color: #ffffff;
  color: #4e7855; /* #4E7855 100% */
  border: 1.5px solid #4e7855;
  border-radius: 999px;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-filtro:hover {
  background-color: rgba(78, 120, 85, 0.08);
}

.icone-seta {
  font-size: 20px;
  line-height: 1;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 170px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background-color: #ffffff;
  border: 1px solid rgba(78, 120, 85, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  z-index: 30;
}

.dropdown-item {
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #1f2937;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover,
.dropdown-item.ativo {
  background-color: rgba(78, 120, 85, 0.12);
  color: #4e7855;
  font-weight: 600;
}

.btn-adicionar-topo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #4e7855; /* #4E7855 100% */
  color: #ffffff; /* #FFFFFF 100% */
  border: none;
  border-radius: 999px;
  padding: 8px 28px;
  font-family: 'Poppins', sans-serif;
  font-size: 1.08rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.btn-adicionar-topo:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.icone-mais-topo {
  font-size: 1.35rem;
  line-height: 1;
  font-weight: 500;
}

/* Grid Principal: 4 Colunas Kanban + 1 Coluna Participantes */
.kanban-area {
  display: grid;
  grid-template-columns: repeat(4, minmax(185px, 1fr)) minmax(205px, 1.05fr);
  gap: 12px;
  align-items: stretch;
  width: 100%;
}

.kanban-coluna {
  background-color: rgba(220, 220, 220, 0.2); /* #DCDCDC 20% */
  border-radius: 16px;
  min-height: 560px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  transition: background-color 0.2s ease, outline 0.2s ease;
}

.kanban-coluna.coluna-drop-ativa {
  background-color: rgba(78, 120, 85, 0.08);
  outline: 2px dashed #4e7855;
  outline-offset: -2px;
}

/* Cabeçalhos das Colunas com Cores e Opacidades Exatas */
.coluna-topo {
  height: 68px;
  border-radius: 16px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
}

.coluna-titulo {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 500;
  color: #000000; /* #000000 100% */
}

/* #FF0000 30% */
.topo-atrasado {
  background-color: rgba(255, 0, 0, 0.3);
}

/* #989191 30% */
.topo-fazer {
  background-color: rgba(152, 145, 145, 0.3);
}

/* #675CFF 30% */
.topo-em-processo {
  background-color: rgba(103, 92, 255, 0.3);
}

/* #0BE43F 30% */
.topo-concluido {
  background-color: rgba(11, 228, 63, 0.3);
}

/* Lista de Cards */
.coluna-cards {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-slot {
  width: 100%;
}

/* Rodapé de cada Coluna (+ Adicionar tarefa) */
.coluna-rodape {
  padding: 6px 14px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
}

.linha-divisoria-coluna {
  width: 88%;
  height: 1px;
  background-color: rgba(78, 120, 85, 0.55);
  margin-bottom: 10px;
}

.btn-adicionar-coluna {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #4e7855; /* #4E7855 100% */
  font-family: 'Poppins', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.btn-adicionar-coluna:hover {
  background-color: rgba(78, 120, 85, 0.1);
}

.icone-mais-coluna {
  font-size: 1.2rem;
  line-height: 1;
  font-weight: 400;
}

/* Modais */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
}

.modal-caixa {
  background-color: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  padding: 22px 24px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
}

.modal-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-cabecalho h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #000000;
}

.btn-fechar-modal {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #999999;
  cursor: pointer;
}

.modal-formulario {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.campos-duplos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.campo-form {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #333333;
}

.campo-form input,
.campo-form select {
  padding: 9px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  color: #000000;
  outline: none;
  background-color: #ffffff;
}

.campo-form input:focus,
.campo-form select:focus {
  border-color: #4e7855;
}

.modal-botoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.btn-cancelar {
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-salvar {
  background-color: #4e7855;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 8px 22px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-salvar:hover {
  opacity: 0.92;
}

/* Responsividade */
@media (max-width: 1250px) {
  .kanban-area {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .projeto-titulo {
    font-size: 1.75rem;
  }

  .kanban-area {
    grid-template-columns: 1fr;
  }

  .kanban-coluna {
    min-height: 320px;
  }

  .campos-duplos {
    grid-template-columns: 1fr;
  }
}
</style>

