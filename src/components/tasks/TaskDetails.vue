
<template>
  <div class="task-overlay" @click.self="emit('close')">
    <div class="task-modal">
      <button v-if="loading || !tarefa" class="close-btn" aria-label="Fechar detalhes" @click="emit('close')">&times;</button>
      <div v-if="loading" class="feedback">
        Carregando tarefa...
      </div>

      <div v-else-if="!tarefa" class="feedback">
        {{ erro || 'Esta tarefa não está mais disponível.' }}
      </div>

      <template v-else-if="tarefa">
        <p v-if="erro" class="feedback" role="alert">{{ erro }}</p>
        <header class="task-header">
          <div>
            <h1>
              {{ tarefa.titulo }}
              <span>#{{ tarefa.id }}</span>
            </h1>

            <div class="header-info">
              <span class="status k-badge" :class="tarefa.status" :data-status="tarefa.status">
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
                  Editar tarefa
                </button>
              </div>

              <p class="description">{{ tarefa.descricao || 'Sem descrição.' }}</p><p class="description">Complexidade estimada: {{ ({ 1: 'Baixa', 2: 'Média', 3: 'Alta' })[tarefa.complexidade || 1] }}<span v-if="tarefa.impedida"> · Bloqueada por dependência</span></p>
            </section>

            <!-- CHECKLIST -->
            <section class="section">
              <div class="section-heading">
                <h2>Checklist</h2>
                <span class="muted">{{ progresso }}%</span>
              </div>

              <form v-if="podeGerenciar" class="comment-form" @submit.prevent="adicionarItem">
                <input v-model.trim="novoItem" class="textarea" placeholder="Novo item do checklist" maxlength="500" required />
                <button class="primary-btn" :disabled="salvando || !novoItem">Adicionar item</button>
              </form>
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
                  :disabled="!podeGerenciar || salvando"
                  @change="alterarChecklist(item, $event)"
                />

                <span :class="{ concluido: item.concluido }">
                  {{ item.texto }}
                </span>
                <button v-if="podeGerenciar" type="button" class="edit-btn" :disabled="salvando" @click.prevent="removerItem(item.id)">Remover</button>
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
              <h2>Materiais de apoio do projeto</h2>
              <form v-if="podeGerenciar" class="comment-form" @submit.prevent="adicionarMaterial">
                <input v-model.trim="materialTitulo" class="textarea" placeholder="Título do material" maxlength="200" required />
                <input v-model.trim="materialUrl" class="textarea" type="url" placeholder="https://..." required />
                <button class="primary-btn" :disabled="salvando">Adicionar material</button>
              </form>

              <div v-for="material in tarefa.materiais || []" :key="material.id">
              <a
                :href="material.url"
                target="_blank"
                rel="noopener noreferrer"
                class="material"
              >
                🔗 {{ material.titulo }}
              </a>
              <button v-if="isAdmin || material.criador === usuarioAtualId" type="button" class="edit-btn" :disabled="salvando" @click="removerMaterial(material.id)">Remover material</button>
              </div>

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
                  {{ (comentario.autor?.nome || comentario.author?.name || '?').charAt(0).toUpperCase() }}
                </div>

                <div class="comment-box">
                  <div class="comment-header">
                    <strong>{{ comentario.autor?.nome || comentario.author?.name || comentario.author?.email }}</strong>

                    <span>
                      {{ formatarData(comentario.criado_em) }}
                    </span>
                  </div>

                  <p>{{ comentario.texto }}</p>
                </div>
              </div>

              <form
                v-if="podeGerenciar"
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
              <h3>Responsável</h3>
              <select v-if="isAdmin" v-model="responsavelSelecionado" :disabled="salvando" aria-label="Responsável da tarefa">
                <option :value="null">Sem responsável</option>
                <option v-for="pessoa in participantes" :key="pessoa.id" :value="Number(pessoa.id)">{{ pessoa.nome || pessoa.email }}</option>
              </select>

              <div
                v-for="usuario in responsaveis"
                :key="usuario.id"
                class="person"
              >
                <div class="avatar small">
                  {{ (usuario.nome || usuario.email || '?').charAt(0).toUpperCase() }}
                </div>

                <span>{{ usuario.nome || usuario.email }}</span>
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
                class="k-filter" :data-status="tarefa.status"
                :value="tarefa.status"
                :disabled="!podeGerenciar || salvando"
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
                class="k-filter" :data-priority="tarefa.prioridade"
                :value="tarefa.prioridade"
                :disabled="!podeGerenciar || salvando"
                @change="alterarCampo('prioridade', $event.target.value)"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div class="sidebar-section">
              <h3>Data de início</h3>
              <input type="date" lang="pt-BR" :value="tarefa.data_inicio || ''" :max="tarefa.prazo || undefined" :disabled="!podeGerenciar || salvando" aria-label="Data de início da tarefa" @change="alterarCampo('data_inicio', $event.target.value || null)" />
            </div>
            <div class="sidebar-section">
              <h3>Prazo de conclusão</h3>

              <input
                type="date"
                :value="tarefa.prazo || ''"
                :min="tarefa.data_inicio || undefined" aria-label="Prazo de conclusão da tarefa"
                :disabled="!podeGerenciar || salvando"
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
              v-if="podeExcluir"
              class="delete-btn"
              @click="excluir"
            >
              Excluir tarefa
            </button>
          </aside>
        </div>
        <CreateTaskModal v-model="editando" :tarefa="tarefa" :projeto-id="tarefa.projeto" :participantes="participantes" :pode-atribuir="isAdmin" @updated="emit('updated')" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CreateTaskModal from './CreateTaskModal.vue'
import { useTaskStore } from '@/stores/taskStore'
import { podeEditarTarefa, podeExcluirTarefa } from '@/utils/taskPermissions'

const props = defineProps({
  taskId: {
    type: Number,
    required: true
  },
  usuarioAtualId: {
    type: Number,
    required: true
  },
  participantes: { type: Array, default: () => [] },
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
const novoComentario = ref('')
const enviando = ref(false)
const salvando = ref(false)
const novoItem = ref('')
const materialTitulo = ref('')
const materialUrl = ref('')
const responsavelSelecionado = computed({
  get: () => tarefa.value?.responsaveis[0]?.id ?? null,
  set: id => { alterarCampo('responsaveis', id ? [Number(id)] : []) },
})
const responsaveis = computed(() => (tarefa.value?.responsaveis || []).map(p => props.participantes.find(member => String(member.id) === String(p.id)) || p))

watch(
  () => props.taskId,
  async (id, previous, onCleanup) => {
    let ativo = true
    onCleanup(() => { ativo = false })
    editando.value = false
    novoComentario.value = ''
    novoItem.value = ''
    materialTitulo.value = ''
    materialUrl.value = ''
    loading.value = true
    erro.value = ''
    store.tarefaAtual = null

    try {
      await store.buscarTarefa(id)
      if (!ativo) return
    } catch {
      if (ativo) erro.value = 'Não foi possível carregar a tarefa.'
    } finally {
      if (ativo) loading.value = false
    }
  },
  { immediate: true }
)

const podeGerenciar = computed(() => podeEditarTarefa(tarefa.value, props.usuarioAtualId, props.isAdmin))
watch(podeGerenciar, permitido => { if (!permitido) editando.value = false })
const podeExcluir = computed(() => podeExcluirTarefa(tarefa.value, props.usuarioAtualId, props.isAdmin))

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

function alternarEdicao() { if (podeGerenciar.value) editando.value = true }

async function alterarCampo(campo, valor) {
  if (!podeGerenciar.value || salvando.value) return
  salvando.value = true
  erro.value = ''

  try {
    await store.atualizarTarefa(tarefa.value.id, {
      [campo]: valor
    })

    emit('updated')
  } catch {
    erro.value = store.error || 'Erro ao atualizar tarefa.'
  } finally { salvando.value = false }
}

async function alterarChecklist(item, event) {
  if (!podeGerenciar.value || salvando.value) return
  salvando.value = true
  erro.value = ''

  try {
    await store.atualizarChecklist(
      tarefa.value.id,
      item.id,
      !item.concluido
    )

    emit('updated')
  } catch {
    event.target.checked = item.concluido
    erro.value = store.error || 'Erro ao atualizar checklist.'
  } finally { salvando.value = false }
}

async function enviarComentario() {
  if (!podeGerenciar.value || !novoComentario.value.trim() || enviando.value) return

  enviando.value = true

  try {
    await store.adicionarComentario(
      tarefa.value.id,
      novoComentario.value.trim()
    )

    novoComentario.value = ''
    emit('updated')
  } catch {
    erro.value = 'Erro ao enviar comentário.'
  } finally {
    enviando.value = false
  }
}

async function salvarRecurso(operacao) {
  if (!podeGerenciar.value || salvando.value) return false
  salvando.value = true
  erro.value = ''
  try {
    await operacao()
    emit('updated')
    return true
  } catch {
    erro.value = store.error || 'Não foi possível salvar a alteração.'
    return false
  } finally { salvando.value = false }
}
async function adicionarItem() {
  if (!novoItem.value) return
  if (await salvarRecurso(() => store.adicionarChecklist(tarefa.value.id, novoItem.value))) novoItem.value = ''
}
const removerItem = id => salvarRecurso(() => store.removerChecklist(tarefa.value.id, id))
const removerMaterial = id => salvarRecurso(() => store.removerMaterial(tarefa.value.id, id))
async function adicionarMaterial() {
  if (await salvarRecurso(() => store.adicionarMaterial(tarefa.value.id, { titulo: materialTitulo.value, url: materialUrl.value }))) {
    materialTitulo.value = ''
    materialUrl.value = ''
  }
}

async function excluir() {
  if (!podeExcluir.value) return

  if (!confirm('Deseja excluir esta tarefa?')) return

  try {
    await store.excluirTarefa(tarefa.value.id)
    emit('deleted')
    emit('close')
  } catch {
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
  background: var(--theme-bg-ffffff, #ffffff);
  border-radius: 18px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
  font-family: 'Poppins', sans-serif;
  color: var(--theme-text-26382b, #26382b);
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 32px;
  border-bottom: 1px solid var(--theme-border-e5ebe6, #e5ebe6);
}

.task-header h1 {
  margin: 0 0 12px;
  font-size: 25px;
  font-weight: 700;
}

.task-header h1 span {
  color: var(--theme-text-9aa69d, #9aa69d);
  font-weight: 400;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--theme-text-89958c, #89958c);
  font-size: 12px;
}

.status {
  padding: 5px 11px;
  border-radius: 20px;
  background: var(--theme-bg-edf0ed, #edf0ed);
  color: var(--theme-text-647168, #647168);
  font-weight: 600;
}

.status.em_andamento {
  background: var(--theme-bg-eee9fb, #eee9fb);
  color: var(--theme-text-8064b9, #8064b9);
}

.status.concluido {
  background: var(--theme-bg-e4f4e8, #e4f4e8);
  color: var(--theme-text-398353, #398353);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--theme-text-7d8a80, #7d8a80);
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
  border-bottom: 1px solid var(--theme-border-e8eee9, #e8eee9);
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
  color: var(--theme-text-526356, #526356);
  white-space: pre-wrap;
}

.muted {
  color: var(--theme-text-929e95, #929e95);
  font-size: 12px;
}

.edit-btn {
  border: none;
  background: transparent;
  color: var(--theme-text-4e7855, #4e7855);
  font-weight: 600;
  cursor: pointer;
}

.textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 13px;
  border: 1px solid var(--theme-border-dbe5dd, #dbe5dd);
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
  background: var(--theme-bg-e9eee9, #e9eee9);
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
  color: var(--theme-text-a0aaa2, #a0aaa2);
}

.material {
  display: block;
  margin: 8px 0;
  color: var(--theme-text-4e7855, #4e7855);
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
  background: var(--theme-bg-e1eee4, #e1eee4);
  color: var(--theme-text-3d6846, #3d6846);
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
  border: 1px solid var(--theme-border-e2e9e3, #e2e9e3);
  border-radius: 10px;
  overflow: hidden;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: var(--theme-bg-f5f8f5, #f5f8f5);
  font-size: 12px;
}

.comment-header span {
  color: var(--theme-text-929e95, #929e95);
}

.comment-box p {
  margin: 12px;
}

.comment-form h3 {
  font-size: 13px;
  margin-bottom: 10px;
}

.task-sidebar {
  background: var(--theme-bg-f8faf8, #f8faf8);
  border-left: 1px solid var(--theme-border-e5ebe6, #e5ebe6);
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
  border: 1px solid var(--theme-border-dce5de, #dce5de);
  border-radius: 8px;
  background: var(--theme-bg-ffffff, white);
  font: inherit;
  font-size: 12px;
}

.delete-btn {
  width: 100%;
  padding: 11px;
  border: 1px solid var(--theme-border-e8b4b4, #e8b4b4);
  border-radius: 9px;
  background: var(--theme-bg-fff2f2, #fff2f2);
  color: var(--theme-text-c74c4c, #c74c4c);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.feedback {
  padding: 50px;
  text-align: center;
  color: var(--theme-text-69796e, #69796e);
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
    border-top: 1px solid var(--theme-border-e5ebe6, #e5ebe6);
  }
}
</style>
