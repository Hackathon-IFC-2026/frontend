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

        <select
          :value="filtroProjeto"
          class="select-filtro"
          @change="$emit('update:filtroProjeto', $event.target.value)"
        >
          <option value="todos">Todos os projetos</option>
          <option
            v-for="proj in projetos"
            :key="proj.id"
            :value="String(proj.id)"
          >
            {{ proj.nome }}
          </option>
        </select>

        <select
          :value="filtroStatus"
          class="select-filtro"
          @change="$emit('update:filtroStatus', $event.target.value)"
        >
          <option value="todos">Todos os status</option>
          <option value="a_fazer">A fazer</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
        </select>

        <select
          :value="filtroPrioridade"
          class="select-filtro"
          @change="$emit('update:filtroPrioridade', $event.target.value)"
        >
          <option value="todas">Todas as prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        <select
          :value="filtroParticipante"
          class="select-filtro"
          @change="$emit('update:filtroParticipante', $event.target.value)"
        >
          <option value="todos">Responsáveis</option>
          <option
            v-for="resp in participantes"
            :key="resp.id"
            :value="String(resp.id)"
          >
            {{ resp.nome }}
          </option>
        </select>
      </div>

      <div class="contador-mes">
        <span>{{ totalTarefasNoMes }} {{ totalTarefasNoMes === 1 ? 'tarefa' : 'tarefas' }} neste mês</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
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

.campo-busca {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  background: white;
  border: 1px solid #e4eae6;
  border-radius: 8px;
  min-width: 170px;
}

.campo-busca .material-symbols-outlined {
  font-size: 18px;
  color: #7b8981;
}

.campo-busca input {
  padding: 8px 0;
  border: 0;
  outline: 0;
  font: 12px Poppins, sans-serif;
  color: #26372d;
  width: 100%;
}

.select-filtro {
  padding: 8px 10px;
  background: white;
  border: 1px solid #e4eae6;
  border-radius: 8px;
  font: 11px Poppins, sans-serif;
  color: #26372d;
  cursor: pointer;
  outline: 0;
}

.select-filtro:focus {
  border-color: #244631;
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

