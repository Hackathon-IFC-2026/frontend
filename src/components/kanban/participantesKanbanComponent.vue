<template>
  <aside class="painel-participantes">
    <h3 class="titulo-participantes">Participantes</h3>

    <ul class="lista-participantes">
      <li
        v-for="(participante, index) in participantes"
        :key="participante.id || index"
        class="item-participante"
      >
        <div class="avatar-participante">
          <img
            v-if="participante.avatar"
            :src="participante.avatar"
            :alt="participante.nome"
          />
        </div>
        <span class="nome-participante" :title="participante.nome">
          {{ participante.nome || 'Fulano Ciclano' }}
        </span>
      </li>
    </ul>

    <div class="acao-participantes">
      <button
        type="button"
        class="btn-adicionar-participante"
        @click="$emit('adicionar')"
      >
        <span class="icone-mais">+</span>
        <span>Adicionar participante</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  participantes: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['adicionar'])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.painel-participantes {
  background-color: var(--theme-bg-ffffff, #ffffff);
  border-radius: 14px;
  padding: 18px 14px 16px;
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
  width: 100%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  align-self: flex-start;
}

.titulo-participantes {
  margin: 0 0 16px 0;
  text-align: left;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--theme-text-000000, #000000);
  padding-left: 2px;
}

.lista-participantes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-participante {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-participante {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--theme-border-718a77, #718a77);
  background-color: transparent;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-participante img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nome-participante {
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--theme-text-2b4532, #2b4532);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.acao-participantes {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.btn-adicionar-participante {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: transparent;
  color: var(--theme-text-3b5742, #3b5742);
  border: 1px solid var(--theme-border-718a77, #718a77);
  border-radius: 999px;
  padding: 2px 10px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.btn-adicionar-participante:hover {
  background-color: #3b5742;
  color: #ffffff;
}

.icone-mais {
  font-size: 0.8rem;
  line-height: 1;
  font-weight: 400;
}
</style>

