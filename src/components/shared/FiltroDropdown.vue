<template>
  <div ref="root" class="filtro-dropdown" @keydown="navegarOpcoes">
    <button
      ref="gatilho"
      type="button"
      class="filtro-gatilho"
      :class="`tom--${opcaoSelecionada?.tom || 'neutro'}`"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="aberto"
      @click="alternar"
    >
      <span class="indicador-opcao" aria-hidden="true"></span>
      <span>{{ opcaoSelecionada?.label || 'Selecione' }}</span>
      <span class="material-symbols-outlined seta" aria-hidden="true">
        expand_more
      </span>
    </button>

    <div
      v-if="aberto"
      class="filtro-opcoes"
      role="listbox"
      :aria-label="label"
    >
      <button
        v-for="opcao in options"
        :key="opcao.value"
        type="button"
        class="filtro-opcao"
        :class="[
          `tom--${opcao.tom || 'neutro'}`,
          { selecionada: opcao.value === modelValue },
        ]"
        role="option"
        :aria-selected="opcao.value === modelValue"
        @click="selecionar(opcao)"
      >
        <span class="indicador-opcao" aria-hidden="true"></span>
        <span>{{ opcao.label }}</span>
        <span
          v-if="opcao.value === modelValue"
          class="material-symbols-outlined check"
          aria-hidden="true"
        >
          check
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const gatilho = ref(null)
const aberto = ref(false)

const opcaoSelecionada = computed(() =>
  props.options.find((opcao) => opcao.value === props.modelValue),
)

function obterOpcoes() {
  return [...root.value.querySelectorAll('[role="option"]')]
}

async function alternar() {
  aberto.value = !aberto.value
  if (aberto.value) await focarOpcaoSelecionada()
}

async function focarOpcaoSelecionada() {
  await nextTick()
  const opcoes = obterOpcoes()
  const indice = props.options.findIndex((opcao) => opcao.value === props.modelValue)
  opcoes[Math.max(indice, 0)]?.focus()
}

function selecionar(opcao) {
  emit('update:modelValue', opcao.value)
  aberto.value = false
  gatilho.value?.focus()
}

function navegarOpcoes(event) {
  if (event.key === 'Escape' && aberto.value) {
    event.preventDefault()
    aberto.value = false
    gatilho.value?.focus()
    return
  }

  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()

  if (!aberto.value) {
    aberto.value = true
    focarOpcaoSelecionada()
    return
  }

  const opcoes = obterOpcoes()
  const indiceAtual = opcoes.indexOf(document.activeElement)
  const proximoIndice = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? opcoes.length - 1
      : (indiceAtual + (event.key === 'ArrowDown' ? 1 : -1) + opcoes.length) %
        opcoes.length

  opcoes[proximoIndice]?.focus()
}

function fecharAoClicarFora(event) {
  if (!root.value?.contains(event.target)) aberto.value = false
}

onMounted(() => document.addEventListener('pointerdown', fecharAoClicarFora))
onBeforeUnmount(() => document.removeEventListener('pointerdown', fecharAoClicarFora))
</script>

<style scoped>
.filtro-dropdown {
  position: relative;
  width: 100%;
  min-width: 0;
  font-family: inherit;
}

.filtro-gatilho {
  display: flex;
  width: 100%;
  min-height: 46px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 14px;
  overflow: hidden;
  border: 1px solid #d4dfd5;
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 2px 7px rgba(26, 55, 33, 0.04);
  color: #516052;
  font: inherit;
  font-size: 0.85rem;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.filtro-gatilho:hover {
  border-color: #9db69f;
  background-color: #fbfdfb;
}

.filtro-gatilho:focus-visible,
.filtro-opcao:focus-visible {
  outline: 2px solid #4e7855;
  outline-offset: 2px;
}

.filtro-gatilho .seta {
  flex: 0 0 auto;
  color: #66816a;
  font-size: 1.2rem;
  transition: transform 0.18s ease;
}

.filtro-gatilho[aria-expanded='true'] .seta {
  transform: rotate(180deg);
}

.filtro-gatilho.tom--fazer {
  border-color: #d6e0d7;
  background: #edf1ed;
  color: #526653;
}

.filtro-gatilho.tom--em_processo,
.filtro-gatilho.tom--media {
  border-color: #f2d6af;
  background: #fff6e9;
  color: #a75e0b;
}

.filtro-gatilho.tom--concluido,
.filtro-gatilho.tom--baixa {
  border-color: #c6e5cc;
  background: #eaf6ec;
  color: #28713e;
}

.filtro-gatilho.tom--alta {
  border-color: #f1caca;
  background: #fff0f0;
  color: #b42318;
}

.filtro-opcoes {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  z-index: 20;
  display: grid;
  gap: 4px;
  max-height: 260px;
  overflow-y: auto;
  padding: 7px;
  border: 1px solid #dfe8df;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(26, 55, 33, 0.16);
}

.filtro-opcao {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: #344a3a;
  font: inherit;
  font-size: 0.84rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.filtro-opcao:hover {
  background: #f3f7f3;
}

.filtro-opcao.selecionada {
  border-color: #dfe8df;
  background: #f4f8f4;
  font-weight: 600;
}

.indicador-opcao {
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border-radius: 50%;
  background: #9aa99c;
}

.tom--neutro .indicador-opcao {
  background: #9aa99c;
}

.tom--fazer .indicador-opcao {
  background: #77917a;
}

.tom--em_processo .indicador-opcao,
.tom--media .indicador-opcao {
  background: #db8a27;
}

.tom--concluido .indicador-opcao,
.tom--baixa .indicador-opcao {
  background: #3b8a54;
}

.tom--alta .indicador-opcao {
  background: #c84b4b;
}

.check {
  margin-left: auto;
  color: #315e3b;
  font-size: 1rem;
}

.tom--fazer.selecionada {
  border-color: #d6e0d7;
  background: #edf1ed;
  color: #526653;
}

.tom--em_processo.selecionada,
.tom--media.selecionada {
  border-color: #f2d6af;
  background: #fff6e9;
  color: #a75e0b;
}

.tom--concluido.selecionada,
.tom--baixa.selecionada {
  border-color: #c6e5cc;
  background: #eaf6ec;
  color: #28713e;
}

.tom--alta.selecionada {
  border-color: #f1caca;
  background: #fff0f0;
  color: #b42318;
}
</style>
