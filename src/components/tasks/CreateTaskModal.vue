
<template>
  <div v-if="modelValue" class="overlay" @click.self="fechar">
    <div class="modal">
      <header class="modal-header">
        <div>
          <h2>Nova tarefa</h2>
          <p>Organize as atividades do seu projeto.</p>
        </div>

        <button type="button" class="close" @click="fechar">
          &times;
        </button>
      </header>

      <form @submit.prevent="salvar">
        <div class="campo">
          <label>Título da tarefa *</label>
          <input
            v-model="form.titulo"
            maxlength="150"
            placeholder="Ex: Desenvolver tela inicial"
            required
          />
        </div>

        <div class="campo">
          <label>Descrição</label>
          <textarea
            v-model="form.descricao"
            rows="4"
            placeholder="O que precisa ser feito?"
          />
        </div>

        <div class="duas-colunas">
          <div class="campo">
            <label>Prioridade</label>
            <select v-model="form.prioridade">
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div class="campo">
            <label>Situação</label>
            <select v-model="form.status">
              <option value="a_fazer">A fazer</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
        </div>

        <div class="duas-colunas">
          <div class="campo">
            <label>Data de início</label>
            <input v-model="form.data_inicio" type="date" />
          </div>

          <div class="campo">
            <label>Prazo de entrega</label>
            <input
              v-model="form.prazo"
              type="date"
              :min="form.data_inicio || undefined"
            />
          </div>
        </div>

        <div class="campo">
          <label>Responsáveis</label>

          <div class="participantes">
            <label
              v-for="pessoa in participantes"
              :key="pessoa.id"
              class="participante"
            >
              <input
                v-model="form.responsaveis"
                type="checkbox"
                :value="pessoa.id"
              />

              <span class="avatar">
                {{ pessoa.nome.charAt(0).toUpperCase() }}
              </span>

              <span>{{ pessoa.nome }}</span>
            </label>

            <p v-if="!participantes.length" class="vazio">
              Nenhum participante disponível.
            </p>
          </div>
        </div>

        <p v-if="erro" class="erro">{{ erro }}</p>

        <footer class="modal-footer">
          <button type="button" class="cancelar" @click="fechar">
            Cancelar
          </button>

          <button type="submit" class="salvar" :disabled="salvando">
            {{ salvando ? 'Criando...' : 'Criar tarefa' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps({
  modelValue: Boolean,
  projetoId: {
    type: [Number, String],
    required: true
  },
  participantes: {
    type: Array,
    default: () => []
  },
  statusInicial: {
    type: String,
    default: 'a_fazer'
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const store = useTaskStore()
const salvando = ref(false)
const erro = ref('')

function formularioInicial() {
  return {
    titulo: '',
    descricao: '',
    prioridade: 'media',
    status: props.statusInicial,
    data_inicio: '',
    prazo: '',
    responsaveis: []
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
  }
)

function fechar() {
  if (salvando.value) return
  emit('update:modelValue', false)
}

async function salvar() {
  if (!form.titulo.trim() || salvando.value) return

  if (form.data_inicio && form.prazo && form.prazo < form.data_inicio) {
    erro.value = 'O prazo não pode ser anterior à data de início.'
    return
  }

  salvando.value = true
  erro.value = ''

  try {
   const responsaveis = props.participantes.filter(
  pessoa => form.responsaveis.includes(pessoa.id)
)

const tarefa = await store.criarTarefa({
  projeto: Number(props.projetoId),
  titulo: form.titulo.trim(),
  descricao: form.descricao.trim(),
  prioridade: form.prioridade,
  status: form.status,
  data_inicio: form.data_inicio || null,
  prazo: form.prazo || null,
  responsaveis: responsaveis
})

  emit('created', tarefa)
emit('update:modelValue', false)
  } catch (error) {
    console.error(error)
    erro.value = 'Não foi possível criar a tarefa.'
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
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px;
  border-radius: 18px;
  background: #fff;
  box-sizing: border-box;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .18);
  font-family: Poppins, sans-serif;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 26px;
}

.modal-header h2 {
  margin: 0;
  font-size: 25px;
  color: #243e2c;
}

.modal-header p {
  margin: 5px 0 0;
  color: #819087;
  font-size: 13px;
}

.close {
  border: none;
  background: transparent;
  font-size: 29px;
  color: #7a8580;
  cursor: pointer;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.campo > label {
  font-size: 13px;
  font-weight: 600;
  color: #344a3a;
}

.campo > input,
.campo textarea,
.campo select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #dce4de;
  border-radius: 9px;
  background: #fff;
  font: inherit;
  font-size: 13px;
  color: #26382b;
  outline: none;
}

.campo > input:focus,
.campo textarea:focus,
.campo select:focus {
  border-color: #4e7855;
  box-shadow: 0 0 0 3px rgba(78, 120, 85, .1);
}

.duas-colunas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.participantes {
  max-height: 170px;
  overflow-y: auto;
  border: 1px solid #dce4de;
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
  background: #e0ebe2;
  color: #345a3d;
  font-weight: 600;
}

.vazio {
  color: #87928a;
  font-size: 13px;
}

.erro {
  color: #c0392b;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e7ece8;
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
  background: #f1f4f2;
  color: #415348;
}

.salvar {
  background: #2b4532;
  color: white;
}

.salvar:disabled {
  opacity: .6;
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
