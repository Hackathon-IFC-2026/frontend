<template>
  <div
    class="kanban-card"
    :class="{ 'is-dragging': arrastando }"
    draggable="true"
    @dragstart="aoIniciarArrasto"
    @dragend="aoFinalizarArrasto"
  >
    <h4 class="card-titulo" :title="tarefa.titulo || tarefa.nome">
      {{ tarefa.titulo || tarefa.nome || 'Título da tarefa' }}
    </h4>

    <div class="card-datas">
      <div class="data-linha">
        <span class="material-symbols-outlined icone-calendario">calendar_today</span>
        <span>Início: {{ tarefa.dataInicio || tarefa.data_inicio || '12/10/2020' }}</span>
      </div>
      <div class="data-linha">
        <span class="material-symbols-outlined icone-calendario">calendar_today</span>
        <span>Fim: {{ tarefa.dataFim || tarefa.data_fim || '12/10/2020' }}</span>
      </div>
    </div>

    <div class="card-rodape">
      <div class="avatares-tarefa">
        <div
          v-for="(membro, index) in participantesExibidos"
          :key="membro?.id || index"
          class="avatar-circulo"
          :title="membro?.nome || 'Participante'"
        >
          <img
            v-if="membro?.avatar"
            :src="membro.avatar"
            :alt="membro?.nome || 'Participante'"
          />
        </div>
      </div>

      <span class="badge-prioridade" :class="classePrioridade">
        {{ tarefa.prioridade || 'Alta' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tarefa: {
    type: Object,
    required: true,
    default: () => ({
      id: 1,
      titulo: 'Título da tarefa',
      dataInicio: '12/10/2020',
      dataFim: '12/10/2020',
      prioridade: 'Alta',
      coluna: 'fazer',
      participantes: [{}, {}],
    }),
  },
})

const emit = defineEmits(['dragstart-card', 'dragend-card'])

const arrastando = ref(false)

const classePrioridade = computed(() => {
  const valor = String(props.tarefa.prioridade || '').toLowerCase()
  if (valor.includes('alta')) return 'prioridade-alta'
  if (valor.includes('med') || valor.includes('méd')) return 'prioridade-media'
  if (valor.includes('baix')) return 'prioridade-baixa'
  return 'prioridade-alta'
})

const participantesExibidos = computed(() => {
  if (Array.isArray(props.tarefa.participantes) && props.tarefa.participantes.length > 0) {
    return props.tarefa.participantes.slice(0, 3)
  }
  return [{}, {}]
})

function aoIniciarArrasto(event) {
  arrastando.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(props.tarefa.id))
  }
  emit('dragstart-card', props.tarefa)
}

function aoFinalizarArrasto() {
  arrastando.value = false
  emit('dragend-card', props.tarefa)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.kanban-card {
  background-color: #ffffff;
  border-radius: 14px;
  padding: 14px 14px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  font-family: 'Poppins', sans-serif;
  cursor: grab;
  user-select: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  box-sizing: border-box;
  width: 100%;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card.is-dragging {
  opacity: 0.55;
  transform: scale(0.98);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-titulo {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #000000;
  line-height: 1.3;
  word-break: break-word;
}

.card-datas {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 12px;
}

.data-linha {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 400;
  color: #999999;
}

.icone-calendario {
  font-size: 13px;
  color: #999999;
  line-height: 1;
}

.card-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.avatares-tarefa {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar-circulo {
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background-color: #d9d9d9;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-circulo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-prioridade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 14px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
}

/* Cores exatas da paleta (FF0000 100% sobre FF0000 30%) */
.prioridade-alta {
  background-color: rgba(255, 0, 0, 0.3);
  color: #ff0000;
}

.prioridade-media {
  background-color: rgba(255, 145, 0, 0.25);
  color: #e66a00;
}

.prioridade-baixa {
  background-color: rgba(255, 208, 0, 0.24);
  color: #f5b000;
}
</style>

