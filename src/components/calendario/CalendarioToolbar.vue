<template>
  <div class="calendario-toolbar-wrapper">
    <div class="navegacao-mes">
      <div class="mes-titulo-acoes">
        <h2>{{ nomeMesAno }}</h2>
        <div class="controles-mes">
          <button
            class="btn-seta"
            title="Mês anterior"
            @click="$emit('mes-anterior')"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            class="btn-seta"
            title="Próximo mês"
            @click="$emit('mes-seguinte')"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
          <button
            class="btn-hoje"
            @click="$emit('ir-hoje')"
          >
            Hoje
          </button>
        </div>
      </div>
    </div>

    <div class="filtros-linha">
      <div class="filtros-esquerda">
        <div class="campo-busca">
          <span class="material-symbols-outlined">search</span>
          <input
            :value="busca"
            placeholder="Buscar tarefa..."
            @input="$emit('update:busca', $event.target.value)"
          />
        </div>

        <FiltroDropdown
          class="filtro-calendario"
          :model-value="filtroProjeto"
          :options="opcoesProjetos"
          label="Filtrar por projeto"
          compacto
          @update:model-value="$emit('update:filtroProjeto', $event)"
        />

        <FiltroDropdown
          class="filtro-calendario"
          :model-value="filtroStatus"
          :options="opcoesStatus"
          label="Filtrar por status"
          compacto
          @update:model-value="$emit('update:filtroStatus', $event)"
        />

        <FiltroDropdown
          class="filtro-calendario"
          :model-value="filtroPrioridade"
          :options="opcoesPrioridade"
          label="Filtrar por prioridade"
          compacto
          @update:model-value="$emit('update:filtroPrioridade', $event)"
        />

        <FiltroDropdown
          class="filtro-calendario"
          :model-value="filtroParticipante"
          :options="opcoesParticipantes"
          label="Filtrar por responsável"
          compacto
          @update:model-value="$emit('update:filtroParticipante', $event)"
        />
      </div>

      <div class="contador-mes">
        <span>{{ totalTarefasNoMes }} {{ totalTarefasNoMes === 1 ? 'tarefa' : 'tarefas' }} neste mês</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FiltroDropdown from '@/components/shared/FiltroDropdown.vue'

const props = defineProps({
  nomeMesAno: {
    type: String,
    required: true
  },
  busca: {
    type: String,
    default: ''
  },
  filtroProjeto: {
    type: String,
    default: 'todos'
  },
  filtroStatus: {
    type: String,
    default: 'todos'
  },
  filtroPrioridade: {
    type: String,
    default: 'todas'
  },
  filtroParticipante: {
    type: String,
    default: 'todos'
  },
  projetos: {
    type: Array,
    default: () => []
  },
  participantes: {
    type: Array,
    default: () => []
  },
  totalTarefasNoMes: {
    type: Number,
    default: 0
  }
})

const opcoesProjetos = computed(() => [
  { value: 'todos', label: 'Todos os projetos', tom: 'neutro' },
  ...props.projetos.map((projeto) => ({
    value: String(projeto.id),
    label: projeto.nome,
    tom: 'neutro',
  })),
])

const opcoesStatus = [
  { value: 'todos', label: 'Todos os status', tom: 'neutro' },
  { value: 'a_fazer', label: 'A fazer', tom: 'a_fazer' },
  { value: 'em_andamento', label: 'Em andamento', tom: 'em_andamento' },
  { value: 'concluido', label: 'Concluído', tom: 'concluido' },
]

const opcoesPrioridade = [
  { value: 'todas', label: 'Todas as prioridades', tom: 'neutro' },
  { value: 'alta', label: 'Alta', tom: 'alta' },
  { value: 'media', label: 'Média', tom: 'media' },
  { value: 'baixa', label: 'Baixa', tom: 'baixa' },
]

const opcoesParticipantes = computed(() => [
  { value: 'todos', label: 'Todos os responsáveis', tom: 'neutro' },
  ...props.participantes.map((participante) => ({
    value: String(participante.id),
    label: participante.nome,
    tom: 'neutro',
  })),
])

defineEmits([
  'mes-anterior',
  'mes-seguinte',
  'ir-hoje',
  'update:busca',
  'update:filtroProjeto',
  'update:filtroStatus',
  'update:filtroPrioridade',
  'update:filtroParticipante'
])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.calendario-toolbar-wrapper {
  margin-bottom: 16px;
  font-family: Poppins, sans-serif;
}

.navegacao-mes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.mes-titulo-acoes {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mes-titulo-acoes h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #26372d;
}

.controles-mes {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-seta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #e4eae6;
  border-radius: 6px;
  background: white;
  color: #587461;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.btn-seta:hover {
  background: #f4f7f5;
  border-color: #b7c8bc;
}

.btn-seta .material-symbols-outlined {
  font-size: 18px;
}

.btn-hoje {
  padding: 4px 12px;
  border: 1px solid #e4eae6;
  border-radius: 6px;
  background: white;
  color: #26372d;
  font: 500 11px Poppins, sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-hoje:hover {
  background: #f4f7f5;
}

.filtros-linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.filtros-esquerda {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.filtros-esquerda > .filtro-calendario {
  flex: 0 1 170px;
  width: auto;
}

.campo-busca {
  display: flex;
  flex: 1 1 170px;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 11px;
  background: white;
  border: 1px solid #d4dfd5;
  border-radius: 9px;
  box-shadow: 0 2px 7px rgba(26, 55, 33, 0.04);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.campo-busca:focus-within {
  border-color: #4e7855;
  box-shadow: 0 0 0 3px rgba(78, 120, 85, 0.14);
  min-width: 170px;
}

.campo-busca .material-symbols-outlined {
  font-size: 18px;
  color: #7b8981;
}

.campo-busca input {
  min-width: 0;
  padding: 8px 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1a3721;
  font: 0.8rem Poppins, sans-serif;
  width: 100%;
}

.contador-mes {
  font-size: 11px;
  color: #7b8981;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .filtros-linha {
    flex-direction: column;
    align-items: flex-start;
  }
  .contador-mes {
    align-self: flex-end;
  }
}
</style>
