<template>
  <main class="calendario-pagina">
    <CalendarioHeader
      :projeto-nome="nomeProjetoAtivo"
      :indicadores="indicadores"
    />

    <CalendarioToolbar
      :nome-mes-ano="nomeMesAno"
      v-model:busca="busca"
      v-model:filtro-projeto="filtroProjeto"
      v-model:filtro-status="filtroStatus"
      v-model:filtro-prioridade="filtroPrioridade"
      v-model:filtro-participante="filtroParticipante"
      :projetos="projetos"
      :participantes="participantes"
      :total-tarefas-no-mes="totalTarefasNoMes"
      @mes-anterior="mesAnterior"
      @mes-seguinte="mesSeguinte"
      @ir-hoje="irParaHoje"
    />

    <CalendarioGrid
      :dias="diasDoMes"
      @clicar-tarefa="abrirTarefaNoKanban"
    />

    <CalendarioLegend />
  </main>
</template>

<script setup>
import { useCalendario } from '@/composables/useCalendario'
import CalendarioHeader from '@/components/calendario/CalendarioHeader.vue'
import CalendarioToolbar from '@/components/calendario/CalendarioToolbar.vue'
import CalendarioGrid from '@/components/calendario/CalendarioGrid.vue'
import CalendarioLegend from '@/components/calendario/CalendarioLegend.vue'

const {
  nomeMesAno,
  busca,
  filtroProjeto,
  filtroStatus,
  filtroPrioridade,
  filtroParticipante,
  projetos,
  participantes,
  nomeProjetoAtivo,
  indicadores,
  totalTarefasNoMes,
  diasDoMes,
  mesAnterior,
  mesSeguinte,
  irParaHoje,
  abrirTarefaNoKanban
} = useCalendario()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.calendario-pagina {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: Poppins, sans-serif;
  color: #26372d;
}
</style>
