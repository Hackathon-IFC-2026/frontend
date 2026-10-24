<template>
  <div ref="root" class="filtro-dropdown" @keydown="navegarOpcoes">
    <button
      ref="gatilho"
      type="button"
      class="filtro-gatilho"
      :class="[
        `tom--${opcaoSelecionada?.tom || 'neutro'}`,
        { compacto },
      ]"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="aberto"
      @click="alternar"
    >
      <span class="indicador-opcao" aria-hidden="true"></span>
      <span class="texto-gatilho">{{ opcaoSelecionada?.label || 'Selecione' }}</span>
      <span class="seta" aria-hidden="true"></span>
    </button>

    <div
      v-if="aberto"
      class="filtro-opcoes"
      :class="{ compacto }"
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
          {
            selecionada: opcao.value === modelValue,
            compacto,
          },
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
  compacto: {
    type: Boolean,
    default: false,
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
  border: 1px solid var(--color-border);
  border-radius: 11px;
  background: var(--color-input);
  box-shadow: 0 2px 7px var(--color-shadow);
  color: var(--color-text);
  font: inherit;
  font-size: 0.85rem;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.filtro-gatilho:hover {
  border-color: var(--color-border-hover);
  background-color: var(--color-background-soft);
}

.filtro-gatilho:focus-visible,
.filtro-opcao:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.filtro-gatilho:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent);
}

.filtro-gatilho .seta {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  margin-left: auto;
  border-right: 2px solid var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  transform: rotate(45deg) translateY(-2px);
  transition: transform 0.18s ease;
}

.texto-gatilho {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filtro-gatilho[aria-expanded='true'] .seta {
  transform: rotate(225deg) translate(-2px, -1px);
}

.texto-gatilho {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filtro-gatilho.compacto {
  min-height: 40px;
  gap: 8px;
  padding: 0 11px;
  border-radius: 9px;
  font-size: 0.8rem;
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

.filtro-gatilho.compacto {
  min-height: 40px;
  gap: 8px;
  padding: 0 11px;
  border-radius: 9px;
  font-size: 0.8rem;
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
  border: 1px solid var(--color-border);
  border-radius: 13px;
  background: var(--color-surface);
  box-shadow: 0 12px 28px var(--color-shadow);
}

.filtro-opcoes.compacto {
  top: calc(100% + 6px);
  gap: 3px;
  padding: 6px;
  border-radius: 10px;
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
  color: var(--color-text);
  font: inherit;
  font-size: 0.84rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.filtro-opcao.compacto {
  min-height: 35px;
  padding: 6px 8px;
  border-radius: 7px;
  font-size: 0.78rem;
}

.filtro-opcao:hover {
  background: var(--color-background-soft);
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

.tom--fazer .indicador-opcao,
.tom--a_fazer .indicador-opcao {
  background: #77917a;
}

.tom--em_processo .indicador-opcao,
.tom--em_andamento .indicador-opcao,
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

.filtro-opcao.tom--fazer,
.filtro-opcao.tom--a_fazer {
  --opcao-tom: #77917a;
}

.filtro-opcao.tom--em_processo,
.filtro-opcao.tom--em_andamento,
.filtro-opcao.tom--media {
  --opcao-tom: #db8a27;
}

.filtro-opcao.tom--concluido,
.filtro-opcao.tom--baixa {
  --opcao-tom: #3b8a54;
}

.filtro-opcao.tom--alta {
  --opcao-tom: #c84b4b;
}

.filtro-opcao:is(
  .tom--fazer,
  .tom--a_fazer,
  .tom--em_processo,
  .tom--em_andamento,
  .tom--media,
  .tom--concluido,
  .tom--baixa,
  .tom--alta
) {
  border-color: color-mix(in srgb, var(--opcao-tom) 24%, var(--color-border));
  background: color-mix(in srgb, var(--opcao-tom) 8%, var(--color-surface));
  color: color-mix(in srgb, var(--opcao-tom) 82%, var(--color-text));
}

.filtro-opcao:is(
  .tom--fazer,
  .tom--a_fazer,
  .tom--em_processo,
  .tom--em_andamento,
  .tom--media,
  .tom--concluido,
  .tom--baixa,
  .tom--alta
):hover {
  background: color-mix(in srgb, var(--opcao-tom) 14%, var(--color-surface));
}

.filtro-opcao.selecionada {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.check {
  margin-left: auto;
  color: var(--color-primary);
  font-size: 1rem;
}

@media (prefers-reduced-motion: reduce) {
  .filtro-gatilho,
  .filtro-gatilho .seta,
  .filtro-opcao {
    transition: none;
  }
}
</style>
