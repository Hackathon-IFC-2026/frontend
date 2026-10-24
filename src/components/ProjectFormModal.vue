<template>
  <div v-if="modelValue" class="project-overlay" @click.self="fechar" @keydown.esc="fechar">
    <form class="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-form-title" @submit.prevent="salvar">
      <h2 id="project-form-title">{{ projeto ? 'Editar projeto' : 'Novo projeto' }}</h2>
      <label for="project-name">Nome do projeto</label>
      <input id="project-name" ref="nomeInput" v-model.trim="form.nome" maxlength="100" required :disabled="salvando" />
      <label for="project-description">Descrição</label>
      <textarea id="project-description" v-model.trim="form.descricao" rows="4" required :disabled="salvando"></textarea>
      <p v-if="erro" class="project-error" role="alert">{{ erro }}</p>
      <footer>
        <button type="button" :disabled="salvando" @click="fechar">Cancelar</button>
        <button type="submit" class="primary" :disabled="salvando">{{ salvando ? 'Salvando...' : projeto ? 'Salvar alterações' : 'Criar projeto' }}</button>
      </footer>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { mensagemErro } from '/services/apiHelpers.js'
const props = defineProps({ modelValue: Boolean, projeto: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue', 'saved'])
const store = useProjectStore()
const form = reactive({ nome: '', descricao: '' })
const nomeInput = ref(null)
const salvando = ref(false)
const erro = ref('')
watch(() => props.modelValue, async aberto => {
  if (!aberto) return
  form.nome = props.projeto?.nome || ''
  form.descricao = props.projeto?.descricao || ''
  erro.value = ''
  await nextTick()
  nomeInput.value?.focus()
})
function fechar() { if (!salvando.value) emit('update:modelValue', false) }
async function salvar() {
  if (salvando.value || !form.nome || !form.descricao) return
  salvando.value = true
  erro.value = ''
  try {
    const projeto = props.projeto ? await store.atualizarProjeto(props.projeto.id, form) : await store.criarProjeto(form)
    emit('saved', projeto)
    emit('update:modelValue', false)
  } catch (error) { erro.value = mensagemErro(error) }
  finally { salvando.value = false }
}
</script>

<style scoped>
.project-overlay { position: fixed; inset: 0; z-index: 1500; display: grid; place-items: center; padding: 20px; background: rgb(0 0 0 / 50%); }
.project-modal { width: 100%; max-width: 540px; max-height: 90vh; overflow: auto; padding: 28px; border-radius: 16px; background: var(--color-surface); color: var(--color-text); box-shadow: 0 16px 60px rgb(0 0 0 / 20%); }
h2 { margin: 0 0 22px; color: var(--color-heading); }
label { display: block; margin: 16px 0 8px; font-weight: 600; }
input, textarea { width: 100%; padding: 12px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-input); color: var(--color-text); font: inherit; }
input:focus, textarea:focus { outline: 2px solid var(--color-primary); outline-offset: 2px; }
footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
button { padding: 10px 16px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface-secondary); color: var(--color-text); cursor: pointer; }
.primary { background: #2b4532; color: #fff; }
button:disabled { opacity: .6; cursor: wait; }
.project-error { color: #d15d60; }
</style>
