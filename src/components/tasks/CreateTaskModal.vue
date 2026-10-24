<template>
  <div v-if="modelValue" class="overlay" @click.self="fechar">
    <div
      class="modal task-form-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-task-title"
    >
      <header class="modal-header">
        <div>
          <h2 id="new-task-title">{{ tarefa ? 'Editar tarefa' : 'Nova tarefa' }}</h2>
          <p>Organize uma nova atividade para seu projeto.</p>
        </div>

        <button
          type="button"
          class="close"
          aria-label="Fechar formulário da tarefa"
          @click="fechar"
        >
          &times;
        </button>
      </header>

      <form @submit.prevent="salvar">
        <div class="campo">
          <label for="task-title">Título da tarefa *</label>
          <input
            id="task-title"
            v-model="form.titulo"
            maxlength="100"
            placeholder="Ex: Desenvolver tela inicial"
            required
          />
        </div>

        <div class="campo">
          <label for="task-description">Descrição *</label>
          <textarea
            id="task-description"
            v-model="form.descricao"
            rows="2"
            required
            placeholder="O que precisa ser feito?"
          />
        </div>

        <div class="duas-colunas">
          <div class="campo">
            <label for="task-start">Data de início</label
            ><input
              id="task-start"
              v-model="form.data_inicio"
              type="date"
              lang="pt-BR"
              :max="form.prazo || undefined"
            />
          </div>
          <div class="campo">
            <label for="task-due">Prazo de conclusão</label
            ><input
              id="task-due"
              v-model="form.prazo"
              type="date"
              lang="pt-BR"
              :min="form.data_inicio || undefined"
            />
          </div>
        </div>
        <div class="duas-colunas">
          <div class="campo">
            <label for="task-priority">Prioridade</label
            ><select
              id="task-priority"
              v-model="form.prioridade"
              class="k-filter"
              :data-priority="form.prioridade"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div class="campo">
            <label for="task-status">Status</label
            ><select
              id="task-status"
              v-model="form.status"
              class="k-filter"
              :data-status="form.status"
            >
              <option value="a_fazer">A fazer</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
        </div>
        <div class="duas-colunas">
          <div class="campo"><label for="task-complexity">Complexidade estimada</label>
            <select id="task-complexity" v-model.number="form.complexidade">
              <option :value="1">Baixa · 1 ponto</option><option :value="2">Média · 2 pontos</option><option :value="3">Alta · 3 pontos</option>
            </select>
          </div>
          <div class="campo"><label for="task-blocked">Dependências</label>
            <select id="task-blocked" v-model="form.impedida"><option :value="false">Disponível para executar</option><option :value="true">Bloqueada por dependência</option></select>
          </div>
        </div>
        <div class="campo">
          <label for="task-assignee">Responsável</label>
          <select id="task-assignee" v-model="form.responsavel" :disabled="!podeAtribuir">
            <option :value="null">Sem responsável</option>
            <option v-for="pessoa in participantes" :key="pessoa.id" :value="Number(pessoa.id)">
              {{ pessoa.nome || pessoa.email }}
            </option>
          </select>
        </div>
        <p v-if="erro" class="erro">{{ erro }}</p>

        <footer class="modal-footer">
          <button type="button" class="cancelar" @click="fechar">Cancelar</button>

          <button type="submit" class="salvar" :disabled="salvando">
            {{ salvando ? 'Salvando...' : tarefa ? 'Salvar alterações' : 'Criar tarefa' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  modelValue: Boolean,
  tarefa: { type: Object, default: null },
  podeAtribuir: { type: Boolean, default: true },
  projetoId: {
    type: [Number, String],
    required: true,
  },
  participantes: {
    type: Array,
    default: () => [],
  },
  statusInicial: {
    type: String,
    default: 'a_fazer',
  },
})

const emit = defineEmits(['update:modelValue', 'created', 'updated'])

const store = useTaskStore()
const auth = useAuthStore()
const salvando = ref(false)
const erro = ref('')

function formularioInicial() {
  return {
    titulo: props.tarefa?.titulo || '',
    descricao: props.tarefa?.descricao || '',
    prioridade: props.tarefa?.prioridade || 'media',
    status: props.tarefa?.status || props.statusInicial,
    prazo: props.tarefa?.prazo || '',
    data_inicio: props.tarefa?.data_inicio || '',
    complexidade: props.tarefa?.complexidade || 1,
    impedida: props.tarefa?.impedida || false,
    responsavel: props.tarefa
      ? (props.tarefa.responsaveis[0]?.id ?? null)
      : (auth.usuario?.id ?? null),
  }
}

const form = reactive(formularioInicial())

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) {
      Object.assign(form, formularioInicial())
      erro.value = ''
    }
  },
)

function fechar() {
  if (salvando.value) return
  emit('update:modelValue', false)
}

async function salvar() {
  if (!form.titulo.trim() || salvando.value) return

  if (form.data_inicio && form.prazo && form.data_inicio > form.prazo) {
    erro.value = 'A data de início não pode ser posterior ao prazo de conclusão.'
    return
  }
  salvando.value = true
  erro.value = ''

  try {
    const dados = {
      projeto: Number(props.projetoId),
      complexidade: form.complexidade,
      impedida: form.impedida,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      status: form.status,
      prioridade: form.prioridade,
      data_inicio: form.data_inicio || null,
      prazo: form.prazo || null,
    }
    if (props.podeAtribuir || !props.tarefa)
      dados.responsaveis = form.responsavel ? [Number(form.responsavel)] : []
    const tarefa = props.tarefa
      ? await store.atualizarTarefa(props.tarefa.id, dados)
      : await store.criarTarefa(dados)

    emit(props.tarefa ? 'updated' : 'created', tarefa)
    emit('update:modelValue', false)
  } catch (error) {
    erro.value = store.error || error.response?.data?.detail || 'Não foi possível salvar a tarefa.'
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 18, 0.55);
}

.modal {
  width: 100%;
  max-width: 520px;
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 22px;
  border-radius: 14px;
  background: var(--theme-bg-ffffff, #fff);
  box-sizing: border-box;
  box-shadow: 0 12px 45px rgba(0, 0, 0, 0.13);
  font-family: Poppins, sans-serif;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.modal-header h2 {
  margin: 0;
  font-size: 21px;
  color: var(--theme-text-243e2c, #243e2c);
}

.modal-header p {
  margin: 5px 0 0;
  color: var(--theme-text-819087, #819087);
  font-size: 13px;
}

.close {
  border: none;
  background: transparent;
  font-size: 29px;
  color: var(--theme-text-7a8580, #7a8580);
  cursor: pointer;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 13px;
}

.campo > label {
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-text-344a3a, #344a3a);
}

.campo > input,
.campo textarea,
.campo select {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border: 1px solid var(--theme-border-dce4de, #dce4de);
  border-radius: 9px;
  background: var(--theme-bg-ffffff, #fff);
  font: inherit;
  font-size: 13px;
  color: var(--theme-text-26382b, #26382b);
  outline: none;
}

.campo > input:focus,
.campo textarea:focus,
.campo select:focus {
  border-color: var(--theme-border-4e7855, #4e7855);
  box-shadow: 0 0 0 3px rgba(78, 120, 85, 0.1);
}

.duas-colunas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.participantes {
  max-height: 170px;
  overflow-y: auto;
  border: 1px solid var(--theme-border-dce4de, #dce4de);
  border-radius: 10px;
  padding: 8px 12px;
}

.participante {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 4px;
  font-size: 13px;
  cursor: pointer;
}

.participante input {
  accent-color: #4e7855;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-bg-e0ebe2, #e0ebe2);
  color: var(--theme-text-345a3d, #345a3d);
  font-weight: 600;
}

.vazio {
  color: var(--theme-text-87928a, #87928a);
  font-size: 13px;
}

.erro {
  color: var(--theme-text-c0392b, #c0392b);
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--theme-border-e7ece8, #e7ece8);
}

.modal-footer button {
  padding: 11px 22px;
  border-radius: 9px;
  border: none;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
}

.cancelar {
  background: var(--theme-bg-f1f4f2, #f1f4f2);
  color: var(--theme-text-415348, #415348);
}

.salvar {
  background: #2b4532;
  color: white;
}

.salvar:disabled {
  opacity: 0.6;
}

@media (max-width: 600px) {
  .modal {
    padding: 22px;
  }

  .duas-colunas {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
