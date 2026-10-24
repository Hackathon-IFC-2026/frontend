<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInsightsStore } from '@/stores/insights'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/auth'
import SharedTaskDetails from '@/components/tasks/SharedTaskDetails.vue'

const route = useRoute()
const router = useRouter()
const insights = useInsightsStore()
const projects = useProjectStore()
const tasks = useTaskStore()
const auth = useAuthStore()
const selecionado = ref('')
const aberto = ref(null)
const detalhe = ref(null)
const confirmacao = ref(null)
const destinos = ref({})
const capacidades = ref({})
const ignoradas = ref(new Set())
const aviso = ref('')
const erroInicial = ref('')
const iniciando = ref(true)
const analise = computed(() => insights.analise)
const membros = computed(() => analise.value?.participantes || [])
const projeto = computed(() => projects.buscarProjeto(selecionado.value))
const admin = computed(() => !!analise.value?.administrador && projects.podeAdministrar(selecionado.value))
const labels = { equilibrada: 'Carga equilibrada', atencao: 'Atenção', sobrecarga: 'Possível sobrecarga' }
const prioridade = { 1: 'Baixa', 2: 'Média', 3: 'Alta' }
const status = { aberta: 'A fazer', andamento: 'Em andamento', concluida: 'Concluída' }
const chave = s => [s.tarefa, s.origem, s.destino].join(':')
const sugestoes = computed(() => (analise.value?.sugestoes || []).filter(s => !ignoradas.value.has(chave(s))))
const alertas = computed(() => membros.value.filter(p => p.nivel === 'sobrecarga'))
const resumo = computed(() => [
  { nome: admin.value ? 'Pessoas na análise' : 'Minha análise', valor: membros.value.length },
  { nome: 'Tarefas pendentes', valor: membros.value.reduce((n, p) => n + p.pendentes, 0) },
  { nome: 'Prazos em até 48h', valor: membros.value.reduce((n, p) => n + p.proximas, 0) },
  { nome: 'Possível sobrecarga', valor: alertas.value.length },
])
function nome(id) { return membros.value.find(p => p.usuario === id)?.nome || 'Participante' }
function data(value) { return value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }) : 'Sem prazo' }
function ignorar(s) { ignoradas.value = new Set([...ignoradas.value, chave(s)]); confirmacao.value = null }
async function transferir(s) {
  aviso.value = ''
  const destino = Number(destinos.value[chave(s)] || s.destino)
  if (await insights.redistribuir(selecionado.value, s, destino)) {
    aviso.value = 'Responsável atualizado. A alteração foi registrada no histórico e os envolvidos foram notificados.'
    confirmacao.value = null
  }
}
async function salvarCapacidade(p) {
  const valor = Number(capacidades.value[p.usuario] ?? p.capacidade)
  if (!Number.isInteger(valor) || valor < 1 || valor > 1000) { insights.error = 'Informe uma capacidade entre 1 e 1000 pontos.'; return }
  if (await insights.capacidade(selecionado.value, p.usuario, valor)) aviso.value = 'Capacidade atualizada.'
}
async function atualizar() {
  if (selecionado.value && !document.hidden && !insights.saving) await insights.carregar(selecionado.value, true)
}
watch(selecionado, async id => {
  aberto.value = null; detalhe.value = null; confirmacao.value = null; aviso.value = ''; erroInicial.value = ''; destinos.value = {}; capacidades.value = {}; ignoradas.value = new Set()
  if (!id) { insights.limpar(); return }
  await router.replace({ name: 'insights', query: { projeto: id } })
  await insights.carregar(id)
})
watch(() => route.query.projeto, id => {
  if (id && projects.buscarProjeto(id)) selecionado.value = String(id)
})
// Shared task edits and the global workspace refresh also refresh this analysis.
watch(() => JSON.stringify(tasks.todasTarefas), atualizar)
watch(() => projects.vinculos, atualizar)
let timer
let ativo = true
onMounted(async () => {
  insights.limpar()
  try {
    await projects.listarProjetos()
    await tasks.listarTodas()
    const id = String(route.query.projeto || '')
    if (id && !projects.buscarProjeto(id)) erroInicial.value = 'Projeto não encontrado ou sem acesso.'
    else selecionado.value = id || String(projects.projetos[0]?.id || '')
  } catch { erroInicial.value = projects.error || tasks.error || 'Não foi possível carregar seus projetos.' }
  finally { iniciando.value = false }
  if (ativo) timer = setInterval(atualizar, 30000)
})
onUnmounted(() => { ativo = false; clearInterval(timer); insights.limpar() })
</script>

<template>
  <main class="insights-page">
    <header class="insights-header">
      <div><span class="eyebrow"><span class="material-symbols-outlined">monitoring</span> Um olhar sobre a equipe</span><h1>Kando Insights</h1><p>Entenda a carga de trabalho e encontre espaço para equilibrar as responsabilidades.</p></div>
      <button class="secondary" :disabled="!selecionado || insights.loading || insights.saving" @click="atualizar"><span class="material-symbols-outlined">refresh</span> Atualizar</button>
    </header>
    <section class="project-picker">
      <label for="insights-project">Projeto <select id="insights-project" v-model="selecionado" :disabled="iniciando || insights.saving"><option value="" disabled>Selecione um projeto</option><option v-for="p in projects.projetos" :key="p.id" :value="String(p.id)">{{ p.nome }}</option></select></label>
      <RouterLink v-if="projeto" :to="'/projects/' + projeto.id">Abrir Kanban ↗</RouterLink>
      <span v-if="analise" class="k-badge" :data-role="admin ? 'admin' : 'participante'">{{ admin ? 'Visão da equipe' : 'Minha carga de trabalho' }}</span>
    </section>
    <p v-if="erroInicial || insights.error" class="error notice" role="alert">{{ erroInicial || insights.error }}</p>
    <p v-if="aviso" class="success notice" role="status">{{ aviso }}</p>
    <p v-if="iniciando || insights.loading" class="empty" role="status">Analisando a distribuição das tarefas…</p>
    <section v-else-if="!projects.projetos.length && !erroInicial" class="empty"><h2>Ainda não há projetos para analisar</h2><p>Crie um projeto ou participe de uma equipe para acompanhar sua carga.</p><RouterLink to="/projects">Ir para projetos</RouterLink></section>
    <template v-else-if="analise">
      <section class="summary" aria-label="Resumo da carga"><article v-for="item in resumo" :key="item.nome"><span>{{ item.nome }}</span><strong>{{ item.valor }}</strong></article></section>
      <div v-for="p in alertas" :key="p.usuario" class="notice overload" role="status"><span class="material-symbols-outlined">info</span><p><strong>Possível sobrecarga: {{ p.nome }}</strong><br>{{ p.pendentes }} tarefas pendentes, {{ p.proximas }} com prazo nas próximas 48 horas e {{ p.atrasadas }} atrasadas.</p><button class="secondary" @click="aberto = p.usuario">Analisar distribuição</button></div>
      <div class="section-heading"><div><h2>{{ admin ? 'Distribuição da equipe' : 'Sua carga de trabalho' }}</h2><p>Estimativa em pontos, considerando a capacidade de cada pessoa.</p></div><small>Atualizado {{ data(analise.calculado_em) }}</small></div>
      <section class="people-grid">
        <article v-for="p in membros" :key="p.usuario" class="person-card" :data-level="p.nivel">
          <header><div class="person"><span class="avatar">{{ p.nome.trim().slice(0, 2).toUpperCase() }}</span><div><h3>{{ p.nome }}</h3><span class="k-badge" :data-role="p.papel">{{ p.papel === 'admin' ? 'Administrador' : 'Participante' }}</span></div></div><span class="level">{{ labels[p.nivel] }}</span></header>
          <div class="score"><strong>{{ p.pontos }} <small>/ {{ p.capacidade }} pontos</small></strong><span>{{ p.percentual }}%</span></div>
          <div class="meter" role="meter" :aria-label="'Carga estimada de ' + p.nome" :aria-valuenow="p.pontos" :aria-valuemin="0" :aria-valuemax="Math.max(p.capacidade, p.pontos)" :aria-valuetext="p.pontos + ' pontos de ' + p.capacidade + ' de capacidade'"><span :style="{ width: Math.min(100, p.percentual) + '%' }"></span></div>
          <dl class="metrics"><div v-for="m in [{ label: 'Pendentes', value: p.pendentes }, { label: 'Em andamento', value: p.andamento }, { label: 'Atrasadas', value: p.atrasadas }, { label: 'Em até 48h', value: p.proximas }, { label: 'Alta prioridade', value: p.altas }, { label: 'Bloqueadas', value: p.bloqueadas }]" :key="m.label"><dt>{{ m.label }}</dt><dd>{{ m.value }}</dd></div></dl>
          <form v-if="admin" class="capacity" @submit.prevent="salvarCapacidade(p)"><label :for="'capacity-' + p.usuario">Capacidade de referência<input :id="'capacity-' + p.usuario" :value="capacidades[p.usuario] ?? p.capacidade" type="number" min="1" max="1000" required @input="capacidades[p.usuario] = $event.target.value"></label><button class="secondary" :disabled="insights.saving">Salvar</button></form>
          <button class="tasks-button" :aria-expanded="aberto === p.usuario" @click="aberto = aberto === p.usuario ? null : p.usuario">{{ aberto === p.usuario ? 'Ocultar tarefas' : 'Ver tarefas' }} <span class="material-symbols-outlined">{{ aberto === p.usuario ? 'expand_less' : 'expand_more' }}</span></button>
          <ul v-if="aberto === p.usuario" class="task-list"><li v-if="!p.tarefas.length">Nenhuma tarefa pendente.</li><li v-for="t in p.tarefas" :key="t.id"><button @click="detalhe = t.id"><strong>{{ t.titulo }}</strong><span>{{ status[t.situacao] }} · {{ data(t.prazo) }}</span><span>Complexidade {{ prioridade[t.complexidade].toLowerCase() }} · {{ t.pontos }} pontos<span v-if="t.impedida"> · Bloqueada</span></span><span class="k-badge" :data-priority="{1: 'baixa', 2: 'media', 3: 'alta'}[t.prioridade]">Prioridade {{ prioridade[t.prioridade].toLowerCase() }}</span></button></li></ul>
        </article>
      </section>
      <p v-if="admin && analise.sem_responsavel" class="notice">{{ analise.sem_responsavel }} tarefa(s) sem responsável não entram na carga individual. <RouterLink :to="'/projects/' + selecionado">Atribuir no Kanban</RouterLink></p>
      <section v-if="admin" class="suggestions"><div class="section-heading"><div><h2>Sugestões de redistribuição</h2><p>A equipe decide. Nenhuma mudança acontece automaticamente.</p></div><span class="material-symbols-outlined">balance</span></div>
        <p v-if="!sugestoes.length" class="empty">{{ alertas.length ? 'Nenhuma transferência segura sugerida com a capacidade atual. Revise prazos, bloqueios e disponibilidade da equipe.' : 'Não há redistribuições necessárias neste momento.' }}</p>
        <article v-for="s in sugestoes" :key="chave(s)" class="suggestion"><h3>{{ s.titulo }}</h3><p>De <strong>{{ nome(s.origem) }}</strong> para <strong>{{ nome(s.destino) }}</strong> · {{ s.pontos }} pontos</p><p>{{ s.motivo }}</p><label :for="'destination-' + s.tarefa">Escolher responsável<select :id="'destination-' + s.tarefa" :value="destinos[chave(s)] || s.destino" :disabled="insights.saving" @change="destinos[chave(s)] = Number($event.target.value); confirmacao = null"><option v-for="p in membros.filter(p => p.usuario !== s.origem)" :key="p.usuario" :value="p.usuario">{{ p.nome }} · {{ p.pontos }}/{{ p.capacidade }} pontos</option></select></label>
          <div v-if="confirmacao === chave(s)" class="confirmation"><p>Confirmar a transferência para {{ nome(Number(destinos[chave(s)] || s.destino)) }}? O responsável anterior perderá a atribuição.</p><button class="primary" :disabled="insights.saving" @click="transferir(s)">{{ insights.saving ? 'Transferindo…' : 'Confirmar transferência' }}</button><button class="secondary" :disabled="insights.saving" @click="confirmacao = null">Cancelar</button></div>
          <div v-else class="actions"><button class="primary" :disabled="insights.saving" @click="confirmacao = chave(s)">Aceitar sugestão</button><button class="secondary" :disabled="insights.saving" @click="ignorar(s)">Ignorar</button></div>
        </article>
      </section>
      <details class="method"><summary>Como calculamos esta estimativa?</summary><p>Complexidade baixa: {{ analise.pesos.baixa }} ponto(s); média: {{ analise.pesos.media }}; alta: {{ analise.pesos.alta }}. Alta prioridade adiciona {{ analise.pesos.prioridade }}; vencimento nas próximas 48h adiciona {{ analise.pesos.proxima }}; atraso adiciona {{ analise.pesos.atrasada }}.</p><p>Tarefas concluídas são excluídas. Tarefas bloqueadas ficam separadas da carga executável. Atenção começa em {{ Math.round(analise.limite_atencao * 100) }}% da capacidade; possível sobrecarga aparece acima de 100%. Prazos são exibidos no horário de Brasília.</p><p>Os pontos apoiam o planejamento e não medem competência nem produtividade. Conhecimento do assunto e disponibilidade real devem ser confirmados com a equipe antes de transferir uma tarefa.</p></details>
    </template>
    <SharedTaskDetails v-if="detalhe && auth.usuario" :task-id="detalhe" @close="detalhe = null; atualizar()" @deleted="detalhe = null; atualizar()" />
  </main>
</template>

<style scoped>
.insights-page{max-width:1320px;margin:0 auto;padding:12px 8px 40px;color:var(--color-text, #252525)}
.insights-header,.project-picker,.section-heading,.person-card header,.person,.score,.actions,.notice,.capacity{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.insights-header,.section-heading,.person-card header,.score{justify-content:space-between}
h1{font-size:32px;letter-spacing:-1px;margin:8px 0}h2{font-size:20px;margin:0 0 6px}h3{font-size:15px;margin:0 0 6px;overflow-wrap:anywhere}p{line-height:1.6;margin:6px 0;color:var(--color-text-secondary, #666)}
.eyebrow{display:flex;gap:8px;align-items:center;color:var(--color-text-muted, #858585);font-size:12px}.material-symbols-outlined{font-size:21px}
button,input,select{font:inherit}button,a,summary{touch-action:manipulation}button{cursor:pointer;border-radius:10px;padding:10px 14px;border:1px solid var(--color-border, #eaecea);display:inline-flex;align-items:center;gap:7px;justify-content:center}button:disabled{opacity:.5;cursor:wait}button:focus-visible,a:focus-visible,select:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid #7656a8;outline-offset:3px}
.secondary{background:var(--theme-bg-ffffff,#fff);color:inherit}.primary{background:#625282;color:#fff;border-color:#625282}a{color:inherit;text-underline-offset:4px}
.project-picker{margin:28px 0}.project-picker label{display:flex;gap:12px;align-items:center;font-weight:500}.project-picker select{min-width:220px;max-width:100%}input,select{padding:10px 12px;border:1px solid var(--color-border, #eaecea);border-radius:10px;color:inherit;background:var(--theme-bg-ffffff,#fff)}
.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:24px}.summary article,.person-card,.suggestions,.method{background:var(--theme-bg-ffffff,#fff);border:1px solid var(--color-border, #eaecea);border-radius:16px;padding:22px}.summary article span{display:block;font-size:12px;color:var(--color-text-muted, #858585)}.summary strong{display:block;font-size:30px;margin-top:8px;font-weight:600}
.notice{padding:16px;border-radius:12px;background:var(--color-background-soft, #f5f5f5);margin:14px 0}.notice p{flex:1;margin:0}.overload,.error{background:#fff0ed;color:#9d4d43}.success{background:#e8f5e9;color:#326947}.overload p,.error p{color:inherit}.section-heading{margin:28px 0 18px}.section-heading p,small{font-size:12px;color:var(--color-text-muted, #858585)}.people-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.person-card{min-width:0;--level:#43835a;--level-bg:#e8f5e9}.person-card[data-level=atencao]{--level:#a67a28;--level-bg:#fff4d9}.person-card[data-level=sobrecarga]{--level:#b85c5c;--level-bg:#fce8e8}.person{flex:1;min-width:0}.avatar{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--color-background-mute, #f1f3f2);font-size:12px;flex-shrink:0}.level{color:var(--level);background:var(--level-bg);font-size:11px;border-radius:20px;padding:6px 9px}.score{margin:24px 0 10px}.score strong{font-size:21px}.score small{font-size:12px;font-weight:400}.score>span{font-size:12px;color:var(--level)}.meter{height:7px;border-radius:8px;background:var(--color-background-mute, #f1f3f2);overflow:hidden}.meter>span{display:block;height:100%;background:var(--level);border-radius:8px;transition:width .3s}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 10px;margin:22px 0}.metrics dt{font-size:11px;color:var(--color-text-muted, #858585)}.metrics dd{margin:5px 0 0;font-size:18px;font-weight:500}.capacity{border-top:1px solid var(--color-border, #eaecea);padding-top:16px;align-items:flex-end}.capacity label{display:grid;gap:6px;font-size:11px;flex:1}.capacity input{width:100%;box-sizing:border-box}.tasks-button{width:100%;margin-top:16px;justify-content:space-between;background:transparent;color:inherit}.task-list{list-style:none;padding:0;margin:12px 0 0}.task-list li+li{border-top:1px solid var(--color-border, #eaecea)}.task-list button{width:100%;display:flex;flex-direction:column;align-items:flex-start;text-align:left;background:transparent;color:inherit;border:0;padding:12px 0}.task-list button>span{font-size:11px;line-height:1.5}.suggestions{margin-top:24px}.suggestions .section-heading{margin:0 0 20px}.suggestion{border-top:1px solid var(--color-border, #eaecea);padding:22px 0}.suggestion label{display:grid;gap:7px;max-width:420px;margin:16px 0;font-size:12px}.suggestion p{font-size:13px}.confirmation button{margin:8px 8px 0 0}.empty{text-align:center;padding:30px 14px;color:var(--color-text-muted, #858585)}.method{margin-top:24px;font-size:12px}.method summary{cursor:pointer;font-weight:500}.method p{margin-top:14px}
:global(html.dark-mode) .overload,:global(html.dark-mode) .error{background:#382a2a;color:#f0b8b0}:global(html.dark-mode) .success{background:#24362a;color:#acd6b5}
@media(max-width:1000px){.people-grid{grid-template-columns:1fr}.summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.insights-page{padding:0 0 24px}.insights-header h1{font-size:26px}.summary{gap:10px}.summary article,.person-card,.suggestions,.method{padding:16px}.project-picker label{display:grid;width:100%}.project-picker select{width:100%;box-sizing:border-box;min-width:0}.metrics{gap:16px 8px}.notice{display:block}.notice button{margin-top:12px}.section-heading{gap:5px}.suggestion select{width:100%;min-width:0}.person-card header{gap:12px}.level{font-size:10px}.summary article span{font-size:11px}}
@media(prefers-reduced-motion:reduce){.meter>span{transition:none}}
</style>
