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
  gap: 20px;
  margin-bottom: 20px;
}

.projeto-header h1 {
  margin: 0;
  color: #111827;
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.projeto-header p {
  margin: 8px 0 0;
  color: #68756a;
  font-size: 0.9rem;
}

.btn-criar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 9px;
  background: #1a3721;
  color: #f6e8d0;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn-criar:hover {
  transform: translateY(-1px);
  background: #234d2e;
}

.btn-criar:active {
  transform: translateY(0);
}

.btn-criar .material-symbols-outlined {
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.btn-criar:hover .material-symbols-outlined {
  transform: rotate(90deg);
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
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 11px;
  border: 1px solid #d4dfd5;
  border-radius: 9px;
  background: white;
  box-shadow: 0 2px 7px rgba(26, 55, 33, 0.04);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.campo-busca:focus-within {
  border-color: #4e7855;
  box-shadow: 0 0 0 3px rgba(78, 120, 85, 0.14);
  outline: none;
}

.campo-busca .material-symbols-outlined {
  font-size: 18px;
  color: #819187;
  transition: color 0.18s ease, transform 0.18s ease;
}

.campo-busca:focus-within .material-symbols-outlined {
  transform: scale(1.12);
  color: #4e7855;
}

@media (prefers-reduced-motion: reduce) {
  .btn-criar,
  .btn-criar .material-symbols-outlined,
  .campo-busca .material-symbols-outlined {
    transition: none;
  }

  .btn-criar:hover,
  .btn-criar:active,
  .btn-criar:hover .material-symbols-outlined {
    transform: none;
  }
}

.campo-busca input {
  width: 100%;
  min-width: 0;
  padding: 8px 0;
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
    font-size: 1.75rem;
  }
  .resumo {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .toolbar > .filtro-dropdown {
    flex: 1 1 0;
    min-width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-criar,
  .btn-criar .material-symbols-outlined {
    transition: none;
  }

  .btn-criar:hover,
  .btn-criar:active,
  .btn-criar:hover .material-symbols-outlined {
    transform: none;
  }
}
</style>
