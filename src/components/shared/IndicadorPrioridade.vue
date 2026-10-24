<script setup>
import { computed } from 'vue'
import { normalizarPrioridade } from '@/utils/prioridadesTarefas'

const props = defineProps({
  prioridade: {
    type: String,
    default: 'Alta',
  },
  variante: {
    type: String,
    default: 'kanban',
    validator: (value) => ['kanban', 'tarefa'].includes(value),
  },
})

const classePrioridade = computed(() => {
  const prioridade = normalizarPrioridade(props.prioridade)
  if (prioridade === 'media') return 'prioridade-media'
  if (prioridade === 'baixa') return 'prioridade-baixa'
  return 'prioridade-alta'
})
</script>

<template>
  <span class="badge-prioridade" :class="[classePrioridade, `badge-${variante}`]">
    {{ prioridade || 'Alta' }}
  </span>
</template>

<style scoped>
.badge-prioridade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1.35;
  white-space: nowrap;
}

.badge-kanban {
  padding: 1px 12px;
}

.badge-tarefa {
  padding: 3px 10px;
}

.prioridade-alta {
  background-color: #ffd6d9;
  color: #ff334b;
}

.prioridade-media {
  background-color: #ffebd4;
  color: #e67300;
}

.prioridade-baixa {
  background-color: #fff2cc;
  color: #e6a800;
}
</style>
