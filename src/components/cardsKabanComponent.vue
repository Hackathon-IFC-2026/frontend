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

      <IndicadorPrioridade :prioridade="tarefa.prioridade" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import IndicadorPrioridade from '@/components/IndicadorPrioridade.vue'

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
  border-radius: 12px;
  padding: 12px 14px 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  font-family: 'Poppins', sans-serif;
  cursor: grab;
  user-select: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  box-sizing: border-box;
  width: 100%;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
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
  margin: 0 0 4px 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: #000000;
  line-height: 1.25;
  word-break: break-word;
}

.card-datas {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.data-linha {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.65rem;
  font-weight: 400;
  color: #999999;
}

.icone-calendario {
  font-size: 11px;
  color: #999999;
  line-height: 1;
}

.card-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 6px;
}

.avatares-tarefa {
  display: flex;
  align-items: center;
  gap: 4px;
}

.avatar-circulo {
  width: 14px;
  height: 14px;
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

</style>
