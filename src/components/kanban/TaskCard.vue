<template>
  <div
    class="task-card"
    :draggable="podeArrastar"
    @dragstart="$emit('dragstart', $event)"
    @dragend="$emit('dragend', $event)"
    @click="$emit('click')"
  >
    <div class="card-topo">
      <span class="prioridade" :class="tarefa.prioridade">
        {{ labelPrioridade }}
      </span>
      <span class="task-id">#{{ tarefa.id }}</span>
    </div>

    <div v-if="estaAtrasada" class="tag-atrasada">
      <span class="material-symbols-outlined">warning</span>
      Tarefa atrasada!
    </div>

    <h3>{{ tarefa.titulo }}</h3>
    <p v-if="tarefa.descricao" class="card-descricao">{{ tarefa.descricao }}</p>

    <div class="card-rodape">
      <div class="avatares">
        <span
          v-for="pessoa in responsaveis.slice(0, 3)"
          :key="pessoa.id"
          class="avatar"
          :title="pessoa.nome"
        >{{ pessoa.nome.charAt(0).toUpperCase() }}</span>
        <span v-if="responsaveis.length > 3" class="avatar mais">
          +{{ responsaveis.length - 3 }}
        </span>
      </div>
      <span v-if="tarefa.prazo" class="prazo">
        <span class="material-symbols-outlined">calendar_today</span>
        {{ formatarPrazo(tarefa.prazo) }}
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
  },
  podeArrastar: {
    type: Boolean,
    default: true
  },
  responsaveis: {
    type: Array,
    default: () => []
  }
})

defineEmits(['dragstart', 'dragend', 'click'])

const labelPrioridade = computed(() => {
  const map = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }
  return map[props.tarefa.prioridade] || props.tarefa.prioridade
})

function formatarPrazo(data) {
  if (!data) return ''
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

const estaAtrasada = computed(() => {
  if (!props.tarefa.prazo || props.tarefa.status === 'concluido') return false
  const agora = new Date()
  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
  return props.tarefa.prazo.slice(0, 10) < hoje
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.task-card {
  min-width: 0;
  padding: 12px;
  border: 1px solid #e1e7e2;
  border-radius: 9px;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(22, 45, 28, 0.025);
  transition: transform 0.15s, box-shadow 0.15s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(22, 45, 28, 0.09);
}

.card-topo,
.card-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.card-topo {
  margin-bottom: 9px;
}

.prioridade {
  padding: 3px 7px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 600;
}

.prioridade.alta {
  background: #fff0ed;
  color: #c25a49;
}

.prioridade.media {
  background: #fff5dc;
  color: #ac812b;
}

.prioridade.baixa {
  background: #e8f5ec;
  color: #468358;
}

.task-id {
  color: #a2ada5;
  font-size: 10px;
}

.tag-atrasada {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  padding: 3px 8px;
  border-radius: 5px;
  background: #fde8e8;
  color: #c81e1e;
  font-size: 10px;
  font-weight: 700;
}

.tag-atrasada .material-symbols-outlined {
  font-size: 13px;
}

.task-card h3 {
  margin: 0 0 6px;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.card-descricao {
  margin: 0 0 10px;
  color: #849087;
  font-size: 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-rodape {
  margin-top: 12px;
  flex-wrap: wrap;
}

.avatares {
  display: flex;
  align-items: center;
  padding-left: 5px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  margin-left: -5px;
  border: 2px solid white;
  border-radius: 50%;
  background: #dfece2;
  color: #3d6a48;
  font-size: 10px;
  font-weight: 700;
}

.avatar.mais {
  background: #edf0ee;
  color: #66776b;
}

.prazo {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #89958c;
  font-size: 10px;
  white-space: nowrap;
}

.prazo .material-symbols-outlined {
  font-size: 14px;
}
</style>

