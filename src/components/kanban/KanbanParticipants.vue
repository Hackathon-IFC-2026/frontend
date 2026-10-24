<template>
  <section class="participantes-area">
    <div class="participantes-topo">
      <div>
        <h2>Participantes <span>{{ participantes.length }}</span></h2>
        <p>Equipe deste projeto</p>
      </div>
      <button @click="$emit('abrir-modal')">
        <span class="material-symbols-outlined">person_add</span>
        Adicionar
      </button>
    </div>
    <div class="participantes-lista">
      <div v-for="pessoa in participantes" :key="pessoa.id" class="participante-item">
        <span class="participante-avatar">{{ pessoa.nome.charAt(0).toUpperCase() }}</span>
        <span>{{ pessoa.nome }}</span>
      </div>
      <p v-if="!participantes.length" class="sem-participantes">
        Nenhum participante adicionado.
      </p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  participantes: {
    type: Array,
    default: () => []
  }
})

defineEmits(['abrir-modal'])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.participantes-area {
  margin-top: 12px;
  padding: 12px 15px;
  border: 1px solid #e5ebe6;
  border-radius: 11px;
  background: white;
  font-family: Poppins, sans-serif;
}

.participantes-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.participantes-topo h2 {
  margin: 0;
  font-size: 13px;
  color: #24372a;
}

.participantes-topo h2 span {
  margin-left: 5px;
  color: #8b9a90;
  font-weight: 500;
}

.participantes-topo p {
  margin: 2px 0 0;
  color: #9aa79d;
  font-size: 10px;
}

.participantes-topo button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 11px;
  border: 1px solid #cbdacf;
  border-radius: 7px;
  background: #f5f9f6;
  color: #3d6947;
  font: 600 11px Poppins, sans-serif;
  cursor: pointer;
  transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
}

.participantes-topo button:hover {
  transform: translateY(-1px);
  border-color: #a9c3ad;
  background: #eaf3ec;
}

.participantes-topo .material-symbols-outlined {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.participantes-topo button:hover .material-symbols-outlined {
  transform: rotate(12deg) scale(1.08);
}

.participantes-lista {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.participante-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px 5px 5px;
  border: 1px solid #e5ebe6;
  border-radius: 25px;
  font-size: 11px;
  color: #465c4b;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.participante-item:hover {
  transform: translateY(-2px);
  border-color: #c5d8c8;
  box-shadow: 0 4px 10px rgba(22, 45, 28, 0.07);
}

.participante-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0ece3;
  color: #3e7049;
  font-size: 10px;
  font-weight: 700;
  transition: transform 0.18s ease;
}

.participante-item:hover .participante-avatar {
  transform: scale(1.08);
}

@media (prefers-reduced-motion: reduce) {
  .participantes-topo button,
  .participantes-topo .material-symbols-outlined,
  .participante-item,
  .participante-avatar {
    transition: none;
  }
}

.sem-participantes {
  margin: 0;
  color: #94a198;
  font-size: 11px;
}
</style>
