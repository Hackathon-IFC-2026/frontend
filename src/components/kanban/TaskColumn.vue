<template>
  <div
    class="kanban-coluna"
    :class="[coluna.classe, { 'arrastando-sobre': colunaSobreposta === coluna.id }]"
    @dragover.prevent
    @dragenter.prevent="$emit('dragenter', coluna.id)"
    @dragleave="$emit('dragleave', $event, coluna.id)"
    @drop.prevent="$emit('drop', $event, coluna.id)"
  >
    <header class="coluna-header">
      <div class="coluna-nome">
        <span class="indicador"></span>
        <h2>{{ coluna.nome }}</h2>
        <span class="contador">{{ tarefas.length }}</span>
      </div>
      <button
        v-if="coluna.id !== 'atrasado'"
        class="btn-add-coluna"
        title="Adicionar tarefa"
        @click="$emit('adicionar-tarefa', coluna.id)"
      >+</button>
      <span v-else class="btn-add-placeholder"></span>
    </header>

    <div class="lista-cards">
      <TaskCard
        v-for="tarefa in tarefas"
        :key="tarefa.id"
        :tarefa="tarefa"
        :pode-arrastar="podeGerenciar(tarefa)"
        :responsaveis="obterResponsaveis(tarefa)"
        @dragstart="$emit('iniciar-arrasto', $event, tarefa)"
        @dragend="$emit('finalizar-arrasto')"
        @click="$emit('selecionar-tarefa', tarefa.id)"
      />

      <div v-if="!tarefas.length" class="coluna-vazia">
        Nenhuma tarefa nesta etapa
      </div>
      <button
        v-if="coluna.id !== 'atrasado'"
        class="adicionar-rodape"
        @click="$emit('adicionar-tarefa', coluna.id)"
      >+ Adicionar tarefa</button>
    </div>
  </div>
</template>

<script setup>
import TaskCard from './TaskCard.vue'

defineProps({
  coluna: {
    type: Object,
    required: true
  },
  tarefas: {
    type: Array,
    default: () => []
  },
  colunaSobreposta: {
    type: String,
    default: null
  },
  podeGerenciar: {
    type: Function,
    default: () => true
  },
  obterResponsaveis: {
    type: Function,
    default: () => []
  }
})

defineEmits([
  'dragenter',
  'dragleave',
  'drop',
  'adicionar-tarefa',
  'selecionar-tarefa',
  'iniciar-arrasto',
  'finalizar-arrasto'
])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.kanban-coluna {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 350px;
  border: 1px solid #e8ede9;
  border-radius: 11px;
  background: #f4f6f4;
  overflow: hidden;
  font-family: Poppins, sans-serif;
}

.kanban-coluna.arrastando-sobre {
  background: #e5efe7;
  outline: 2px dashed #4e7855;
  outline-offset: -2px;
}

.coluna-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  min-height: 46px;
  padding: 0 11px;
  box-sizing: border-box;
  border-bottom: 1px solid #e5eae6;
}

.coluna-nome {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.coluna-nome h2 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.indicador {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

.coluna-atrasado .indicador { background: #e77d80; }
.coluna-fazer .indicador { background: #a6adb0; }
.coluna-andamento .indicador { background: #a58cdb; }
.coluna-concluido .indicador { background: #6eb985; }

.contador {
  padding: 2px 7px;
  border-radius: 20px;
  background: #e6ebe7;
  color: #66796b;
  font-size: 10px;
}

.btn-add-coluna,
.btn-add-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  flex-shrink: 0;
}

.btn-add-coluna {
  border: 0;
  background: transparent;
  color: #587461;
  font-size: 22px;
  cursor: pointer;
}

.lista-cards {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 9px;
  padding: 10px;
  min-width: 0;
}

.coluna-vazia {
  padding: 24px 8px;
  color: #a3afa6;
  text-align: center;
  font-size: 11px;
}

.adicionar-rodape {
  margin-top: auto;
  padding: 10px;
  border: 1px dashed #d3ded5;
  border-radius: 8px;
  background: transparent;
  color: #67836e;
  font: 11px Poppins, sans-serif;
  cursor: pointer;
}
</style>

