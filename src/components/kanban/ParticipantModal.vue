<template>
  <div
    v-if="modelValue"
    class="overlay"
    @click.self="fechar"
  >
    <form class="modal-participante" @submit.prevent="salvar">
      <h2>Adicionar participante</h2>
      <input
        v-model="nome"
        placeholder="Nome do participante"
        required
        autofocus
      />
      <div class="acoes-modal">
        <button type="button" @click="fechar">Cancelar</button>
        <button type="submit" class="confirmar">Adicionar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'adicionar'])

const nome = ref('')

watch(() => props.modelValue, (val) => {
  if (val) nome.value = ''
})

function fechar() {
  emit('update:modelValue', false)
}

function salvar() {
  const nomeLimpo = nome.value.trim()
  if (!nomeLimpo) return
  emit('adicionar', nomeLimpo)
  fechar()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  font-family: Poppins, sans-serif;
}

.modal-participante {
  width: 100%;
  max-width: 400px;
  padding: 25px;
  box-sizing: border-box;
  border-radius: 14px;
  background: white;
}

.modal-participante h2 {
  margin: 0 0 18px;
  font-size: 19px;
  color: #24372a;
}

.modal-participante input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px;
  border: 1px solid #dce5de;
  border-radius: 8px;
  font: 13px Poppins, sans-serif;
  outline: none;
}

.modal-participante input:focus {
  border-color: #2b4532;
}

.acoes-modal {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.acoes-modal button {
  padding: 9px 15px;
  border: 0;
  border-radius: 8px;
  font: 500 13px Poppins, sans-serif;
  cursor: pointer;
}

.acoes-modal .confirmar {
  background: #2b4532;
  color: white;
}
</style>

