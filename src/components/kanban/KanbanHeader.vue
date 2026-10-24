<template>
  <header class="projeto-header">
    <div>
      <h1>{{ projeto.nome }}</h1>
      <p>{{ projeto.descricao }}</p>
    </div>
    <button class="btn-criar" @click="$emit('criar-tarefa')">
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
      <input
        :value="busca"
        placeholder="Buscar tarefas..."
        @input="$emit('update:busca', $event.target.value)"
      />
    </div>

    <FiltroDropdown
      :model-value="filtroPrioridade"
      :options="opcoesPrioridade"
      label="Filtrar tarefas por prioridade"
      compacto
      @update:model-value="$emit('update:filtroPrioridade', $event)"
    />

    <FiltroDropdown
      :model-value="filtroParticipante"
      :options="opcoesParticipantes"
      label="Filtrar tarefas por responsável"
      compacto
      @update:model-value="$emit('update:filtroParticipante', $event)"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import FiltroDropdown from '@/components/shared/FiltroDropdown.vue'

const props = defineProps({
  projeto: {
    type: Object,
    required: true
  },
  indicadores: {
    type: Array,
    default: () => []
  },
  participantes: {
    type: Array,
    default: () => []
  },
  busca: {
    type: String,
    default: ''
  },
  filtroPrioridade: {
    type: String,
    default: 'todas'
  },
  filtroParticipante: {
    type: String,
    default: 'todos'
  }
})

const opcoesPrioridade = [
  { value: 'todas', label: 'Todas as prioridades', tom: 'neutro' },
  { value: 'alta', label: 'Alta', tom: 'alta' },
  { value: 'media', label: 'Média', tom: 'media' },
  { value: 'baixa', label: 'Baixa', tom: 'baixa' },
]

const opcoesParticipantes = computed(() => [
  { value: 'todos', label: 'Todos os responsáveis', tom: 'neutro' },
  ...props.participantes.map((pessoa) => ({
    value: String(pessoa.id),
    label: pessoa.nome,
    tom: 'neutro',
  })),
])

defineEmits([
  'criar-tarefa',
  'update:busca',
  'update:filtroPrioridade',
  'update:filtroParticipante'
])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.projeto-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.projeto-header h1 {
  margin: 0;
  font-size: 23px;
  font-weight: 700;
}

.projeto-header p {
  margin: 3px 0 0;
  font-size: 11px;
  color: #849087;
}

.btn-criar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 15px;
  border: 0;
  border-radius: 9px;
  background: #2b4532;
  color: white;
  font: 600 12px Poppins, sans-serif;
  cursor: pointer;
  white-space: nowrap;
}

.btn-criar .material-symbols-outlined {
  font-size: 18px;
}

.resumo {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin-bottom: 11px;
}

.resumo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid #e5ebe6;
  border-radius: 9px;
  background: white;
}

.resumo-item span {
  font-size: 11px;
  color: #829086;
}

.resumo-item strong {
  font-size: 19px;
  font-weight: 700;
}

.toolbar {
  display: flex;
  gap: 9px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.toolbar > .filtro-dropdown {
  flex: 0 1 220px;
  width: auto;
}

.campo-busca {
  flex: 1;
  min-width: 170px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 1px solid #dce5de;
  border-radius: 8px;
  background: white;
}

.campo-busca .material-symbols-outlined {
  font-size: 18px;
  color: #819187;
}

.campo-busca input {
  width: 100%;
  padding: 9px 0;
  border: 0;
  outline: 0;
  font: 12px Poppins, sans-serif;
}

@media (max-width: 600px) {
  .projeto-header {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .projeto-header h1 {
    font-size: 21px;
  }
  .resumo {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .toolbar > .filtro-dropdown {
    flex: 1 1 0;
    min-width: 0;
  }
}
</style>
