<template>
  <footer class="calendario-legenda">
    <div class="status-pontos">
      <div class="item-legenda">
        <span class="ponto ponto-fazer"></span>
        <span class="texto">A fazer</span>
      </div>
      <div class="item-legenda">
        <span class="ponto ponto-andamento"></span>
        <span class="texto">Em andamento</span>
      </div>
      <div class="item-legenda">
        <span class="ponto ponto-concluido"></span>
        <span class="texto">Concluído</span>
      </div>
    </div>

    <div class="nota-informativa">
      <span class="material-symbols-outlined">info</span>
      <span>As tarefas aparecem na data de entrega.</span>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.calendario-legenda {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 4px 2px;
  font-family: Poppins, sans-serif;
  flex-wrap: wrap;
  gap: 12px;
}

.status-pontos {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-legenda {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ponto {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.ponto-fazer {
  background: #b7c8bc;
}

.ponto-andamento {
  background: #8c68cd;
}

.ponto-concluido {
  background: #477555;
}

.item-legenda .texto {
  font-size: 11px;
  color: #7b8981;
}

.nota-informativa {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #7b8981;
}

.nota-informativa .material-symbols-outlined {
  font-size: 16px;
  color: #7b8981;
}

@media (max-width: 600px) {
  .calendario-legenda {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

