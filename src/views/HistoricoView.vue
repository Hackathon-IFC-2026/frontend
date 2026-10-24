<template>
  <main class="historico-pagina">
    <header class="cabecalho">
      <div>
        <h1>Histórico</h1>
        <p>Tarefas pendentes encaminhadas ao histórico de cada projeto.</p>
      </div>
    </header>

    <p class="aviso-demo" role="note">
      Dados temporários desta demonstração. As alterações ficam apenas na sessão atual e
      ainda não são enviadas ao servidor.
    </p>

    <p v-if="carregando" class="estado" role="status">Carregando histórico...</p>
    <p v-else-if="erro" class="mensagem erro" role="alert">{{ erro }}</p>
    <section v-else-if="!projetos.length" class="estado">
      <h2>Histórico indisponível</h2>
      <p>Não há projetos criados pela sua conta disponíveis para consultar.</p>
    </section>
    <section v-else class="lista-projetos" aria-label="Histórico por projeto">
      <article
        v-for="projeto in projetos"
        :key="projeto.id"
        class="projeto-historico"
      >
        <header class="projeto-cabecalho">
          <div>
            <h2>{{ projeto.nome }}</h2>
            <p>{{ projeto.descricao }}</p>
          </div>
          <span class="contador">
            {{ historicos[projeto.id]?.length || 0 }}
            {{ historicos[projeto.id]?.length === 1 ? 'tarefa' : 'tarefas' }}
          </span>
        </header>

        <p
          v-if="!historicos[projeto.id]?.length"
          class="estado-vazio"
        >
          Não há tarefas pendentes no histórico deste projeto.
        </p>

        <ul v-else class="tarefas-historico">
          <li
            v-for="registro in historicos[projeto.id]"
            :key="registro.id"
            class="tarefa-historica"
          >
            <div class="tarefa-dados">
              <h3>{{ registro.tarefa.titulo }}</h3>
              <p>{{ registro.tarefa.descricao || 'Sem descrição.' }}</p>
              <span class="status-tarefa">
                {{ statusDaTarefa(registro.tarefa.status) }}
              </span>
              <span>
                Responsável anterior: {{ registro.responsavelAnterior.nome }}
              </span>
            </div>

            <form
              class="reatribuicao"
              @submit.prevent="reatribuir(projeto, registro)"
            >
              <label :for="`responsavel-${registro.id}`">Novo responsável</label>
              <select
                :id="`responsavel-${registro.id}`"
                v-model="responsaveisSelecionados[registro.id]"
                required
                :disabled="store.operacaoEmAndamento || !participantesAtivos(projeto.id).length"
              >
                <option value="" disabled>Selecione um participante</option>
                <option
                  v-for="participante in participantesAtivos(projeto.id)"
                  :key="participante.id"
                  :value="String(participante.id)"
                >
                  {{ participante.nome }}
                </option>
              </select>
              <button
                type="submit"
                :disabled="store.operacaoEmAndamento || !responsaveisSelecionados[registro.id]"
              >
                {{ store.operacaoEmAndamento ? 'Salvando...' : 'Reatribuir tarefa' }}
              </button>
            </form>
          </li>
        </ul>
      </article>
    </section>

    <p v-if="store.sucesso" class="mensagem sucesso" role="status">
      {{ store.sucesso }}
    </p>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectHistoryStore } from '@/stores/projectHistory'

const authStore = useAuthStore()
const store = useProjectHistoryStore()
const projetos = ref([])
const historicos = ref({})
const responsaveisSelecionados = ref({})
const carregando = ref(false)
const erro = ref('')

function statusDaTarefa(status) {
  return {
    a_fazer: 'A fazer',
    em_andamento: 'Em andamento',
    em_processo: 'Em andamento',
  }[status] || status
}

function participantesAtivos(projetoId) {
  return store.participantesDoProjeto(projetoId)
}

async function carregarHistorico() {
  carregando.value = true
  erro.value = ''
  store.erro = ''
  store.sucesso = ''

  try {
    const usuarioId = await obterUsuarioId()
    if (!usuarioId) {
      erro.value = 'Faça login para consultar o histórico.'
      return
    }
    projetos.value = await store.listarProjetosDoUsuario(usuarioId)
    const porProjeto = {}

    for (const projeto of projetos.value) {
      porProjeto[projeto.id] = await store.listarHistoricoProjeto(
        projeto.id,
        usuarioId,
      )
    }

    historicos.value = porProjeto
  } catch (error) {
    erro.value = error.message || 'Não foi possível carregar o histórico.'
  } finally {
    carregando.value = false
  }
}

async function obterUsuarioId() {
  if (authStore.usuario?.id) return authStore.usuario.id
  if (!localStorage.getItem('access_token')) return null
  const usuario = await authStore.buscarUsuario()
  return usuario?.id || null
}

async function reatribuir(projeto, registro) {
  erro.value = ''
  store.erro = ''
  try {
    const usuarioId = await obterUsuarioId()
    if (!usuarioId) {
      erro.value = 'Faça login para consultar e gerenciar o histórico.'
      return
    }
    await store.reatribuirTarefa(
      projeto.id,
      registro.id,
      responsaveisSelecionados.value[registro.id],
      usuarioId,
    )
    historicos.value[projeto.id] = await store.listarHistoricoProjeto(
      projeto.id,
      usuarioId,
    )
    responsaveisSelecionados.value[registro.id] = ''
  } catch (error) {
    erro.value = error.message || 'Não foi possível reatribuir a tarefa.'
  }
}

onMounted(carregarHistorico)
</script>

<style scoped>
.historico-pagina {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 28px 32px 48px;
  color: #1a3721;
  font-family: Poppins, sans-serif;
}

.cabecalho {
  margin-bottom: 20px;
}

.cabecalho h1 {
  margin: 0;
  color: #111827;
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.cabecalho p,
.projeto-cabecalho p {
  margin: 8px 0 0;
  color: #68756a;
  font-size: 0.9rem;
}

.aviso-demo {
  margin: 0 0 20px;
  padding: 12px 16px;
  border: 1px solid #e7d39c;
  border-radius: 10px;
  background: #fff9e8;
  color: #6c5720;
  font-size: 0.85rem;
}

.lista-projetos {
  display: grid;
  gap: 16px;
}

.projeto-historico {
  padding: 18px;
  border: 1px solid #e5ebe6;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 3px 12px rgba(26, 55, 33, 0.04);
}

.projeto-cabecalho,
.tarefa-historica {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.projeto-cabecalho {
  padding-bottom: 14px;
  border-bottom: 1px solid #edf1ed;
}

.projeto-cabecalho h2,
.tarefa-dados h3 {
  margin: 0;
  color: #24372a;
}

.projeto-cabecalho h2 {
  font-size: 1.15rem;
}

.projeto-cabecalho p {
  font-size: 0.82rem;
}

.contador {
  flex: 0 0 auto;
  padding: 5px 10px;
  border-radius: 20px;
  background: #edf4ee;
  color: #315e3b;
  font-size: 0.78rem;
  font-weight: 600;
}

.estado-vazio,
.estado {
  padding: 24px 12px;
  color: #68756a;
  text-align: center;
}

.estado h2 {
  color: #24372a;
}

.tarefas-historico {
  display: grid;
  gap: 12px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.tarefa-historica {
  align-items: flex-start;
  padding: 14px;
  border: 1px solid #e5ebe6;
  border-radius: 10px;
  background: #fafcfb;
}

.tarefa-dados {
  min-width: 0;
}

.tarefa-dados h3 {
  font-size: 0.95rem;
}

.tarefa-dados p {
  margin: 6px 0;
  color: #68756a;
  font-size: 0.83rem;
  white-space: pre-wrap;
}

.tarefa-dados span,
.reatribuicao label {
  color: #77847a;
  font-size: 0.76rem;
}

.tarefa-dados .status-tarefa {
  display: inline-flex;
  margin: 0 8px 4px 0;
  padding: 3px 7px;
  border-radius: 12px;
  background: #fff6e9;
  color: #a75e0b;
  font-weight: 600;
}

.reatribuicao {
  display: grid;
  flex: 0 0 min(230px, 38%);
  gap: 6px;
}

.reatribuicao select,
.reatribuicao button {
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid #d4dfd5;
  border-radius: 8px;
  font: inherit;
  font-size: 0.8rem;
}

.reatribuicao select {
  background: white;
  color: #344a3a;
}

.reatribuicao button {
  border-color: #1a3721;
  background: #1a3721;
  color: #f6e8d0;
  font-weight: 600;
  cursor: pointer;
}

.reatribuicao button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.mensagem {
  margin: 14px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
}

.mensagem.erro {
  background: #fff0f0;
  color: #b42318;
}

.mensagem.sucesso {
  background: #eaf6ec;
  color: #28713e;
}

@media (max-width: 760px) {
  .historico-pagina {
    padding: 20px 16px 32px;
  }

  .tarefa-historica {
    flex-direction: column;
  }

  .reatribuicao {
    flex-basis: auto;
    width: 100%;
  }
}
</style>
