<script setup>
import { computed } from 'vue'
import { useWorkspace } from '@/composables/useWorkspace'
import { useAuthStore } from '@/stores/auth'
import { tarefaAtrasada } from '@/utils/taskDates'
const { projects, tasks, loading, error, carregar } = useWorkspace()
const auth = useAuthStore()
const minhas = computed(() =>
  tasks.todasTarefas.filter((t) =>
    t.responsaveis.some((p) => Number(p.id) === Number(auth.usuario?.id)),
  ),
)
const resumo = computed(() => [
  { nome: 'Projetos', valor: projects.projetos.length, icon: 'folder' },
  { nome: 'Minhas tarefas', valor: minhas.value.length, icon: 'task_alt' },
  {
    nome: 'Concluídas',
    valor: minhas.value.filter((t) => t.status === 'concluido').length,
    icon: 'check_circle',
  },
  {
    nome: 'Atrasadas',
    valor: minhas.value.filter((t) => tarefaAtrasada(t)).length,
    icon: 'schedule',
  },
])
const proximas = computed(() =>
  minhas.value
    .filter((t) => t.status !== 'concluido' && t.prazo)
    .toSorted((a, b) => a.prazo.localeCompare(b.prazo))
    .slice(0, 5),
)
</script>
<template>
  <main class="dashboard">
    <header>
      <span class="eyebrow">SEU ESPAÇO DE TRABALHO</span>
      <h1>Olá, {{ (auth.usuario?.nome || auth.usuario?.name || 'você').split(' ')[0] }}.</h1>
      <p>Uma visão do que está acontecendo nos seus projetos.</p>
    </header>
    <p v-if="loading" role="status">Carregando seu resumo...</p>
    <p v-if="error" role="alert">{{ error }} <button @click="carregar">Tentar novamente</button></p>
    <section class="dashboard-summary">
      <article v-for="item in resumo" :key="item.nome">
        <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span
        ><strong>{{ item.valor }}</strong
        ><small>{{ item.nome }}</small>
      </article>
    </section>
    <div class="dashboard-sections">
      <section>
        <header>
          <h2>Seus projetos</h2>
          <RouterLink to="/projects">Ver todos <span aria-hidden="true">↗</span></RouterLink>
        </header>
        <p v-if="!loading && !projects.projetos.length">Crie seu primeiro projeto para começar.</p>
        <RouterLink
          v-for="p in projects.projetos.slice(0, 5)"
          :key="p.id"
          :to="'/projetos/' + p.id + '/kanban'"
          class="dashboard-row"
          ><span class="material-symbols-outlined" aria-hidden="true">folder_open</span
          ><span
            ><strong>{{ p.nome }}</strong
            ><small>{{ p.totalTarefas }} tarefas</small></span
          ><b>{{ p.progresso }}%</b></RouterLink
        >
      </section>
      <section>
        <header>
          <h2>Próximas entregas</h2>
          <RouterLink to="/minhas-tarefas"
            >Minhas tarefas <span aria-hidden="true">↗</span></RouterLink
          >
        </header>
        <p v-if="!loading && !proximas.length">Nenhuma entrega pendente com prazo.</p>
        <RouterLink
          v-for="t in proximas"
          :key="t.id"
          :to="{ name: 'projeto-detalhes', params: { id: t.projeto }, query: { tarefa: t.id } }"
          class="dashboard-row"
          ><span class="material-symbols-outlined" aria-hidden="true">event</span
          ><span
            ><strong>{{ t.titulo }}</strong
            ><small>{{ projects.buscarProjeto(t.projeto)?.nome }}</small></span
          ><span class="k-badge" :data-priority="t.prioridade">{{
            t.prazo.split('-').reverse().join('/')
          }}</span></RouterLink
        >
      </section>
    </div>
  </main>
</template>
<style scoped>
.dashboard {
  max-width: 1200px;
  margin: auto;
  padding: 28px 20px;
  color: var(--color-text);
}
h1 {
  font-size: 29px;
  letter-spacing: -0.8px;
  margin: 8px 0;
  color: var(--color-heading);
}
header p {
  color: var(--color-text-secondary);
  font-size: 13px;
}
.eyebrow {
  letter-spacing: 1.5px;
  color: var(--color-text-muted);
  font-size: 9px;
}
.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 32px 0;
}
.dashboard-summary article {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
}
.dashboard-summary .material-symbols-outlined {
  font-size: 21px;
  color: var(--color-text-muted);
}
.dashboard-summary strong {
  font-size: 29px;
  font-weight: 500;
}
.dashboard-summary small {
  color: var(--color-text-secondary);
  font-size: 11px;
}
.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.dashboard-sections section {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 20px;
  background: var(--color-surface);
}
.dashboard-sections section > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.dashboard-sections h2 {
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}
.dashboard-sections header a {
  color: var(--color-text-muted);
  font-size: 10px;
  text-decoration: none;
}
.dashboard-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  color: inherit;
  text-decoration: none;
  border-top: 1px solid var(--color-border);
}
.dashboard-row > span:nth-child(2) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.dashboard-row strong {
  font-size: 11px;
  font-weight: 500;
}
.dashboard-row small {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 3px;
}
.dashboard-row b {
  font-size: 12px;
  font-weight: 500;
}
.dashboard-row > .material-symbols-outlined {
  color: var(--color-text-muted);
  font-size: 21px;
}
.dashboard-sections section > p {
  color: var(--color-text-secondary);
  font-size: 12px;
}
@media (max-width: 850px) {
  .dashboard-sections {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .dashboard {
    padding: 16px 0;
  }
  .dashboard-summary {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .dashboard-summary article {
    padding: 16px;
  }
}
</style>
