<template>
  <div class="kanban-pagina" @click="fecharDropdowns">
    <header class="projeto-cabecalho">
      <h1 class="projeto-titulo">{{ projeto.nome }}</h1>
      <p class="projeto-descricao">{{ projeto.descricao }}</p>
    </header>

    <div class="barra-acoes">
      <div class="filtros-grupo">
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

      <button
        type="button"
        class="btn-adicionar-topo"
        @click="abrirModalNovaTarefa('fazer')"
      >
        <span class="icone-mais-topo">+</span>
        <span>Adicionar tarefa</span>
      </button>
    </div>

    <section class="kanban-area">
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
        <div class="coluna-topo" :class="coluna.classeCor">
          <h2 class="coluna-titulo">{{ coluna.titulo }}</h2>
        </div>

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

      <participantesKanbanComponent
        :participantes="participantes"
        @adicionar="modalParticipanteAberto = true"
      />
    </section>

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

// DADOS ESTÁTICOS
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

  // INTEGRAÇÃO COM BACKEND
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

  // INTEGRAÇÃO COM BACKEND
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

  // INTEGRAÇÃO COM BACKEND
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
    void api
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.kanban-pagina {
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
  color: #000000;
  box-sizing: border-box;
  padding: 10px 10px 30px;
}

.projeto-cabecalho {
  margin-bottom: 20px;
}

.projeto-titulo {
  margin: 0;
  font-size: 2.1rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.projeto-descricao {
  margin: 6px 0 0 0;
  font-size: 0.95rem;
  font-weight: 400;
  color: #9ca3af;
}

.barra-acoes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filtros-grupo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.dropdown-wrapper {
  position: relative;
}

.btn-filtro {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 110px;
  padding: 6px 16px;
  background-color: #ffffff;
  color: #284431;
  border: 1px solid #718a77;
  border-radius: 999px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.btn-filtro:hover {
  background-color: rgba(78, 120, 85, 0.05);
  border-color: #284431;
}

.icone-seta {
  font-size: 18px;
  line-height: 1;
  color: #284431;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 160px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background-color: #ffffff;
  border: 1px solid rgba(78, 120, 85, 0.25);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  z-index: 30;
}

.dropdown-item {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #1f2937;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover,
.dropdown-item.ativo {
  background-color: rgba(78, 120, 85, 0.1);
  color: #284431;
  font-weight: 600;
}

.btn-adicionar-topo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #2b4532; /* Verde escuro idêntico ao da imagem */
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 8px 24px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.btn-adicionar-topo:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.icone-mais-topo {
  font-size: 1.15rem;
  line-height: 1;
  font-weight: 400;
}

.kanban-area {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr)) minmax(180px, 0.95fr);
  gap: 8px;
  align-items: stretch;
  width: 100%;
}

.kanban-coluna {
  background-color: #ebebeb;
  border-radius: 12px;
  min-height: 560px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  transition: background-color 0.2s ease, outline 0.2s ease;
}

.kanban-coluna.coluna-drop-ativa {
  background-color: #e2e8e3;
  outline: 2px dashed #4e7855;
  outline-offset: -2px;
}

.coluna-topo {
  height: 56px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding: 0 14px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
}

.coluna-titulo {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: #000000;
}

.topo-atrasado {
  background-color: #f18c8e;
}

.topo-fazer {
  background-color: #bebebe;
}

.topo-em-processo {
  background-color: #b3a4e1;
}

.topo-concluido {
  background-color: #a4d8a5;
}

.coluna-cards {
  flex: 1;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-slot {
  width: 100%;
}

.coluna-rodape {
  padding: 6px 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
}

.linha-divisoria-coluna {
  width: 90%;
  height: 1px;
  background-color: #3b5742;
  margin-bottom: 8px;
}

.btn-adicionar-coluna {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #3b5742;
  font-family: 'Poppins', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.btn-adicionar-coluna:hover {
  background-color: rgba(78, 120, 85, 0.1);
}

.icone-mais-coluna {
  font-size: 1.05rem;
  line-height: 1;
  font-weight: 500;
}

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
    font-size: 1.65rem;
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
