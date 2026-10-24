<template>
  <main class="kanban-pagina">
    <KanbanHeader
      v-if="isMember"
      :projeto="projeto"
      :indicadores="indicadores"
      :participantes="participantes"
      v-model:busca="busca"
      v-model:filtro-prioridade="filtroPrioridade"
      v-model:filtro-participante="filtroParticipante"
      @criar-tarefa="abrirCadastro()"
    />

    <p v-if="!isMember" class="acesso-revogado" role="status">
      {{ projectHistoryStore.sucesso || 'Você não participa mais deste projeto ou não tem acesso.' }}
      <RouterLink to="/projetos">Voltar aos projetos</RouterLink>
      <span v-if="projectHistoryStore.erro" class="mensagem-erro">
        {{ projectHistoryStore.erro }}
      </span>
    </p>

    <p v-if="isMember && erro" class="mensagem-erro" role="alert">{{ erro }}</p>

    <section v-if="isMember" class="kanban-area">
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
      v-if="isMember"
      :participantes="participantes"
      :creator-id="creatorId"
      :current-user-id="usuarioAtual.id"
      :is-creator="isAdmin"
      :is-member="isMember"
      :loading="projectHistoryStore.operacaoEmAndamento"
      :success="projectHistoryStore.sucesso"
      :error="projectHistoryStore.erro"
      @abrir-modal="modalParticipanteAberto = true"
      @remover-participante="removerParticipante"
      @sair-projeto="sairDoProjeto"
    />

    <CreateTaskModal
      v-if="isMember"
      v-model="modalCadastroAberto"
      :projeto-id="projetoId"
      :participantes="participantes"
      :status-inicial="statusInicial"
      @created="tarefaCriada"
    />

    <Transition name="task-popup">
      <TaskDetails
        v-if="isMember && tarefaSelecionada !== null"
        :task-id="tarefaSelecionada"
        :usuario-atual-id="usuarioAtual.id"
        :is-admin="isAdmin"
        @close="tarefaSelecionada = null"
        @updated="atualizarQuadro"
        @deleted="atualizarQuadro"
      />
    </Transition>

    <ParticipantModal
      v-if="isMember"
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
  creatorId,
  isMember,
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
  removerParticipante,
  sairDoProjeto,
  projectHistoryStore,
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
  margin: 0 auto;
  padding: 28px 32px 48px;
  box-sizing: border-box;
  font-family: Poppins, sans-serif;
  color: #24372a;
}

.kanban-area {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  align-items: stretch;
}

.mensagem-erro {
  color: #c0392b;
  font-size: 12px;
}

.acesso-revogado {
  display: grid;
  justify-items: start;
  gap: 12px;
  padding: 24px;
  border: 1px solid #e5ebe6;
  border-radius: 12px;
  background: #fff;
  color: #68756a;
}

.acesso-revogado a {
  color: #315e3b;
  font-weight: 600;
}

.task-popup-enter-active,
.task-popup-leave-active {
  transition: opacity 220ms ease;
}

.task-popup-enter-from,
.task-popup-leave-to {
  opacity: 0;
}

.task-popup-enter-active :deep(.task-modal),
.task-popup-leave-active :deep(.task-modal) {
  transition: opacity 220ms ease, transform 220ms ease;
}

.task-popup-enter-from :deep(.task-modal),
.task-popup-leave-to :deep(.task-modal) {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .task-popup-enter-active,
  .task-popup-leave-active,
  .task-popup-enter-active :deep(.task-modal),
  .task-popup-leave-active :deep(.task-modal) {
    transition: none;
  }
}

@media (max-width: 1050px) {
  .kanban-area {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .kanban-pagina {
    padding: 20px 16px 32px;
  }
  .kanban-area {
    grid-template-columns: 1fr;
  }
}
</style>
