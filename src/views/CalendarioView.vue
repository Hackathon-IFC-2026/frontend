<script setup>
import { computed, ref } from 'vue'
import { tarefaAtrasada } from '@/utils/taskDates'
import { useWorkspace } from '@/composables/useWorkspace'
import { useAuthStore } from '@/stores/auth'
import SharedTaskDetails from '@/components/tasks/SharedTaskDetails.vue'
const { projects, tasks, loading, error, carregar } = useWorkspace()
const auth = useAuthStore()
const agora = new Date()
const mes = ref(agora.getMonth())
const ano = ref(agora.getFullYear())
const projeto = ref('todos')
const status = ref('todos')
const somenteMinhas = ref(false)
const dia = ref(null)
const selecionada = ref(null)
const anoValido = computed(() => Number.isInteger(ano.value) && ano.value >= 1900 && ano.value <= 2200 ? ano.value : agora.getFullYear())
const dataKey = n => anoValido.value + '-' + String(mes.value + 1).padStart(2, '0') + '-' + String(n).padStart(2, '0')
const titulo = computed(() => new Date(anoValido.value, mes.value).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))
const dias = computed(() => [...Array(new Date(anoValido.value, mes.value, 1).getDay()).fill(null), ...Array.from({ length: new Date(anoValido.value, mes.value + 1, 0).getDate() }, (_, i) => i + 1)])
const filtradas = computed(() => tasks.todasTarefas.filter(t => (t.prazo || t.data_inicio) && (projeto.value === 'todos' || t.projeto === Number(projeto.value)) && (status.value === 'todos' || t.status === status.value) && (!somenteMinhas.value || t.responsaveis.some(p => p.id === Number(auth.usuario?.id)))))
const porDia = n => filtradas.value.filter(t => t.prazo === dataKey(n) || t.data_inicio === dataKey(n)).map(t => ({ ...t, evento_inicio: t.data_inicio === dataKey(n), evento_fim: t.prazo === dataKey(n) }))
function navegar(delta) {
  const data = new Date(anoValido.value, mes.value + delta, 1)
  ano.value = data.getFullYear(); mes.value = data.getMonth(); dia.value = null
}
const atrasada = tarefaAtrasada
const nomeStatus = t => atrasada(t) ? 'Atrasada' : ({ a_fazer: 'A fazer', em_andamento: 'Em andamento', concluido: 'Concluída' })[t.status]
</script>
<template>
  <main class="calendario">
    <header><div><h1>Calendário</h1><p>Acompanhe os prazos dos seus projetos.</p></div></header>
    <p v-if="loading" role="status">Carregando tarefas...</p>
    <p v-if="error" role="alert">{{ error }} <button @click="carregar">Tentar novamente</button></p>
    <div class="filtros">
      <select v-model="projeto" aria-label="Projeto"><option value="todos">Todos os projetos</option><option v-for="p in projects.projetos" :key="p.id" :value="p.id">{{ p.nome }}</option></select>
      <select v-model="status" class="k-filter" :data-status="status" aria-label="Status"><option value="todos">Todos os status</option><option value="a_fazer">A fazer</option><option value="em_andamento">Em andamento</option><option value="concluido">Concluídas</option></select>
      <button v-if="projeto !== 'todos' || status !== 'todos' || somenteMinhas" class="clear-filters" @click="projeto = 'todos'; status = 'todos'; somenteMinhas = false">Limpar filtros</button>
      <label><input v-model="somenteMinhas" type="checkbox" /> Somente minhas tarefas</label>
    </div>
    <section class="mes">
      <div class="navegacao"><button aria-label="Mês anterior" @click="navegar(-1)">‹</button><h2>{{ titulo }}</h2><button aria-label="Próximo mês" @click="navegar(1)">›</button><label>Ano <input v-model.number="ano" type="number" min="1900" max="2200" aria-label="Ano" /></label></div>
      <div class="grade">
        <strong v-for="nome in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']" :key="nome" class="semana">{{ nome }}</strong>
        <div v-for="(n, i) in dias" :key="i" class="dia" :class="{ vazio: !n, selecionado: dia === n && n }">
          <button v-if="n" class="numero" :aria-label="'Ver tarefas de ' + dataKey(n)" @click="dia = n">{{ n }} <small v-if="porDia(n).length">({{ porDia(n).length }})</small></button>
          <button v-for="t in n ? porDia(n) : []" :key="t.id" class="evento k-badge" :data-status="atrasada(t) ? 'atrasado' : t.status" :class="[t.status, { atrasada: atrasada(t), 'evento-inicio': t.evento_inicio }]" @click="selecionada = t.id"><small>{{ t.evento_inicio ? t.evento_fim ? 'Início e entrega · ' : 'Início · ' : 'Entrega · ' }}</small>{{ t.titulo }}</button>
        </div>
      </div>
    </section>
    <section v-if="dia" class="lista-dia">
      <h2>Tarefas de {{ dataKey(dia).split('-').reverse().join('/') }}</h2>
      <p v-if="!porDia(dia).length">Nenhuma tarefa para este dia.</p>
      <button v-for="t in porDia(dia)" :key="t.id" class="resumo-tarefa" @click="selecionada = t.id"><strong>{{ t.titulo }}</strong><span>{{ t.evento_inicio ? t.evento_fim ? 'Início e entrega' : 'Início' : 'Entrega' }} · {{ projects.buscarProjeto(t.projeto)?.nome }}</span><span><span class="k-badge" :data-priority="t.prioridade">{{ t.prioridade }}</span> <span class="k-badge" :data-status="atrasada(t) ? 'atrasado' : t.status">{{ nomeStatus(t) }}</span></span><span>{{ t.responsaveis.map(p => p.nome).join(', ') || 'Sem responsável' }}</span></button>
    </section>
    <p v-if="!loading && !error && !filtradas.length">Nenhuma tarefa com prazo para os filtros selecionados.</p>
    <SharedTaskDetails v-if="selecionada" :task-id="selecionada" @close="selecionada = null" />
  </main>
</template>
<style scoped>
.calendario { max-width: 1200px; margin: auto; padding: 28px 24px; color: var(--color-text); }
h1 { margin: 0; color: var(--color-heading); } header p { color: var(--color-text-secondary); }
.filtros, .navegacao { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 20px 0; }
select, input, button { font: inherit; color: inherit; } select, .navegacao input { padding: 9px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); }
.navegacao h2 { flex: 1; text-transform: capitalize; font-size: 20px; margin: 0; } .navegacao button { border: 0; background: var(--color-primary-soft); border-radius: 8px; padding: 4px 15px; font-size: 26px; cursor: pointer; } .navegacao input { width: 95px; }
.mes { border: 1px solid var(--color-border); padding: 16px; border-radius: 16px; background: var(--color-surface); }
.grade { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
.semana { text-align: center; color: var(--color-text-secondary); font-size: 12px; padding: 10px 0; }
.dia { min-height: 110px; border: 1px solid var(--color-border); border-radius: 8px; padding: 5px; background: var(--color-background-soft); }
.dia.vazio { background: transparent; border-color: transparent; }.selecionado { outline: 2px solid var(--color-primary); }
.numero { border: 0; background: transparent; cursor: pointer; padding: 3px; font-weight: 600; }
.evento { display: block; width: 100%; padding: 4px 6px; margin-top: 4px; font-size: 11px; border: 0; border-left: 3px solid #b69238; border-radius: 4px; background: var(--color-primary-soft); text-align: left; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.evento.em_andamento { border-color: #508bc2; }.evento.concluido { border-color: #5e9c68; }.evento.atrasada { border-color: #c55b5b; }
.lista-dia { margin-top: 24px; }.lista-dia h2 { font-size: 18px; }.resumo-tarefa { display: flex; flex-direction: column; width: 100%; text-align: left; padding: 14px; margin: 8px 0; border: 1px solid var(--color-border); background: var(--color-surface); border-radius: 10px; cursor: pointer; }.resumo-tarefa span { color: var(--color-text-secondary); font-size: 12px; }
@media(max-width: 650px) { .calendario { padding: 12px 0; }.mes { padding: 6px; }.grade { gap: 2px; }.dia { min-height: 80px; padding: 2px; }.evento { font-size: 9px; padding: 2px; }.numero small { display: block; font-size: 9px; }.navegacao { gap: 5px; }.navegacao h2 { font-size: 16px; } }
.evento.evento-inicio { border-left-style: dashed; }.evento small { font-size: inherit; font-weight: 500; }
</style>
