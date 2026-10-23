<template>
  <main class="kanban-pagina">
    <KanbanHeader
      :projeto="projeto"
      :indicadores="indicadores"
      :participantes="participantes"
      v-model:busca="busca"
      v-model:filtro-prioridade="filtroPrioridade"
      v-model:filtro-participante="filtroParticipante"
      @criar-tarefa="abrirCadastro()"
    />

    <p v-if="erro" class="mensagem-erro">{{ erro }}</p>

    <section class="kanban-area">
      <TaskColumn
        v-for="coluna in colunas"
        :key="coluna.id"
        :coluna="coluna"
        :tarefas="tarefasDaColuna(coluna.id)"
        :coluna-sobreposta="colunaSobreposta"
        :pode-gerenciar="podeGerenciar"
        :obter-responsaveis="responsaveisDaTarefa"
        @dragenter="colunaSobreposta = coluna.id"
        @dragleave="sairDaColuna($event, coluna.id)"
        @drop="soltarTarefa($event, coluna.id)"
        @adicionar-tarefa="abrirCadastro"
        @selecionar-tarefa="abrirDetalhes"
        @iniciar-arrasto="iniciarArrasto"
        @finalizar-arrasto="finalizarArrasto"
      />
    </section>

    <KanbanParticipants
      :participantes="participantes"
      @abrir-modal="modalParticipanteAberto = true"
    />

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

    <ParticipantModal
      v-model="modalParticipanteAberto"
      @adicionar="onAdicionarParticipante"
    />
  </main>
</template>

<script setup>
import { useTaskCrud } from '@/composables/useTaskCrud'
import KanbanHeader from '@/components/kanban/KanbanHeader.vue'
import TaskColumn from '@/components/kanban/TaskColumn.vue'
import KanbanParticipants from '@/components/kanban/KanbanParticipants.vue'
import ParticipantModal from '@/components/kanban/ParticipantModal.vue'
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue'
import TaskDetails from '@/components/tasks/TaskDetails.vue'

const {
  projetoId,
  usuarioAtual,
  isAdmin,
  projeto,
  participantes,
  colunas,
  busca,
  filtroPrioridade,
  filtroParticipante,
  erro,
  modalCadastroAberto,
  modalParticipanteAberto,
  tarefaSelecionada,
  statusInicial,
  colunaSobreposta,
  responsaveisDaTarefa,
  indicadores,
  tarefasDaColuna,
  podeGerenciar,
  abrirCadastro,
  abrirDetalhes,
  tarefaCriada,
  atualizarQuadro,
  iniciarArrasto,
  finalizarArrasto,
  sairDaColuna,
  soltarTarefa,
  adicionarParticipante,
  novoParticipante
} = useTaskCrud()

function onAdicionarParticipante(nome) {
  novoParticipante.value = nome
  adicionarParticipante()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.kanban-pagina {
  width: 100%;
  max-width: 1600px;
  margin: auto;
  padding: 12px 16px;
  box-sizing: border-box;
  font-family: Poppins, sans-serif;
  color: #24372a;
}

.kanban-area {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  align-items: stretch;
}

.mensagem-erro {
  color: #c0392b;
  font-size: 12px;
}

@media (max-width: 1050px) {
  .kanban-area {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .kanban-pagina {
    padding: 12px;
  }
  .kanban-area {
    grid-template-columns: 1fr;
  }
}
</style>
