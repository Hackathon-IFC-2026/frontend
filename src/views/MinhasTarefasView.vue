<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { tarefaAtrasada } from '@/utils/taskDates'
import { useWorkspace } from '@/composables/useWorkspace'
import SharedTaskDetails from '@/components/tasks/SharedTaskDetails.vue'
const { projects, tasks, loading, error, carregar } = useWorkspace()
const auth = useAuthStore()
const busca = ref('')
const filtroStatus = ref('todos')
const filtroProjeto = ref('todos')
const filtroPrioridade = ref('todos')
const filtroPrazo = ref('todos')
const selecionada = ref(null)
const todasAsTarefas = computed(() => tasks.todasTarefas.filter(t => t.responsaveis.some(p => Number(p.id) === Number(auth.usuario?.id))))
const tarefasEmAndamento = computed(() => todasAsTarefas.value.filter(t => t.status === 'em_andamento').length)
const tarefasConcluidas = computed(() => todasAsTarefas.value.filter(t => t.status === 'concluido').length)
const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
const projetosFiltrados = computed(() => projects.projetos
  .filter(p => filtroProjeto.value === 'todos' || Number(p.id) === Number(filtroProjeto.value))
  .map(p => ({ ...p, tarefas: todasAsTarefas.value.filter(t => t.projeto === Number(p.id)
    && (filtroStatus.value === 'todos' || t.status === filtroStatus.value)
    && (filtroPrioridade.value === 'todos' || t.prioridade === filtroPrioridade.value)
    && (filtroPrazo.value === 'todos' || filtroPrazo.value === 'hoje' && t.prazo === hoje() || filtroPrazo.value === 'atrasadas' && tarefaAtrasada(t) || filtroPrazo.value === 'sem' && !t.prazo)
    && (!busca.value.trim() || [t.titulo, t.descricao, p.nome].some(v => v?.toLocaleLowerCase('pt-BR').includes(busca.value.trim().toLocaleLowerCase('pt-BR'))))) }))
  .filter(p => p.tarefas.length))
const nomeStatus = status => ({ a_fazer: 'A fazer', em_andamento: 'Em andamento', concluido: 'Concluída' })[status]
const classeStatus = status => 'status-' + ({ a_fazer: 'fazer', em_andamento: 'em_processo' }[status] || status)
const classePrioridade = prioridade => 'prioridade-' + prioridade
const formatarPrazo = prazo => prazo ? prazo.split('-').reverse().join('/') : 'Sem prazo'
</script>

<template>
  <main class="minhas-tarefas">
    <header class="pagina-cabecalho">
      <div>
        <h1>Minhas tarefas</h1>
        <p class="pagina-descricao">
          Acompanhe suas atividades organizadas pelos projetos em que participa.
        </p>
      </div>
      </header>

    <p v-if="loading" role="status">Carregando suas tarefas...</p>
    <p v-if="error" role="alert">{{ error }} <button @click="carregar">Tentar novamente</button></p>
    <section class="resumo" aria-label="Resumo das minhas tarefas">
      <article class="resumo-card">
        <span class="resumo-icone total-icone material-symbols-outlined" aria-hidden="true">
          task_alt
        </span>
        <div>
          <p>Total de tarefas</p>
          <strong>{{ todasAsTarefas.length }}</strong>
        </div>
      </article>
      <article class="resumo-card">
        <span
          class="resumo-icone andamento-icone material-symbols-outlined"
          aria-hidden="true"
        >
          pending_actions
        </span>
        <div>
          <p>Em andamento</p>
          <strong>{{ tarefasEmAndamento }}</strong>
        </div>
      </article>
      <article class="resumo-card">
        <span
          class="resumo-icone concluida-icone material-symbols-outlined"
          aria-hidden="true"
        >
          check_circle
        </span>
        <div>
          <p>Concluídas</p>
          <strong>{{ tarefasConcluidas }}</strong>
        </div>
      </article>
    </section>

    <section class="lista-projetos" aria-labelledby="projetos-title">
      <div class="secao-cabecalho">
        <div>
          <h2 id="projetos-title">Projetos e atividades</h2>
          <p>Suas tarefas aparecem agrupadas por projeto.</p>
        </div>

        <div class="filtros">
          <label class="campo-busca">
            <span class="material-symbols-outlined" aria-hidden="true">search</span>
            <input
              v-model="busca"
              type="search"
              placeholder="Buscar projeto ou tarefa"
              aria-label="Buscar projeto ou tarefa"
            />
          </label>

          <label class="filtro-status">
            <span class="visually-hidden">Filtrar tarefas por status</span>
            <select v-model="filtroStatus" class="k-filter" :data-status="filtroStatus">
              <option value="todos">Todos os status</option>
              <option value="a_fazer">A fazer</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluido">Concluídas</option>
            </select>
          </label>
          <label class="filtro-status"><span class="visually-hidden">Projeto</span><select v-model="filtroProjeto"><option value="todos">Todos os projetos</option><option v-for="p in projects.projetos" :key="p.id" :value="p.id">{{ p.nome }}</option></select></label>
          <label class="filtro-status"><span class="visually-hidden">Prioridade</span><select v-model="filtroPrioridade" class="k-filter" :data-priority="filtroPrioridade"><option value="todos">Todas as prioridades</option><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select></label>
          <label class="filtro-status"><span class="visually-hidden">Prazo</span><select v-model="filtroPrazo"><option value="todos">Todos os prazos</option><option value="hoje">Hoje</option><option value="atrasadas">Atrasadas</option><option value="sem">Sem prazo</option></select></label>
          <button v-if="busca || filtroStatus !== 'todos' || filtroProjeto !== 'todos' || filtroPrioridade !== 'todos' || filtroPrazo !== 'todos'" class="clear-filters" @click="busca = ''; filtroStatus = 'todos'; filtroProjeto = 'todos'; filtroPrioridade = 'todos'; filtroPrazo = 'todos'">Limpar filtros</button>
        </div>
      </div>

      <div v-if="projetosFiltrados.length" class="projetos-lista">
        <article
          v-for="projeto in projetosFiltrados"
          :key="projeto.id"
          class="projeto-card"
        >
          <header class="projeto-cabecalho">
            <div class="projeto-marca material-symbols-outlined" aria-hidden="true">
              folder_open
            </div>
            <div class="projeto-info">
              <h3>
                <RouterLink
                  :to="{ name: 'projeto-detalhes', params: { id: projeto.id } }"
                  class="projeto-link"
                >
                  {{ projeto.nome }}
                </RouterLink>
              </h3>
              <p>{{ projeto.descricao }}</p>
            </div>
            <span class="contador-tarefas">
              {{ projeto.tarefas.length }}
              {{ projeto.tarefas.length === 1 ? 'tarefa' : 'tarefas' }}
            </span>
          </header>

          <ul class="tarefas-lista">
            <li v-for="tarefa in projeto.tarefas" :key="tarefa.id" class="tarefa-linha">
              <div class="tarefa-principal">
                <span
                  class="marcador-status"
                  :class="classeStatus(tarefa.status)"
                  aria-hidden="true"
                ></span>
                <div>
                  <h4><button class="abrir-tarefa" @click="selecionada = tarefa.id">{{ tarefa.titulo }}</button></h4><p>{{ tarefa.descricao }}</p>
                  <p class="prazo-tarefa">
                    <span class="material-symbols-outlined" aria-hidden="true">
                      calendar_today
                    </span>
                    <span v-if="tarefa.data_inicio">Início: {{ formatarPrazo(tarefa.data_inicio) }} · </span>Prazo: {{ formatarPrazo(tarefa.prazo) }}
                  </p>
                </div>
              </div>

              <div class="tarefa-etiquetas"><span v-if="tarefaAtrasada(tarefa)" class="k-badge" data-status="atrasado">Atrasada</span>
                <span class="etiqueta-status k-badge" :data-status="tarefa.status" :class="classeStatus(tarefa.status)">
                  {{ nomeStatus(tarefa.status) }}
                </span>
                <span class="etiqueta-prioridade k-badge" :data-priority="tarefa.prioridade" :class="classePrioridade(tarefa.prioridade)">
                  {{ tarefa.prioridade }}
                </span>
              </div>
            </li>
          </ul>
        </article>
      </div>

      <div v-else-if="!loading && !error" class="estado-vazio">
        <span class="material-symbols-outlined" aria-hidden="true">search_off</span>
        <h3>Nenhuma tarefa encontrada</h3>
        <p>Altere a busca ou o filtro de status para ver outras tarefas.</p>
      </div>
    </section>
    <SharedTaskDetails v-if="selecionada" :task-id="selecionada" @close="selecionada = null" />
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.minhas-tarefas {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 28px 32px 48px;
  color: var(--theme-text-1a3721, #1a3721);
}

.pagina-cabecalho,
.secao-cabecalho,
.projeto-cabecalho,
.tarefa-linha,
.tarefa-principal,
.tarefa-etiquetas,
.filtros,
.resumo-card {
  display: flex;
  align-items: center;
}

.pagina-cabecalho,
.secao-cabecalho,
.projeto-cabecalho,
.tarefa-linha {
  justify-content: space-between;
}

.pagina-cabecalho {
  margin-bottom: 20px;
}

.sobretitulo {
  margin: 0 0 6px;
  color: var(--theme-text-4e7855, #4e7855);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pagina-cabecalho h1 {
  margin: 0;
  font-size: 2.1rem;
  font-weight: 800;
  color: var(--theme-text-111827, #111827);
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.pagina-descricao,
.secao-cabecalho p,
.projeto-info p,
.resumo-card p,
.estado-vazio p {
  color: var(--theme-text-68756a, #68756a);
}

.pagina-descricao {
  margin: 8px 0 0;
}

.icone-cabecalho {
  color: var(--theme-text-4e7855, #4e7855);
  font-size: 2.8rem;
}

.aviso-demonstracao {
  margin: 0 0 20px;
  padding: 12px 16px;
  border: 1px solid var(--theme-border-e7d39c, #e7d39c);
  border-radius: 10px;
  background: var(--theme-bg-fff9e8, #fff9e8);
  color: var(--theme-text-6c5720, #6c5720);
  font-size: 0.9rem;
}

.resumo {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.resumo-card {
  gap: 14px;
  min-height: 100px;
  padding: 18px;
  border: 1px solid var(--theme-border-e7ebe7, #e7ebe7);
  border-radius: 14px;
  background: var(--theme-bg-ffffff, #fff);
  box-shadow: 0 3px 12px rgba(26, 55, 33, 0.04);
}

.resumo-icone {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
  font-size: 1.5rem;
}

.total-icone {
  background: var(--theme-bg-eaf2eb, #eaf2eb);
  color: var(--theme-text-315e3b, #315e3b);
}

.andamento-icone {
  background: var(--theme-bg-fff0dc, #fff0dc);
  color: var(--theme-text-b96a12, #b96a12);
}

.concluida-icone {
  background: var(--theme-bg-e5f4e8, #e5f4e8);
  color: var(--theme-text-32804a, #32804a);
}

.resumo-card p {
  margin: 0 0 4px;
  font-size: 0.85rem;
}

.resumo-card strong {
  font-size: 1.5rem;
}

.lista-projetos {
  padding: 22px;
  border-radius: 16px;
  background: var(--theme-bg-f7f9f7, #f7f9f7);
}

.secao-cabecalho {
  gap: 18px;
  margin-bottom: 18px;
}

.secao-cabecalho h2 {
  margin: 0;
  font-size: 1.25rem;
}

.secao-cabecalho p {
  margin: 5px 0 0;
  font-size: 0.85rem;
}

.filtros {
  gap: 10px;
}

.campo-busca,
.filtro-status select {
  display: flex;
  align-items: center;
  min-height: 42px;
  border: 1px solid var(--theme-border-dce3dc, #dce3dc);
  border-radius: 9px;
  background: var(--theme-bg-ffffff, #fff);
  color: var(--theme-text-516052, #516052);
}

.campo-busca {
  gap: 8px;
  padding: 0 11px;
}

.campo-busca .material-symbols-outlined {
  font-size: 1.15rem;
}

.campo-busca input {
  width: 190px;
  border: 0;
  outline: 0;
  color: var(--theme-text-1a3721, #1a3721);
  font: inherit;
  font-size: 0.85rem;
}

.filtro-status select {
  padding: 0 30px 0 12px;
  font: inherit;
  font-size: 0.85rem;
}

.projetos-lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  align-items: start;
  gap: 16px;
}

.projeto-card {
  overflow: hidden;
  min-width: 0;
  border: 1px solid var(--theme-border-e1e5e1, #e1e5e1);
  border-radius: 12px;
  background: var(--theme-bg-ebebeb, #ebebeb);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.projeto-cabecalho {
  justify-content: flex-start;
  gap: 12px;
  min-height: 76px;
  padding: 14px;
}

.projeto-marca {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 11px;
  background: var(--theme-bg-eaf2eb, #eaf2eb);
  color: var(--theme-text-315e3b, #315e3b);
  font-size: 1.35rem;
}

.projeto-info {
  min-width: 0;
  flex: 1;
}

.projeto-info h3 {
  margin: 0;
  font-size: 1rem;
}

.projeto-link {
  color: inherit;
  text-decoration: none;
}

.projeto-link:hover {
  color: var(--theme-text-315e3b, #315e3b);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.projeto-link:focus-visible {
  border-radius: 3px;
  outline: 2px solid var(--theme-border-4e7855, #4e7855);
  outline-offset: 3px;
}

.projeto-info p {
  overflow: hidden;
  margin: 4px 0 0;
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contador-tarefas {
  flex: 0 0 auto;
  color: var(--theme-text-68756a, #68756a);
  font-size: 0.8rem;
}

.tarefas-lista {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0 10px 10px;
  list-style: none;
}

.tarefa-linha {
  align-items: stretch;
  flex-direction: column;
  gap: 10px;
  min-height: 100px;
  padding: 12px 14px 10px;
  border-radius: 12px;
  background: var(--theme-bg-ffffff, #fff);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.tarefa-linha:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.tarefa-principal {
  min-width: 0;
  gap: 12px;
}

.marcador-status {
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
  border-radius: 50%;
}

.marcador-status.status-fazer {
  background: #77917a;
}

.marcador-status.status-em_processo {
  background: #db8a27;
}

.marcador-status.status-concluido {
  background: #3b8a54;
}

.tarefa-principal h4 {
  margin: 0;
  color: var(--theme-text-000000, #000);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.prazo-tarefa {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 8px 0 0;
  color: var(--theme-text-999999, #999);
  font-size: 0.68rem;
}

.prazo-tarefa .material-symbols-outlined {
  font-size: 0.9rem;
}

.tarefa-etiquetas {
  justify-content: space-between;
  gap: 8px;
}

.etiqueta-status,
.etiqueta-prioridade {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
}

.etiqueta-status.status-fazer {
  background: var(--theme-bg-edf1ed, #edf1ed);
  color: var(--theme-text-526653, #526653);
}

.etiqueta-status.status-em_processo {
  background: var(--theme-bg-fff0dc, #fff0dc);
  color: var(--theme-text-a75e0b, #a75e0b);
}

.etiqueta-status.status-concluido {
  background: var(--theme-bg-e5f4e8, #e5f4e8);
  color: var(--theme-text-28713e, #28713e);
}

.prioridade-alta {
  background: var(--theme-bg-ffe3e5, #ffe3e5);
  color: var(--theme-text-bd3342, #bd3342);
}

.prioridade-media {
  background: var(--theme-bg-fff0dc, #fff0dc);
  color: var(--theme-text-a75e0b, #a75e0b);
}

.prioridade-baixa {
  background: var(--theme-bg-eff3d8, #eff3d8);
  color: var(--theme-text-6e761c, #6e761c);
}

.estado-vazio {
  padding: 44px 16px;
  text-align: center;
}

.estado-vazio > .material-symbols-outlined {
  color: var(--theme-text-829184, #829184);
  font-size: 2.4rem;
}

.estado-vazio h3 {
  margin: 10px 0 6px;
}

.estado-vazio p {
  margin: 0;
  font-size: 0.9rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@media (max-width: 760px) {
  .minhas-tarefas {
    padding: 20px 16px 32px;
  }

  .resumo {
    gap: 10px;
  }

  .resumo-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    padding: 13px;
  }

  .secao-cabecalho {
    align-items: stretch;
    flex-direction: column;
  }

  .filtros {
    align-items: stretch;
    flex-direction: column;
  }

  .campo-busca input {
    width: 100%;
  }

  .filtro-status select {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .resumo {
    grid-template-columns: 1fr;
  }

  .resumo-card {
    align-items: center;
    flex-direction: row;
  }

  .lista-projetos {
    padding: 16px 12px;
  }

  .projeto-cabecalho {
    padding: 14px 12px;
  }

  .contador-tarefas {
    font-size: 0.7rem;
  }
}
.abrir-tarefa { background: none; border: 0; color: inherit; font: inherit; font-weight: 600; cursor: pointer; padding: 0; text-align: left; }
.filtros { flex-wrap: wrap; }
</style>
