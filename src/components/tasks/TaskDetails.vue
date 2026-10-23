
<template>
  <div class="task-overlay" @click.self="emit('close')">
    <div class="task-modal">
      <div v-if="loading" class="feedback">
        Carregando tarefa...
      </div>

      <div v-else-if="erro" class="feedback">
        {{ erro }}
      </div>

      <template v-else-if="tarefa">
        <header class="task-header">
          <div>
            <h1>
              {{ tarefa.titulo }}
              <span>#{{ tarefa.id }}</span>
            </h1>

            <div class="header-info">
              <span class="status" :class="tarefa.status">
                {{ statusLabel(tarefa.status) }}
              </span>

              <span>Projeto #{{ tarefa.projeto }}</span>
            </div>
          </div>

          <button class="close-btn" @click="emit('close')">
            &times;
          </button>
        </header>

        <div class="task-layout">
          <main class="task-main">

            <!-- DESCRIÇÃO -->
            <section class="section">
              <div class="section-heading">
                <h2>Descrição</h2>

                <button
                  v-if="podeGerenciar"
                  class="edit-btn"
                  @click="alternarEdicao"
                >
                  {{ editando ? 'Cancelar' : 'Editar' }}
                </button>
              </div>

              <template v-if="editando">
                <textarea
                  v-model="descricaoEditada"
                  rows="5"
                  class="textarea"
                />

                <button
                  class="primary-btn"
                  @click="salvarDescricao"
                >
                  Salvar
                </button>
              </template>

              <p v-else class="description">
                {{ tarefa.descricao || 'Sem descrição.' }}
              </p>
            </section>

            <!-- CHECKLIST -->
            <section class="section">
              <div class="section-heading">
                <h2>Checklist</h2>
                <span class="muted">{{ progresso }}%</span>
              </div>

              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: progresso + '%' }"
                ></div>
              </div>

              <label
                v-for="item in tarefa.checklist || []"
                :key="item.id"
                class="checklist-item"
              >
                <input
                  type="checkbox"
                  :checked="item.concluido"
                  :disabled="!podeGerenciar"
                  @change="alterarChecklist(item)"
                />

                <span :class="{ concluido: item.concluido }">
                  {{ item.texto }}
                </span>
              </label>

              <p
                v-if="!tarefa.checklist?.length"
                class="muted"
              >
                Nenhum item adicionado.
              </p>
            </section>

            <!-- MATERIAIS -->
            <section class="section">
              <h2>Materiais de apoio</h2>

              <a
                v-for="material in tarefa.materiais || []"
                :key="material.id"
                :href="material.url"
                target="_blank"
                rel="noopener noreferrer"
                class="material"
              >
                🔗 {{ material.titulo }}
              </a>

              <p
                v-if="!tarefa.materiais?.length"
                class="muted"
              >
                Nenhum material adicionado.
              </p>
            </section>

            <!-- COMENTÁRIOS -->
            <section class="section">
              <h2>Atividades e comentários</h2>

              <div
                v-for="comentario in tarefa.comentarios || []"
                :key="comentario.id"
                class="comment"
              >
                <div class="avatar">
                  {{ comentario.autor.nome.charAt(0).toUpperCase() }}
                </div>

                <div class="comment-box">
                  <div class="comment-header">
                    <strong>{{ comentario.autor.nome }}</strong>

                    <span>
                      {{ formatarData(comentario.criado_em) }}
                    </span>
                  </div>

                  <p>{{ comentario.texto }}</p>
                </div>
              </div>

              <form
                v-if="usuarioAtualId"
                class="comment-form"
                @submit.prevent="enviarComentario"
              >
                <h3>Adicionar comentário</h3>

                <textarea
                  v-model="novoComentario"
                  class="textarea"
                  rows="4"
                  placeholder="Escreva seu comentário..."
                  required
                ></textarea>

                <button
                  type="submit"
                  class="primary-btn"
                  :disabled="enviando || !novoComentario.trim()"
                >
                  {{ enviando ? 'Enviando...' : 'Comentar' }}
                </button>
              </form>
            </section>
          </main>

          <!-- BARRA LATERAL -->
          <aside class="task-sidebar">

            <div class="sidebar-section">
              <h3>Responsáveis</h3>

              <div
                v-for="usuario in tarefa.responsaveis || []"
                :key="usuario.id"
                class="person"
              >
                <div class="avatar small">
                  {{ usuario.nome.charAt(0).toUpperCase() }}
                </div>

                <span>{{ usuario.nome }}</span>
              </div>

              <p
                v-if="!tarefa.responsaveis?.length"
                class="muted"
              >
                Não atribuído
              </p>
            </div>

            <div class="sidebar-section">
              <h3>Situação</h3>

              <select
                :value="tarefa.status"
                :disabled="!podeGerenciar"
                @change="alterarCampo('status', $event.target.value)"
              >
                <option value="a_fazer">A fazer</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>

            <div class="sidebar-section">
              <h3>Prioridade</h3>

              <select
                :value="tarefa.prioridade"
                :disabled="!podeGerenciar"
                @change="alterarCampo('prioridade', $event.target.value)"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div class="sidebar-section">
              <h3>Prazo</h3>

              <input
                type="date"
                :value="tarefa.prazo || ''"
                :disabled="!podeGerenciar"
                @change="alterarCampo('prazo', $event.target.value || null)"
              />
            </div>

            <div class="sidebar-section">
              <h3>Data de conclusão</h3>

              <p class="muted">
                {{
                  tarefa.concluida_em
                    ? formatarData(tarefa.concluida_em)
                    : 'Não concluída'
                }}
              </p>
            </div>

            <button
              v-if="podeGerenciar"
              class="delete-btn"
              @click="excluir"
            >
              Excluir tarefa
            </button>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps({
  taskId: {
    type: Number,
    required: true
  },
  usuarioAtualId: {
    type: Number,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'updated', 'deleted'])

const store = useTaskStore()

const tarefa = computed(() => store.tarefaAtual)
const loading = ref(false)
const erro = ref('')
const editando = ref(false)
const descricaoEditada = ref('')
const novoComentario = ref('')
const enviando = ref(false)

watch(
  () => props.taskId,
  async (id) => {
    loading.value = true
    erro.value = ''

    try {
      await store.buscarTarefa(id)
      descricaoEditada.value = tarefa.value?.descricao || ''
    } catch (error) {
      erro.value = 'Não foi possível carregar a tarefa.'
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

const podeGerenciar = computed(() => {
  if (!tarefa.value) return false

  return props.isAdmin ||
    tarefa.value.responsaveis?.some(
      usuario => usuario.id === props.usuarioAtualId
    )
})

const progresso = computed(() => {
  const itens = tarefa.value?.checklist || []

  if (!itens.length) return 0

  const concluidos = itens.filter(item => item.concluido).length
  return Math.round((concluidos / itens.length) * 100)
})

function statusLabel(status) {
  return {
    a_fazer: 'A fazer',
    em_andamento: 'Em andamento',
    concluido: 'Concluído'
  }[status] || status
}

function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR')
}

function alternarEdicao() {
  descricaoEditada.value = tarefa.value?.descricao || ''
  editando.value = !editando.value
}

async function salvarDescricao() {
  if (!podeGerenciar.value) return

  try {
    await store.atualizarTarefa(tarefa.value.id, {
      descricao: descricaoEditada.value
    })

    editando.value = false
    emit('updated')
  } catch (error) {
    erro.value = 'Erro ao salvar descrição.'
  }
}

async function alterarCampo(campo, valor) {
  if (!podeGerenciar.value) return

  try {
    await store.atualizarTarefa(tarefa.value.id, {
      [campo]: valor
    })

    emit('updated')
  } catch (error) {
    erro.value = 'Erro ao atualizar tarefa.'
  }
}

async function alterarChecklist(item) {
  if (!podeGerenciar.value) return

  try {
    await store.atualizarChecklist(
      tarefa.value.id,
      item.id,
      !item.concluido
    )

    emit('updated')
  } catch (error) {
    erro.value = 'Erro ao atualizar checklist.'
  }
}

async function enviarComentario() {
  if (!novoComentario.value.trim() || enviando.value) return

  enviando.value = true

  try {
    await store.adicionarComentario(
      tarefa.value.id,
      novoComentario.value.trim()
    )

    novoComentario.value = ''
    emit('updated')
  } catch (error) {
    erro.value = 'Erro ao enviar comentário.'
  } finally {
    enviando.value = false
  }
}

async function excluir() {
  if (!podeGerenciar.value) return

  if (!confirm('Deseja excluir esta tarefa?')) return

  try {
    await store.excluirTarefa(tarefa.value.id)
    emit('deleted')
    emit('close')
  } catch (error) {
    erro.value = 'Erro ao excluir tarefa.'
  }
}
</script>

<style scoped>
.task-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: rgba(12, 24, 16, 0.6);
  backdrop-filter: blur(3px);
}

.task-modal {
  width: 100%;
  max-width: 1050px;
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
  font-family: 'Poppins', sans-serif;
  color: #26382b;
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 32px;
  border-bottom: 1px solid #e5ebe6;
}

.task-header h1 {
  margin: 0 0 12px;
  font-size: 25px;
  font-weight: 700;
}

.task-header h1 span {
  color: #9aa69d;
  font-weight: 400;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #89958c;
  font-size: 12px;
}

.status {
  padding: 5px 11px;
  border-radius: 20px;
  background: #edf0ed;
  color: #647168;
  font-weight: 600;
}

.status.em_andamento {
  background: #eee9fb;
  color: #8064b9;
}

.status.concluido {
  background: #e4f4e8;
  color: #398353;
}

.close-btn {
  background: transparent;
  border: none;
  color: #7d8a80;
  font-size: 30px;
  cursor: pointer;
}

.task-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
}

.task-main {
  padding: 28px 32px;
  min-width: 0;
}

.section {
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid #e8eee9;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section h2 {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 700;
}

.description,
.comment-box p {
  font-size: 13px;
  line-height: 1.8;
  color: #526356;
  white-space: pre-wrap;
}

.muted {
  color: #929e95;
  font-size: 12px;
}

.edit-btn {
  border: none;
  background: transparent;
  color: #4e7855;
  font-weight: 600;
  cursor: pointer;
}

.textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 13px;
  border: 1px solid #dbe5dd;
  border-radius: 10px;
  font: inherit;
  font-size: 13px;
  resize: vertical;
}

.primary-btn {
  margin-top: 12px;
  padding: 10px 18px;
  border: none;
  border-radius: 9px;
  background: #2b4532;
  color: white;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress-bar {
  height: 7px;
  background: #e9eee9;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0 18px;
}

.progress-fill {
  height: 100%;
  background: #4e7855;
  border-radius: 10px;
  transition: width .2s;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 13px;
}

.checklist-item input {
  accent-color: #4e7855;
}

.concluido {
  text-decoration: line-through;
  color: #a0aaa2;
}

.material {
  display: block;
  margin: 8px 0;
  color: #4e7855;
  font-size: 13px;
  text-decoration: none;
}

.comment {
  display: flex;
  gap: 12px;
  margin: 18px 0;
}

.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e1eee4;
  color: #3d6846;
  font-weight: 700;
}

.avatar.small {
  width: 29px;
  height: 29px;
  font-size: 11px;
}

.comment-box {
  flex: 1;
  min-width: 0;
  border: 1px solid #e2e9e3;
  border-radius: 10px;
  overflow: hidden;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: #f5f8f5;
  font-size: 12px;
}

.comment-header span {
  color: #929e95;
}

.comment-box p {
  margin: 12px;
}

.comment-form h3 {
  font-size: 13px;
  margin-bottom: 10px;
}

.task-sidebar {
  background: #f8faf8;
  border-left: 1px solid #e5ebe6;
  padding: 28px 22px;
}

.sidebar-section {
  margin-bottom: 26px;
}

.sidebar-section h3 {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
}

.person {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
  font-size: 12px;
}

.sidebar-section select,
.sidebar-section input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #dce5de;
  border-radius: 8px;
  background: white;
  font: inherit;
  font-size: 12px;
}

.delete-btn {
  width: 100%;
  padding: 11px;
  border: 1px solid #e8b4b4;
  border-radius: 9px;
  background: #fff2f2;
  color: #c74c4c;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.feedback {
  padding: 50px;
  text-align: center;
  color: #69796e;
}

@media (max-width: 720px) {
  .task-overlay {
    padding: 10px;
  }

  .task-layout {
    grid-template-columns: 1fr;
  }

  .task-header,
  .task-main {
    padding: 20px;
  }

  .task-header h1 {
    font-size: 20px;
  }

  .task-sidebar {
    border-left: none;
    border-top: 1px solid #e5ebe6;
  }
}
</style>
