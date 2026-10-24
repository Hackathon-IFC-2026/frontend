<template>
  <div class="calendario-header-wrapper">

    <div class="titulo-area">
      <h1>Calendário</h1>
      <p>Acompanhe os prazos e organize as entregas do projeto.</p>
    </div>

    <section class="resumo-cards">
      <div
        v-for="item in indicadores"
        :key="item.id"
        class="card-resumo"
      >
        <div class="icone-box" :class="item.classe">
          <span class="material-symbols-outlined">{{ item.icone }}</span>
        </div>
        <div class="info-box">
          <span class="label">{{ item.nome }}</span>
          <strong class="valor">{{ item.valor }}</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  projetoNome: {
    type: String,
    default: 'Natal Luz'
  },
  indicadores: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.calendario-header-wrapper {
  margin-bottom: 20px;
  font-family: Poppins, sans-serif;
}

.titulo-area h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #26372d;
}

.titulo-area p {
  margin: 4px 0 16px;
  font-size: 11px;
  color: #7b8981;
}

.resumo-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.card-resumo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e4eae6;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.icone-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
}

.icone-box .material-symbols-outlined {
  font-size: 20px;
}

.indicador-total {
  background: #eaf2ed;
  color: #244631;
}

.indicador-andamento {
  background: #f4f0ff;
  color: #7c3aed;
}

.indicador-concluido {
  background: #eaf5ed;
  color: #477555;
}

.indicador-atrasado {
  background: #fde8e8;
  color: #c81e1e;
}

.info-box {
  display: flex;
  flex-direction: column;
}

.info-box .label {
  font-size: 11px;
  color: #7b8981;
}

.info-box .valor {
  font-size: 20px;
  font-weight: 700;
  color: #26372d;
  line-height: 1.2;
}

@media (max-width: 900px) {
  .resumo-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 500px) {
  .resumo-cards {
    grid-template-columns: 1fr;
  }
}
</style>
