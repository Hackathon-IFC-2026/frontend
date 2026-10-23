
<template>
  <main class="kanban-pagina">
    <header class="projeto-header">
      <div>
        <h1>{{ projeto.nome }}</h1>
        <p>{{ projeto.descricao }}</p>
      </div>
      <button class="btn-criar" @click="abrirCadastro()">
        <span class="material-symbols-outlined">add</span>
        Nova tarefa
      </button>
    </header>

    <section class="resumo">
      <div v-for="item in indicadores" :key="item.nome" class="resumo-item">
        <span>{{ item.nome }}</span>
        <strong>{{ item.valor }}</strong>
      </div>
    </section>

    <section class="toolbar">
      <div class="campo-busca">
        <span class="material-symbols-outlined">search</span>
        <input v-model="busca" placeholder="Buscar tarefas..." />
      </div>

      <select v-model="filtroPrioridade">
        <option value="todas">Todas as prioridades</option>
        <option value="alta">Alta</option>
        <option value="media">Média</option>
        <option value="baixa">Baixa</option>
      </select>

      <select v-model="filtroParticipante">
        <option value="todos">Todos os responsáveis</option>
        <option v-for="pessoa in participantes" :key="pessoa.id" :value="String(pessoa.id)">
          {{ pessoa.nome }}
        </option>
      </select>
    </section>

    <p v-if="erro" class="mensagem-erro">{{ erro }}</p>

    <section class="kanban-area">
      <div
        v-for="coluna in colunas"
        :key="coluna.id"
        class="kanban-coluna"
        :class="[coluna.classe, { 'arrastando-sobre': colunaSobreposta === coluna.id }]"
        @dragover.prevent
        @dragenter.prevent="colunaSobreposta = coluna.id"
        @dragleave="sairDaColuna($event, coluna.id)"
        @drop.prevent="soltarTarefa($event, coluna.id)"
      >
        <header class="coluna-header">
          <div class="coluna-nome">
            <span class="indicador"></span>
            <h2>{{ coluna.nome }}</h2>
            <span class="contador">{{ tarefasDaColuna(coluna.id).length }}</span>
          </div>
          <button
            v-if="coluna.id !== 'atrasado'"
            class="btn-add-coluna"
            title="Adicionar tarefa"
            @click="abrirCadastro(coluna.id)"
          >+</button>
          <span v-else class="btn-add-placeholder"></span>
        </header>

        <div class="lista-cards">
          <div
            v-for="tarefa in tarefasDaColuna(coluna.id)"
            :key="tarefa.id"
            class="task-card"
            :draggable="podeGerenciar(tarefa)"
            @dragstart="iniciarArrasto($event, tarefa)"
            @dragend="finalizarArrasto"
            @click="abrirDetalhes(tarefa.id)"
          >
            <div class="card-topo">
              <span class="prioridade" :class="tarefa.prioridade">
                {{ prioridadeLabel(tarefa.prioridade) }}
              </span>
              <span class="task-id">#{{ tarefa.id }}</span>
            </div>

            <h3>{{ tarefa.titulo }}</h3>
            <p v-if="tarefa.descricao" class="card-descricao">{{ tarefa.descricao }}</p>

            <div class="card-rodape">
              <div class="avatares">
                <span
                  v-for="pessoa in responsaveisDaTarefa(tarefa).slice(0, 3)"
                  :key="pessoa.id"
                  class="avatar"
                  :title="pessoa.nome"
                >{{ pessoa.nome.charAt(0).toUpperCase() }}</span>
                <span v-if="responsaveisDaTarefa(tarefa).length > 3" class="avatar mais">
                  +{{ responsaveisDaTarefa(tarefa).length - 3 }}
                </span>
              </div>
              <span v-if="tarefa.prazo" class="prazo">
                <span class="material-symbols-outlined">calendar_today</span>
                {{ formatarPrazo(tarefa.prazo) }}
              </span>
            </div>
          </div>

          <div v-if="!tarefasDaColuna(coluna.id).length" class="coluna-vazia">
            Nenhuma tarefa nesta etapa
          </div>
          <button
            v-if="coluna.id !== 'atrasado'"
            class="adicionar-rodape"
            @click="abrirCadastro(coluna.id)"
          >+ Adicionar tarefa</button>
        </div>
      </div>
    </section>

    <section class="participantes-area">
      <div class="participantes-topo">
        <div>
          <h2>Participantes <span>{{ participantes.length }}</span></h2>
          <p>Equipe deste projeto</p>
        </div>
        <button @click="modalParticipanteAberto = true">
          <span class="material-symbols-outlined">person_add</span>
          Adicionar
        </button>
      </div>
      <div class="participantes-lista">
        <div v-for="pessoa in participantes" :key="pessoa.id" class="participante-item">
          <span class="participante-avatar">{{ pessoa.nome.charAt(0).toUpperCase() }}</span>
          <span>{{ pessoa.nome }}</span>
        </div>
        <p v-if="!participantes.length" class="sem-participantes">
          Nenhum participante adicionado.
        </p>
      </div>
    </section>

    <CreateTaskModal
      v-model="modalCadastroAberto"
      :projeto-id="projetoId"
      :participantes="participantes"
      :status-inicial="statusInicial"
      @created="tarefaCriada"
    />

    <TaskDetails
      v-if="tarefaSelecionada !== null"
      :task-id="tarefaSelecionada"
      :usuario-atual-id="usuarioAtual.id"
      :is-admin="isAdmin"
      @close="tarefaSelecionada = null"
      @updated="atualizarQuadro"
      @deleted="atualizarQuadro"
    />

    <div
      v-if="modalParticipanteAberto"
      class="overlay"
      @click.self="modalParticipanteAberto = false"
    >
      <form class="modal-participante" @submit.prevent="adicionarParticipante">
        <h2>Adicionar participante</h2>
        <input v-model="novoParticipante" placeholder="Nome do participante" required />
        <div class="acoes-modal">
          <button type="button" @click="modalParticipanteAberto = false">Cancelar</button>
          <button type="submit" class="confirmar">Adicionar</button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue'
import TaskDetails from '@/components/tasks/TaskDetails.vue'

const route = useRoute()
const store = useTaskStore()
const projetoId = computed(() => Number(route.params.id || 1))

// Dados temporários até integrar autenticação e projetos do Django.
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
  { id: 1, nome: 'Ana' }, { id: 2, nome: 'Julia' },
  { id: 3, nome: 'Amanda' }, { id: 4, nome: 'Anna' }
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

function contarStatus(status) {
  return tarefas.value.filter(tarefa => tarefa.status === status).length
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

function tarefaCriada() {
  // A Store já atualiza a lista.
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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.kanban-pagina {
  width: 100%; max-width: 1600px; margin: auto; padding: 12px 16px;
  box-sizing: border-box; font-family: Poppins, sans-serif; color: #24372a;
}
.projeto-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin-bottom: 12px;
}
.projeto-header h1 { margin: 0; font-size: 23px; font-weight: 700; }
.projeto-header p { margin: 3px 0 0; font-size: 11px; color: #849087; }
.btn-criar {
  display: flex; align-items: center; gap: 5px; padding: 9px 15px;
  border: 0; border-radius: 9px; background: #2b4532; color: white;
  font: 600 12px Poppins, sans-serif; cursor: pointer; white-space: nowrap;
}
.btn-criar .material-symbols-outlined { font-size: 18px; }

.resumo {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px; margin-bottom: 11px;
}
.resumo-item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 9px 12px; border: 1px solid #e5ebe6;
  border-radius: 9px; background: white;
}
.resumo-item span { font-size: 11px; color: #829086; }
.resumo-item strong { font-size: 19px; font-weight: 700; }

.toolbar { display: flex; gap: 9px; margin-bottom: 12px; flex-wrap: wrap; }
.campo-busca {
  flex: 1; min-width: 170px; display: flex; align-items: center; gap: 7px;
  padding: 0 10px; border: 1px solid #dce5de; border-radius: 8px; background: white;
}
.campo-busca .material-symbols-outlined { font-size: 18px; color: #819187; }
.campo-busca input {
  width: 100%; padding: 9px 0; border: 0; outline: 0; font: 12px Poppins, sans-serif;
}
.toolbar select {
  padding: 9px 11px; border: 1px solid #dce5de; border-radius: 8px;
  background: white; color: #385240; font: 11px Poppins, sans-serif;
}

/* Quatro colunas perfeitamente alinhadas */
.kanban-area {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px; width: 100%; align-items: stretch;
}
.kanban-coluna {
  display: flex; flex-direction: column; min-width: 0; min-height: 350px;
  border: 1px solid #e8ede9; border-radius: 11px;
  background: #f4f6f4; overflow: hidden;
}
.kanban-coluna.arrastando-sobre {
  background: #e5efe7; outline: 2px dashed #4e7855; outline-offset: -2px;
}
.coluna-header {
  display: flex; align-items: center; justify-content: space-between;
  height: 46px; min-height: 46px; padding: 0 11px;
  box-sizing: border-box; border-bottom: 1px solid #e5eae6;
}
.coluna-nome { display: flex; align-items: center; gap: 7px; min-width: 0; }
.coluna-nome h2 { margin: 0; font-size: 12px; font-weight: 600; white-space: nowrap; }
.indicador { width: 8px; height: 8px; flex-shrink: 0; border-radius: 50%; }
.coluna-atrasado .indicador { background: #e77d80; }
.coluna-fazer .indicador { background: #a6adb0; }
.coluna-andamento .indicador { background: #a58cdb; }
.coluna-concluido .indicador { background: #6eb985; }
.contador {
  padding: 2px 7px; border-radius: 20px; background: #e6ebe7;
  color: #66796b; font-size: 10px;
}
.btn-add-coluna, .btn-add-placeholder {
  display: flex; align-items: center; justify-content: center;
  width: 25px; height: 25px; flex-shrink: 0;
}
.btn-add-coluna {
  border: 0; background: transparent; color: #587461;
  font-size: 22px; cursor: pointer;
}

.lista-cards {
  display: flex; flex: 1; flex-direction: column;
  gap: 9px; padding: 10px; min-width: 0;
}
.task-card {
  min-width: 0; padding: 12px; border: 1px solid #e1e7e2;
  border-radius: 9px; background: white; cursor: pointer;
  box-shadow: 0 2px 6px rgba(22,45,28,.025);
  transition: transform .15s, box-shadow .15s;
}
.task-card:hover {
  transform: translateY(-2px); box-shadow: 0 7px 20px rgba(22,45,28,.09);
}
.card-topo, .card-rodape {
  display: flex; align-items: center; justify-content: space-between; gap: 6px;
}
.card-topo { margin-bottom: 9px; }
.prioridade { padding: 3px 7px; border-radius: 5px; font-size: 10px; font-weight: 600; }
.prioridade.alta { background: #fff0ed; color: #c25a49; }
.prioridade.media { background: #fff5dc; color: #ac812b; }
.prioridade.baixa { background: #e8f5ec; color: #468358; }
.task-id { color: #a2ada5; font-size: 10px; }
.task-card h3 {
  margin: 0 0 6px; font-size: 12px; line-height: 1.5;
  font-weight: 600; overflow-wrap: anywhere;
}
.card-descricao {
  margin: 0 0 10px; color: #849087; font-size: 10px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.card-rodape { margin-top: 12px; flex-wrap: wrap; }
.avatares { display: flex; align-items: center; padding-left: 5px; }
.avatar {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; margin-left: -5px;
  border: 2px solid white; border-radius: 50%;
  background: #dfece2; color: #3d6a48; font-size: 10px; font-weight: 700;
}
.avatar.mais { background: #edf0ee; color: #66776b; }
.prazo {
  display: flex; align-items: center; gap: 4px;
  color: #89958c; font-size: 10px; white-space: nowrap;
}
.prazo .material-symbols-outlined { font-size: 14px; }
.coluna-vazia {
  padding: 24px 8px; color: #a3afa6; text-align: center; font-size: 11px;
}
.adicionar-rodape {
  margin-top: auto; padding: 10px; border: 1px dashed #d3ded5;
  border-radius: 8px; background: transparent; color: #67836e;
  font: 11px Poppins, sans-serif; cursor: pointer;
}

/* Participantes sempre visíveis, abaixo das colunas */
.participantes-area {
  margin-top: 12px; padding: 12px 15px; border: 1px solid #e5ebe6;
  border-radius: 11px; background: white;
}
.participantes-topo {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.participantes-topo h2 { margin: 0; font-size: 13px; }
.participantes-topo h2 span { margin-left: 5px; color: #8b9a90; font-weight: 500; }
.participantes-topo p { margin: 2px 0 0; color: #9aa79d; font-size: 10px; }
.participantes-topo button {
  display: flex; align-items: center; gap: 5px; padding: 7px 11px;
  border: 1px solid #cbdacf; border-radius: 7px; background: #f5f9f6;
  color: #3d6947; font: 600 11px Poppins, sans-serif; cursor: pointer;
}
.participantes-topo .material-symbols-outlined { font-size: 16px; }
.participantes-lista {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px;
}
.participante-item {
  display: flex; align-items: center; gap: 7px; padding: 5px 10px 5px 5px;
  border: 1px solid #e5ebe6; border-radius: 25px; font-size: 11px; color: #465c4b;
}
.participante-avatar {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: #e0ece3; color: #3e7049; font-size: 10px; font-weight: 700;
}
.sem-participantes { margin: 0; color: #94a198; font-size: 11px; }
.mensagem-erro { color: #c0392b; font-size: 12px; }

/* Modal de participantes */
.overlay {
  position: fixed; inset: 0; z-index: 1500; display: flex;
  align-items: center; justify-content: center; padding: 20px;
  background: rgba(0,0,0,.4);
}
.modal-participante {
  width: 100%; max-width: 400px; padding: 25px;
  box-sizing: border-box; border-radius: 14px; background: white;
}
.modal-participante h2 { margin: 0 0 18px; font-size: 19px; }
.modal-participante input {
  width: 100%; box-sizing: border-box; padding: 11px;
  border: 1px solid #dce5de; border-radius: 8px;
}
.acoes-modal { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
.acoes-modal button { padding: 9px 15px; border: 0; border-radius: 8px; cursor: pointer; }
.acoes-modal .confirmar { background: #2b4532; color: white; }

@media (max-width: 1050px) {
  .kanban-area { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kanban-coluna { min-height: 300px; }
}
@media (max-width: 600px) {
  .kanban-pagina { padding: 12px; }
  .projeto-header { align-items: flex-start; flex-wrap: wrap; }
  .projeto-header h1 { font-size: 21px; }
  .resumo { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .toolbar select { flex: 1; min-width: 0; }
  .kanban-area { grid-template-columns: 1fr; }
  .kanban-coluna { min-height: 250px; }
}
</style>
