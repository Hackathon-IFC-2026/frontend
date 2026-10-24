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
      <button
        v-if="!isCreator && isMember"
        class="acao-sair"
        type="button"
        :disabled="loading"
        @click="$emit('sair-projeto')"
      >
        <span class="material-symbols-outlined">logout</span>
        Sair do projeto
      </button>
    </div>
    <div class="participantes-lista">
      <div
        v-for="pessoa in participantes"
        :key="pessoa.id"
        class="participante-item"
        :class="{ 'participante-atual': String(pessoa.id) === String(currentUserId) }"
      >
        <span class="participante-avatar">{{ pessoa.nome.charAt(0).toUpperCase() }}</span>
        <span>{{ pessoa.nome }}</span>
        <span
          v-if="String(pessoa.id) === String(currentUserId) && String(pessoa.id) !== String(creatorId)"
          class="etiqueta-atual"
        >
          Você
        </span>
        <span v-if="String(pessoa.id) === String(creatorId)" class="etiqueta-criador">
          Criador
        </span>
        <button
          v-if="isCreator && String(pessoa.id) !== String(creatorId)"
          class="remover-participante"
          type="button"
          :aria-label="`Remover ${pessoa.nome} do projeto`"
          :title="`Remover ${pessoa.nome} do projeto`"
          :disabled="loading"
          @click="$emit('remover-participante', pessoa)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">person_remove</span>
        </button>
      </div>
      <p v-if="!participantes.length" class="sem-participantes">
        Nenhum participante adicionado.
      </p>
    </div>
    <p v-if="success" class="feedback sucesso" role="status">{{ success }}</p>
    <p v-if="error" class="feedback erro" role="alert">{{ error }}</p>
    <p v-if="loading" class="feedback" role="status">Atualizando participantes...</p>
  </section>
  <p class="aviso-demonstracao" role="note">
    Demonstração local: alterações de participação e histórico duram apenas esta sessão,
    até existir suporte da API.
  </p>
</template>

<script setup>
defineProps({
  participantes: {
    type: Array,
    default: () => []
  },
  creatorId: {
    type: [Number, String],
    default: null
  },
  currentUserId: {
    type: [Number, String],
    default: null
  },
  isCreator: {
    type: Boolean,
    default: false
  },
  isMember: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  success: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
})

defineEmits(['abrir-modal', 'sair-projeto', 'remover-participante'])
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

.aviso-demonstracao {
  margin: 8px 0 0;
  color: #849087;
  font-size: 0.68rem;
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

.participantes-topo .acao-sair {
  border-color: #e5c5c5;
  background: #fff7f7;
  color: #a33c3c;
}

.participantes-topo .acao-sair:hover {
  border-color: #ddb0b0;
  background: #fff0f0;
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

.etiqueta-criador {
  padding: 2px 6px;
  border-radius: 12px;
  background: #edf4ee;
  color: #315e3b;
  font-size: 9px;
  font-weight: 600;
}

.remover-participante {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #fff0f0;
  color: #a33c3c;
  cursor: pointer;
  transition: background-color 0.18s ease, transform 0.18s ease;
}

.remover-participante:hover {
  transform: scale(1.08);
  background: #f9dddd;
}

.remover-participante:disabled,
.participantes-topo button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.remover-participante .material-symbols-outlined {
  font-size: 16px;
}

.feedback {
  margin: 10px 0 0;
  color: #68756a;
  font-size: 0.78rem;
}

.feedback.erro {
  color: #b42318;
}

.feedback.sucesso {
  color: #28713e;
}

.participante-item:hover .participante-avatar {
  transform: scale(1.08);
}

@media (prefers-reduced-motion: reduce) {
  .participantes-topo button,
  .remover-participante,
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
