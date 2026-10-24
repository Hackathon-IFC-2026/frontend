
<template>
  <main class="kanban-pagina">
    <header class="projeto-header">
      <div>
        <h1>{{ projeto.nome }}</h1>
        <p>{{ projeto.descricao }}</p>
        <div class="projeto-acoes">
          <RouterLink to="/projects">← Projetos</RouterLink>
          <span v-if="projeto.id" class="k-badge" :data-role="isAdmin ? 'admin' : 'participante'">{{ isAdmin ? 'Administrador' : 'Participante' }}</span>
          <button v-if="isAdmin" @click="modalProjetoAberto = true">Editar projeto</button>
          <button v-if="isAdmin" @click="excluirProjeto">Excluir projeto</button>
        </div>
      </div>
      <button v-if="isAdmin" class="btn-criar" @click="abrirCadastro()">
        <span class="material-symbols-outlined">add</span>
        Nova tarefa
      </button>
    </header>

    <section class="resumo">
      <div v-for="item in indicadores" :key="item.nome" class="resumo-item">
        <span>{{ item.nome }}</span>
        <strong>{{ item.valor }}</strong>
      </div>
    </section>

    <section class="toolbar">
      <div class="campo-busca">
        <span class="material-symbols-outlined">search</span>
        <input v-model="busca" placeholder="Buscar tarefas..." />
      </div>

      <select v-model="filtroPrioridade" class="k-filter" :data-priority="filtroPrioridade" aria-label="Filtrar por prioridade">
        <option value="todas">Todas as prioridades</option>
        <option value="alta">Alta</option>
        <option value="media">Média</option>
        <option value="baixa">Baixa</option>
      </select>

      <select v-model="filtroParticipante" aria-label="Filtrar por responsável">
        <option value="todos">Todos os responsáveis</option>
        <option v-for="pessoa in participantes" :key="pessoa.id" :value="String(pessoa.id)">
          {{ pessoa.nome }}
        </option>
      </select>
      <select v-model="filtroFuncao" class="k-filter" :data-role="filtroFuncao" aria-label="Filtrar por função do responsável"><option value="todos">Todas as funções</option><option value="admin">Administrador</option><option value="participante">Participante</option></select>
      <button v-if="filtrosAtivos.length" class="clear-filters" @click="limparFiltros">Limpar filtros</button>
    </section>
    <div v-if="filtrosAtivos.length" class="active-filters" aria-label="Filtros ativos"><span>Filtrando por:</span><span v-for="filtro in filtrosAtivos" :key="filtro" class="active-filter-chip">{{ filtro }}</span></div>


    <p v-if="carregando" role="status">Carregando projeto...</p>
    <p v-if="erro" class="mensagem-erro" role="alert">{{ erro }}</p>
    <RouterLink v-if="!projeto.id" to="/projects">Voltar aos projetos</RouterLink>

    <section class="kanban-area">
      <div
        v-for="coluna in colunas"
        :key="coluna.id"
        class="kanban-coluna"
        :class="[coluna.classe, { 'arrastando-sobre': colunaSobreposta === coluna.id }]"
        @dragover.prevent
        @dragenter.prevent="colunaSobreposta = coluna.id"
        @dragleave="sairDaColuna($event, coluna.id)"
        @drop.prevent="soltarTarefa($event, coluna.id)"
      >
        <header class="coluna-header" :data-status="coluna.id">
          <div class="coluna-nome">
            <span class="indicador"></span>
            <h2>{{ coluna.nome }}</h2>
            <span class="contador">{{ tarefasDaColuna(coluna.id).length }}</span>
          </div>
          <button
            v-if="coluna.id !== 'atrasado' && isAdmin"
            class="btn-add-coluna"
            title="Adicionar tarefa"
            @click="abrirCadastro(coluna.id)"
          >+</button>
          <span v-else class="btn-add-placeholder"></span>
        </header>

        <div class="lista-cards">
          <div
            v-for="tarefa in tarefasDaColuna(coluna.id)"
            :key="tarefa.id"
            class="task-card"
            :draggable="podeGerenciar(tarefa)"
            @dragstart="iniciarArrasto($event, tarefa)"
            @dragend="finalizarArrasto"
            @click="abrirDetalhes(tarefa.id)"
          >
            <div class="card-topo">
              <span class="prioridade k-badge" :class="tarefa.prioridade" :data-priority="tarefa.prioridade">
                {{ prioridadeLabel(tarefa.prioridade) }}
              </span>
              <span class="task-id">#{{ tarefa.id }}</span>
            </div>

            <h3>{{ tarefa.titulo }}</h3><span v-if="estaAtrasada(tarefa)" class="k-badge" data-status="atrasado">Atrasada</span>
            <p v-if="tarefa.descricao" class="card-descricao">{{ tarefa.descricao }}</p>

            <div class="card-rodape">
              <div class="avatares">
                <span
                  v-for="pessoa in responsaveisDaTarefa(tarefa).slice(0, 3)"
                  :key="pessoa.id"
                  class="avatar"
                  :title="pessoa.nome"
                >{{ pessoa.nome.charAt(0).toUpperCase() }}</span>
                <span v-if="responsaveisDaTarefa(tarefa).length > 3" class="avatar mais">
                  +{{ responsaveisDaTarefa(tarefa).length - 3 }}
                </span>
              </div>
              <span v-if="tarefa.data_inicio" class="prazo" :title="'Início: ' + formatarPrazo(tarefa.data_inicio)"><span class="material-symbols-outlined" aria-hidden="true">event_available</span>{{ formatarPrazo(tarefa.data_inicio) }}</span>
              <span v-if="tarefa.prazo" class="prazo">
                <span class="material-symbols-outlined">calendar_today</span>
                {{ formatarPrazo(tarefa.prazo) }}
              </span>
            </div>
          </div>

          <div v-if="!tarefasDaColuna(coluna.id).length" class="coluna-vazia">
            Nenhuma tarefa nesta etapa
          </div>
          <button
            v-if="isAdmin && coluna.id !== 'atrasado'"
            class="adicionar-rodape"
            @click="abrirCadastro(coluna.id)"
          >+ Adicionar tarefa</button>
        </div>
      </div>
    </section>

    <section class="participantes-area">
      <div class="participantes-topo">
        <div>
          <h2>Participantes <span>{{ participantes.length }}</span></h2>
          <p>Equipe deste projeto</p>
        </div>
        <button v-if="isAdmin" @click="modalParticipanteAberto = true; erroParticipante = ''">
          <span class="material-symbols-outlined">person_add</span>
          Adicionar
        </button>
      </div>
      <div class="participantes-lista">
        <div v-for="pessoa in participantes" :key="pessoa.id" class="participante-item">
          <span class="participante-avatar">{{ pessoa.nome.charAt(0).toUpperCase() }}</span>
          <span class="participante-info"><strong>{{ pessoa.nome }}</strong><small>{{ pessoa.email }}</small></span>
          <select v-if="isAdmin" class="k-filter" :data-role="pessoa.papel" :value="pessoa.papel" :aria-label="'Função de ' + pessoa.nome" :disabled="salvandoPapel" @change="alterarPapel(pessoa, $event)">
            <option value="admin">Administrador</option>
            <option value="participante">Participante</option>
          </select>
          <span v-else class="papel-participante k-badge" :data-role="pessoa.papel">{{ pessoa.papel === 'admin' ? 'Administrador' : 'Participante' }}</span>
          <button v-if="isAdmin" type="button" class="btn-add-coluna" :aria-label="'Remover ' + pessoa.nome" @click="removerParticipante(pessoa.id)">×</button>
        </div>
        <p v-if="!participantes.length" class="sem-participantes">
          Nenhum participante adicionado.
        </p>
      </div>
    </section>

    <ProjectFormModal v-model="modalProjetoAberto" :projeto="projeto.id ? projeto : null" />
    <CreateTaskModal
      v-model="modalCadastroAberto"
      :projeto-id="projetoId"
      :participantes="participantes"
      :status-inicial="statusInicial"
      @created="tarefaCriada"
    />

    <TaskDetails
      v-if="tarefaSelecionada !== null"
      :task-id="tarefaSelecionada"
      :usuario-atual-id="usuarioAtual.id"
      :is-admin="isAdmin"
      :participantes="participantes"
      @close="tarefaSelecionada = null"
      @updated="atualizarQuadro"
      @deleted="atualizarQuadro"
    />

    <div
      v-if="modalParticipanteAberto"
      class="overlay"
      @click.self="modalParticipanteAberto = false"
    >
      <form class="modal-participante" @submit.prevent="adicionarParticipante">
        <h2>Adicionar participante</h2>
        <input aria-label="E-mail do participante" v-model.trim="novoEmailParticipante" type="email" autocomplete="email" placeholder="E-mail do participante" required />
        <input aria-label="Nome do participante" v-model.trim="novoParticipante" autocomplete="name" placeholder="Nome (opcional)" />
        <p v-if="erroParticipante" class="mensagem-erro">{{ erroParticipante }}</p>
        <div class="acoes-modal">
          <button type="button" @click="modalParticipanteAberto = false">Cancelar</button>
          <button type="submit" class="confirmar" :disabled="enviandoParticipante">{{ enviandoParticipante ? 'Adicionando...' : 'Adicionar' }}</button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/auth'
import { mensagemErro } from '/services/apiHelpers.js'
import { tarefaAtrasada } from '@/utils/taskDates'
import { podeEditarTarefa } from '@/utils/taskPermissions'
import ProjectFormModal from '@/components/ProjectFormModal.vue'
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue'
import TaskDetails from '@/components/tasks/TaskDetails.vue'

const route = useRoute()
const store = useTaskStore()
const projetoId = computed(() => Number(route.params.id))
const projectStore = useProjectStore()

const auth = useAuthStore()
const router = useRouter()
const usuarioAtual = computed(() => auth.usuario || {})
const carregando = ref(true)
const projetoCarregado = ref(null)
const modalProjetoAberto = ref(false)
const enviandoParticipante = ref(false)
const isAdmin = computed(() => projetoCarregado.value === projetoId.value && projectStore.podeAdministrar(projetoId.value))
const projeto = computed(() => (projetoCarregado.value === projetoId.value ? projectStore.buscarProjeto(projetoId.value) : null) || { nome: 'Projeto não encontrado', descricao: '' })
const participantes = computed(() => projeto.value.participantes || [])

const colunas = [
  { id: 'atrasado', nome: 'Atrasado', classe: 'coluna-atrasado' },
  { id: 'a_fazer', nome: 'A fazer', classe: 'coluna-fazer' },
  { id: 'em_andamento', nome: 'Em andamento', classe: 'coluna-andamento' },
  { id: 'concluido', nome: 'Concluído', classe: 'coluna-concluido' }
]

const tarefas = computed(() => projetoCarregado.value !== projetoId.value ? [] : store.tarefas.filter(
  tarefa => Number(tarefa.projeto) === projetoId.value
))

const busca = ref('')
const filtroPrioridade = ref('todas')
const filtroParticipante = ref('todos')
const filtroFuncao = ref('todos')
const filtrosAtivos = computed(() => [busca.value.trim() && 'Busca: ' + busca.value.trim(), filtroPrioridade.value !== 'todas' && 'Prioridade: ' + prioridadeLabel(filtroPrioridade.value), filtroParticipante.value !== 'todos' && 'Responsável: ' + participantes.value.find(p => String(p.id) === filtroParticipante.value)?.nome, filtroFuncao.value !== 'todos' && (filtroFuncao.value === 'admin' ? 'Administrador' : 'Participante')].filter(Boolean))
function limparFiltros() { busca.value = ''; filtroPrioridade.value = 'todas'; filtroParticipante.value = 'todos'; filtroFuncao.value = 'todos' }
const erro = ref('')
const modalCadastroAberto = ref(false)
const modalParticipanteAberto = ref(false)
const tarefaSelecionada = ref(null)
const statusInicial = ref('a_fazer')
const novoParticipante = ref('')
const novoEmailParticipante = ref('')
const erroParticipante = ref('')
const colunaSobreposta = ref(null)
const tarefaArrastadaId = ref(null)

function responsaveisDaTarefa(tarefa) {
  return (tarefa.responsaveis || []).map(pessoa => {
    if (typeof pessoa === 'object' && pessoa !== null) return pessoa
    return participantes.value.find(p => Number(p.id) === Number(pessoa))
  }).filter(Boolean)
}

const agora = ref(new Date())
const relogio = setInterval(() => { agora.value = new Date() }, 60000)
onUnmounted(() => clearInterval(relogio))
function estaAtrasada(tarefa) {
  return tarefaAtrasada(tarefa, agora.value.getTime())
}

const tarefasAtrasadas = computed(() => tarefas.value.filter(estaAtrasada))
const indicadores = computed(() => [
  { nome: 'Total de tarefas', valor: tarefas.value.length },
  { nome: 'Em andamento', valor: contarStatus('em_andamento') },
  { nome: 'Concluídas', valor: contarStatus('concluido') },
  { nome: 'Atrasadas', valor: tarefasAtrasadas.value.length },
  { nome: 'Pendentes', valor: tarefas.value.filter(t => t.status === 'a_fazer').length },
  { nome: 'Progresso', valor: (tarefas.value.length ? Math.round(tarefas.value.filter(t => t.status === 'concluido').length / tarefas.value.length * 100) : 0) + '%' }
])

const tarefasFiltradas = computed(() => tarefas.value.filter(tarefa => {
  const texto = `${tarefa.titulo} ${tarefa.descricao || ''}`.toLowerCase()
  const buscaOk = texto.includes(busca.value.trim().toLowerCase())
  const prioridadeOk = filtroPrioridade.value === 'todas' || tarefa.prioridade === filtroPrioridade.value
  const participanteOk = filtroParticipante.value === 'todos' || responsaveisDaTarefa(tarefa)
    .some(p => String(p.id) === filtroParticipante.value)
  const funcaoOk = filtroFuncao.value === 'todos' || responsaveisDaTarefa(tarefa).some(p => participantes.value.some(m => Number(m.id) === Number(p.id) && m.papel === filtroFuncao.value))
  return buscaOk && prioridadeOk && participanteOk && funcaoOk
}))

function tarefasDaColuna(colunaId) {
  return tarefasFiltradas.value.filter(tarefa => colunaId === 'atrasado'
    ? estaAtrasada(tarefa)
    : tarefa.status === colunaId && !estaAtrasada(tarefa))
}

function contarStatus(status) {
  return tarefas.value.filter(tarefa => tarefa.status === status).length
}

function prioridadeLabel(prioridade) {
  return { alta: 'Alta', media: 'Média', baixa: 'Baixa' }[prioridade] || prioridade
}

function formatarPrazo(data) {
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

function podeGerenciar(tarefa) {
  return podeEditarTarefa(tarefa, usuarioAtual.value.id, isAdmin.value)
}

function abrirCadastro(status = 'a_fazer') {
  if (!isAdmin.value) return
  statusInicial.value = status
  modalCadastroAberto.value = true
}

function abrirDetalhes(id) {
  tarefaSelecionada.value = Number(id)
}

function tarefaCriada(tarefa) {
  erro.value = tarefa?.aviso || ''
}

async function atualizarQuadro() {
  try {
    await store.listarTarefas(projetoId.value)
  } catch {
    erro.value = 'Não foi possível atualizar o quadro.'
  }
}

function iniciarArrasto(event, tarefa) {
  if (!podeGerenciar(tarefa)) return event.preventDefault()
  tarefaArrastadaId.value = tarefa.id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(tarefa.id))
}

function finalizarArrasto() {
  tarefaArrastadaId.value = null
  colunaSobreposta.value = null
}

function sairDaColuna(event, colunaId) {
  if (!event.currentTarget.contains(event.relatedTarget) && colunaSobreposta.value === colunaId) {
    colunaSobreposta.value = null
  }
}

async function soltarTarefa(event, colunaId) {
  const id = tarefaArrastadaId.value
  finalizarArrasto()
  if (id === null || colunaId === 'atrasado') return

  const tarefa = tarefas.value.find(item => Number(item.id) === Number(id))
  if (!tarefa || !podeGerenciar(tarefa) || tarefa.status === colunaId) return

  try {
    await store.atualizarTarefa(id, { status: colunaId })
  } catch {
    erro.value = 'Não foi possível mover a tarefa.'
  }
}

async function adicionarParticipante() {
  if (enviandoParticipante.value || !isAdmin.value) return
  enviandoParticipante.value = true
  erroParticipante.value = ''
  try {
    await projectStore.adicionarParticipante(projetoId.value, novoParticipante.value, novoEmailParticipante.value)
    novoParticipante.value = ''
    novoEmailParticipante.value = ''
    modalParticipanteAberto.value = false
  } catch (error) { erroParticipante.value = mensagemErro(error) }
  finally { enviandoParticipante.value = false }
}
const salvandoPapel = ref(false)
async function alterarPapel(pessoa, event) {
  salvandoPapel.value = true
  try { await projectStore.alterarPapel(projetoId.value, pessoa.id, event.target.value) }
  catch (err) { alert(err.response?.data?.papel?.[0] || err.message) }
  finally { event.target.value = participantes.value.find(p => p.id === pessoa.id)?.papel; salvandoPapel.value = false }
}
async function removerParticipante(id) {
  try {
    await projectStore.removerParticipante(projetoId.value, id)
    if (Number(id) === Number(usuarioAtual.value.id)) { router.push('/projects'); return }
    if (filtroParticipante.value === String(id)) filtroParticipante.value = 'todos'
  } catch (error) { erro.value = mensagemErro(error) }
}

async function excluirProjeto() {
  if (!isAdmin.value || !confirm('Excluir o projeto ' + projeto.value.nome + ' e suas tarefas?')) return
  try { await projectStore.excluirProjeto(projetoId.value); router.push('/projects') }
  catch (error) { erro.value = mensagemErro(error) }
}

watch(isAdmin, admin => {
  if (!admin) { modalProjetoAberto.value = false; modalCadastroAberto.value = false; modalParticipanteAberto.value = false }
})
watch(projetoId, async (id, previous, onCleanup) => {
  let ativo = true
  onCleanup(() => { ativo = false })
  projetoCarregado.value = null
  carregando.value = true
  tarefaSelecionada.value = null
  modalCadastroAberto.value = false
  modalParticipanteAberto.value = false
  filtroParticipante.value = 'todos'
  filtroPrioridade.value = 'todas'
  filtroFuncao.value = 'todos'
  busca.value = ''
  store.limparQuadro()
  erro.value = ''
  try {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Projeto inválido.')
    await projectStore.carregarProjeto(id)
    if (!ativo) return
    projetoCarregado.value = id
    await store.listarTarefas(id)
    if (route.query.tarefa && tarefas.value.some(t => Number(t.id) === Number(route.query.tarefa))) tarefaSelecionada.value = Number(route.query.tarefa)
  } catch (error) {
    if (ativo) erro.value = mensagemErro(error)
  } finally { if (ativo) carregando.value = false }
}, { immediate: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.projeto-acoes { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 10px; font-size: 12px; }
.projeto-acoes a, .projeto-acoes button { color: var(--color-primary-dark); }
.projeto-acoes button { padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--color-surface); cursor: pointer; }


.kanban-pagina {
  width: 100%; max-width: 1600px; margin: auto; padding: 12px 16px;
  box-sizing: border-box; font-family: Poppins, sans-serif; color: var(--theme-text-24372a, #24372a);
}
.projeto-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin-bottom: 12px;
}
.projeto-header h1 { margin: 0; font-size: 23px; font-weight: 700; }
.projeto-header p { margin: 3px 0 0; font-size: 11px; color: var(--theme-text-849087, #849087); }
.btn-criar {
  display: flex; align-items: center; gap: 5px; padding: 9px 15px;
  border: 0; border-radius: 9px; background: #2b4532; color: white;
  font: 600 12px Poppins, sans-serif; cursor: pointer; white-space: nowrap;
}
.btn-criar .material-symbols-outlined { font-size: 18px; }

.resumo {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  gap: 9px; margin-bottom: 11px;
}
.resumo-item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 9px 12px; border: 1px solid var(--theme-border-e5ebe6, #e5ebe6);
  border-radius: 9px; background: var(--theme-bg-ffffff, white);
}
.resumo-item span { font-size: 11px; color: var(--theme-text-829086, #829086); }
.resumo-item strong { font-size: 19px; font-weight: 700; }

.toolbar { display: flex; gap: 9px; margin-bottom: 12px; flex-wrap: wrap; }
.campo-busca {
  flex: 1; min-width: 170px; display: flex; align-items: center; gap: 7px;
  padding: 0 10px; border: 1px solid var(--theme-border-dce5de, #dce5de); border-radius: 8px; background: var(--theme-bg-ffffff, white);
}
.campo-busca .material-symbols-outlined { font-size: 18px; color: var(--theme-text-819187, #819187); }
.campo-busca input {
  width: 100%; padding: 9px 0; border: 0; outline: 0; font: 12px Poppins, sans-serif;
}
.toolbar select {
  padding: 9px 11px; border: 1px solid var(--theme-border-dce5de, #dce5de); border-radius: 8px;
  background: var(--theme-bg-ffffff, white); color: var(--theme-text-385240, #385240); font: 11px Poppins, sans-serif;
}

/* Quatro colunas perfeitamente alinhadas */
.kanban-area {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px; width: 100%; align-items: stretch;
}
.kanban-coluna {
  display: flex; flex-direction: column; min-width: 0; min-height: 350px;
  border: 1px solid var(--theme-border-e8ede9, #e8ede9); border-radius: 11px;
  background: var(--theme-bg-f4f6f4, #f4f6f4); overflow: hidden;
}
.kanban-coluna.arrastando-sobre {
  background: var(--theme-bg-e5efe7, #e5efe7); outline: 2px dashed var(--theme-border-4e7855, #4e7855); outline-offset: -2px;
}
.coluna-header {
  display: flex; align-items: center; justify-content: space-between;
  height: 46px; min-height: 46px; padding: 0 11px;
  box-sizing: border-box; border-bottom: 1px solid var(--theme-border-e5eae6, #e5eae6);
}
.coluna-nome { display: flex; align-items: center; gap: 7px; min-width: 0; }
.coluna-nome h2 { margin: 0; font-size: 12px; font-weight: 600; white-space: nowrap; }
.indicador { width: 8px; height: 8px; flex-shrink: 0; border-radius: 50%; }
.coluna-atrasado .indicador { background: var(--theme-bg-e77d80, #e77d80); }
.coluna-fazer .indicador { background: var(--theme-bg-a6adb0, #a6adb0); }
.coluna-andamento .indicador { background: var(--theme-bg-a58cdb, #a58cdb); }
.coluna-concluido .indicador { background: #6eb985; }
.contador {
  padding: 2px 7px; border-radius: 20px; background: var(--theme-bg-e6ebe7, #e6ebe7);
  color: var(--theme-text-66796b, #66796b); font-size: 10px;
}
.btn-add-coluna, .btn-add-placeholder {
  display: flex; align-items: center; justify-content: center;
  width: 25px; height: 25px; flex-shrink: 0;
}
.btn-add-coluna {
  border: 0; background: transparent; color: var(--theme-text-587461, #587461);
  font-size: 22px; cursor: pointer;
}

.lista-cards {
  display: flex; flex: 1; flex-direction: column;
  gap: 9px; padding: 10px; min-width: 0;
}
.task-card {
  min-width: 0; padding: 12px; border: 1px solid var(--theme-border-e1e7e2, #e1e7e2);
  border-radius: 9px; background: var(--theme-bg-ffffff, white); cursor: pointer;
  box-shadow: 0 2px 6px rgba(22,45,28,.025);
  transition: transform .15s, box-shadow .15s;
}
.task-card:hover {
  transform: translateY(-2px); box-shadow: 0 7px 20px rgba(22,45,28,.09);
}
.card-topo, .card-rodape {
  display: flex; align-items: center; justify-content: space-between; gap: 6px;
}
.card-topo { margin-bottom: 9px; }
.prioridade { padding: 3px 7px; border-radius: 5px; font-size: 10px; font-weight: 600; }
.prioridade.alta { background: var(--theme-bg-fff0ed, #fff0ed); color: var(--theme-text-c25a49, #c25a49); }
.prioridade.media { background: var(--theme-bg-fff5dc, #fff5dc); color: var(--theme-text-ac812b, #ac812b); }
.prioridade.baixa { background: var(--theme-bg-e8f5ec, #e8f5ec); color: var(--theme-text-468358, #468358); }
.task-id { color: var(--theme-text-a2ada5, #a2ada5); font-size: 10px; }
.task-card h3 {
  margin: 0 0 6px; font-size: 12px; line-height: 1.5;
  font-weight: 600; overflow-wrap: anywhere;
}
.card-descricao {
  margin: 0 0 10px; color: var(--theme-text-849087, #849087); font-size: 10px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.card-rodape { margin-top: 12px; flex-wrap: wrap; }
.avatares { display: flex; align-items: center; padding-left: 5px; }
.avatar {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; margin-left: -5px;
  border: 2px solid var(--theme-border-ffffff, white); border-radius: 50%;
  background: var(--theme-bg-dfece2, #dfece2); color: var(--theme-text-3d6a48, #3d6a48); font-size: 10px; font-weight: 700;
}
.avatar.mais { background: var(--theme-bg-edf0ee, #edf0ee); color: var(--theme-text-66776b, #66776b); }
.prazo {
  display: flex; align-items: center; gap: 4px;
  color: var(--theme-text-89958c, #89958c); font-size: 10px; white-space: nowrap;
}
.prazo .material-symbols-outlined { font-size: 14px; }
.coluna-vazia {
  padding: 24px 8px; color: var(--theme-text-a3afa6, #a3afa6); text-align: center; font-size: 11px;
}
.adicionar-rodape {
  margin-top: auto; padding: 10px; border: 1px dashed var(--theme-border-d3ded5, #d3ded5);
  border-radius: 8px; background: transparent; color: var(--theme-text-67836e, #67836e);
  font: 11px Poppins, sans-serif; cursor: pointer;
}

/* Participantes sempre visíveis, abaixo das colunas */
.participantes-area {
  margin-top: 12px; padding: 12px 15px; border: 1px solid var(--theme-border-e5ebe6, #e5ebe6);
  border-radius: 11px; background: var(--theme-bg-ffffff, white);
}
.participantes-topo {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.participantes-topo h2 { margin: 0; font-size: 13px; }
.participantes-topo h2 span { margin-left: 5px; color: var(--theme-text-8b9a90, #8b9a90); font-weight: 500; }
.participantes-topo p { margin: 2px 0 0; color: var(--theme-text-9aa79d, #9aa79d); font-size: 10px; }
.participantes-topo button {
  display: flex; align-items: center; gap: 5px; padding: 7px 11px;
  border: 1px solid var(--theme-border-cbdacf, #cbdacf); border-radius: 7px; background: var(--theme-bg-f5f9f6, #f5f9f6);
  color: var(--theme-text-3d6947, #3d6947); font: 600 11px Poppins, sans-serif; cursor: pointer;
}
.participantes-topo .material-symbols-outlined { font-size: 16px; }
.participantes-lista {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px;
}
.participante-item {
  display: flex; align-items: center; gap: 7px; padding: 5px 10px 5px 5px;
  border: 1px solid var(--theme-border-e5ebe6, #e5ebe6); border-radius: 25px; font-size: 11px; color: var(--theme-text-465c4b, #465c4b);
}
.participante-avatar {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--theme-bg-e0ece3, #e0ece3); color: var(--theme-text-3e7049, #3e7049); font-size: 10px; font-weight: 700;
}
.sem-participantes { margin: 0; color: var(--theme-text-94a198, #94a198); font-size: 11px; }
.mensagem-erro { color: var(--theme-text-c0392b, #c0392b); font-size: 12px; }

/* Modal de participantes */
.overlay {
  position: fixed; inset: 0; z-index: 1500; display: flex;
  align-items: center; justify-content: center; padding: 20px;
  background: rgba(0,0,0,.4);
}
.modal-participante {
  width: 100%; max-width: 400px; padding: 25px;
  box-sizing: border-box; border-radius: 14px; background: var(--theme-bg-ffffff, white);
}
.modal-participante h2 { margin: 0 0 18px; font-size: 19px; }
.modal-participante input {
  width: 100%; box-sizing: border-box; padding: 11px;
  border: 1px solid var(--theme-border-dce5de, #dce5de); border-radius: 8px;
}
.acoes-modal { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
.acoes-modal button { padding: 9px 15px; border: 0; border-radius: 8px; cursor: pointer; }
.acoes-modal .confirmar { background: #2b4532; color: white; }

@media (max-width: 1050px) {
  .kanban-area { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kanban-coluna { min-height: 300px; }
}
@media (max-width: 600px) {
  .kanban-pagina { padding: 12px; }
  .projeto-header { align-items: flex-start; flex-wrap: wrap; }
  .projeto-header h1 { font-size: 21px; }
  .resumo { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .toolbar select { flex: 1; min-width: 0; }
  .kanban-area { grid-template-columns: 1fr; }
  .kanban-coluna { min-height: 250px; }
}
.participante-item select { max-width: 145px; padding: 5px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text); border-radius: 6px; }
.papel-participante { font-size: 11px; }
.participante-info { display: flex; flex-direction: column; min-width: 0; }.participante-info strong { font-weight: 600; }.participante-info small { color: var(--color-text-secondary); overflow-wrap: anywhere; }

.campo-busca input { color: inherit; background: transparent; }
.projeto-header h1 { overflow-wrap: anywhere; }
.participante-item { max-width: 100%; flex-wrap: wrap; }
@media (max-width: 600px) {
  .toolbar .campo-busca { flex-basis: 100%; }
  .toolbar select { flex: 1; min-width: 140px; }
  .participante-info { flex: 1; min-width: 120px; }
}
.card-rodape { flex-wrap: wrap; }
.kanban-coluna .coluna-header .indicador { background: var(--badge-text); }
</style>
