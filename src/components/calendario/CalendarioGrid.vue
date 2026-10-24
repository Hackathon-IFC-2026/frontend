<template>
  <div class="calendario-grade-container">
    <div class="dias-semana-header">
      <div
        v-for="diaSemana in diasSemana"
        :key="diaSemana"
        class="coluna-semana-nome"
      >
        {{ diaSemana }}
      </div>
    </div>

    <div class="grade-dias">
      <div
        v-for="(dia, idx) in dias"
        :key="dia.dataStr + '-' + idx"
        class="celula-dia"
        :class="{
          'outro-mes': dia.outroMes,
          'dia-hoje': dia.eHoje
        }"
      >
        <div class="celula-topo">
          <div v-if="dia.eHoje" class="badge-hoje-container">
            <span class="badge-hoje-numero">{{ dia.numeroFormatado }}</span>
            <span class="badge-hoje-label">Hoje</span>
          </div>
          <span v-else class="numero-dia">
            {{ dia.numeroFormatado }}
          </span>
        </div>

        <div class="celula-tarefas">
          <CalendarioTaskCard
            v-for="tarefa in dia.tarefas"
            :key="tarefa.id"
            :tarefa="tarefa"
            @click="$emit('clicar-tarefa', tarefa)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CalendarioTaskCard from './CalendarioTaskCard.vue'

defineProps({
  dias: {
    type: Array,
    required: true
  }
})

defineEmits(['clicar-tarefa'])

const diasSemana = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.calendario-grade-container {
  background: white;
  border: 1px solid #e4eae6;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  font-family: Poppins, sans-serif;
}

.dias-semana-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  background: #fafbfa;
  border-bottom: 1px solid #e4eae6;
}

.coluna-semana-nome {
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #587461;
  text-align: left;
}

.grade-dias {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.celula-dia {
  min-height: 110px;
  border-right: 1px solid #e4eae6;
  border-bottom: 1px solid #e4eae6;
  padding: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: white;
  transition: background-color 0.1s ease;
}

.celula-dia:nth-child(7n) {
  border-right: none;
}

.celula-dia.outro-mes {
  background: #fafbfa;
}

.celula-dia.outro-mes .numero-dia {
  color: #b4beb7;
}

.celula-dia.dia-hoje {
  background: #f7faf8;
}

.celula-topo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 6px;
}

.numero-dia {
  font-size: 11px;
  font-weight: 500;
  color: #587461;
}

.badge-hoje-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.badge-hoje-numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #244631;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
}

.badge-hoje-label {
  font-size: 10px;
  font-weight: 600;
  color: #477555;
  margin-right: 4px;
}

.celula-tarefas {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

@media (max-width: 900px) {
  .coluna-semana-nome {
    font-size: 10px;
    padding: 8px 4px;
    text-align: center;
  }
  .celula-dia {
    min-height: 90px;
    padding: 6px 4px;
  }
}
</style>

