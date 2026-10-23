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
  background-color: rgba(220, 220, 220, 0.2); /* #DCDCDC 20% */
  border-radius: 16px;
  padding: 18px 16px 20px;
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
  width: 100%;
  align-self: flex-start;
}

.titulo-participantes {
  margin: 0 0 16px 0;
  text-align: center;
  font-size: 1.02rem;
  font-weight: 600;
  color: #000000;
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
  gap: 10px;
}

.avatar-participante {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #4e7855;
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
  font-size: 0.78rem;
  font-weight: 500;
  color: #4e7855;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.acao-participantes {
  margin-top: 22px;
  display: flex;
  justify-content: center;
}

.btn-adicionar-participante {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: #ffffff;
  color: #4e7855;
  border: 1px solid #4e7855;
  border-radius: 999px;
  padding: 5px 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.btn-adicionar-participante:hover {
  background-color: #4e7855;
  color: #ffffff;
}

.icone-mais {
  font-size: 0.9rem;
  line-height: 1;
  font-weight: 400;
}
</style>

