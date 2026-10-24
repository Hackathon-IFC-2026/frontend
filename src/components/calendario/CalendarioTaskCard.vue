<template>
  <div
    class="mini-card-tarefa"
    :class="statusClass"
    :title="tarefa.titulo + ' (' + statusLabel + ')'"
    @click.stop="$emit('click', tarefa)"
  >
    <div class="card-linha-titulo">
      <span class="titulo-tarefa">{{ tarefa.titulo }}</span>
    </div>
    <div class="card-linha-detalhes">
      <span class="status-texto">{{ statusLabel }}</span>
      <span class="badge-prioridade" :class="tarefa.prioridade">
        {{ prioridadeLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tarefa: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const statusLabel = computed(() => {
  const map = {
    a_fazer: 'A fazer',
    em_andamento: 'Em andamento',
    concluido: 'Concluído'
  }
  return map[props.tarefa.status] || props.tarefa.status
})

const statusClass = computed(() => {
  return `status-${props.tarefa.status}`
})

const prioridadeLabel = computed(() => {
  const map = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }
  return map[props.tarefa.prioridade] || props.tarefa.prioridade
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.mini-card-tarefa {
  padding: 6px 8px;
  border-radius: 6px;
  background: white;
  border: 1px solid #e1e7e2;
  cursor: pointer;
  margin-top: 4px;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  font-family: Poppins, sans-serif;
  text-align: left;
}

.mini-card-tarefa:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.card-linha-titulo {
  margin-bottom: 4px;
}

.titulo-tarefa {
  font-size: 11px;
  font-weight: 600;
  color: #26372d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.card-linha-detalhes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.status-texto {
  font-size: 9px;
  color: #7b8981;
}

.badge-prioridade {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
}

.badge-prioridade.alta {
  color: #c25a49;
  background: #fff0ed;
}

.badge-prioridade.media {
  color: #ac812b;
  background: #fff5dc;
}

.badge-prioridade.baixa {
  color: #468358;
  background: #e8f5ec;
}

/* Variações de Status */
.status-a_fazer {
  background: #f8faf8;
  border: 1px solid #e1e7e2;
  border-left: 3px solid #b7c8bc;
}

.status-em_andamento {
  background: #f8f5fe;
  border: 1px solid #ede8fa;
  border-left: 3px solid #8c68cd;
}

.status-concluido {
  background: #f2f9f4;
  border: 1px solid #e2efe5;
  border-left: 3px solid #477555;
}
</style>

