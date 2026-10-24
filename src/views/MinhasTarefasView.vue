<script setup>
import { computed, ref } from 'vue'
import IndicadorPrioridade from '@/components/shared/IndicadorPrioridade.vue'
import FiltroDropdown from '@/components/shared/FiltroDropdown.vue'
import { normalizarPrioridade, OPCOES_PRIORIDADE } from '@/utils/prioridadesTarefas'

const busca = ref('')
const filtroStatus = ref('todos')
const filtroPrioridade = ref('todas')
const STATUS_OPTIONS = [
  { value: 'fazer', label: 'A fazer' },
  { value: 'em_processo', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluída' },
]
const OPCOES_FILTRO_STATUS = [
  { value: 'todos', label: 'Todos os status', tom: 'neutro' },
  ...STATUS_OPTIONS.map((status) => ({
    ...status,
    tom: status.value,
  })),
]
const OPCOES_FILTRO_PRIORIDADE = OPCOES_PRIORIDADE.map((prioridade) => ({
  ...prioridade,
  tom: prioridade.value === 'todas' ? 'neutro' : prioridade.value,
}))

// Dados de exemplo para montar a interface; a API ainda não fornece estes dados.
const projetos = ref([
  {
    id: 1,
    nome: 'Natal luz',
    descricao: 'Decoração e iluminação natalina da cidade.',
    tarefas: [
      {
        id: 1,
        titulo: 'Revisar proposta de iluminação',
        prazo: '28/10/2026',
        prioridade: 'Alta',
        status: 'em_processo',
      },
      {
        id: 2,
        titulo: 'Organizar lista de materiais',
        prazo: '02/11/2026',
        prioridade: 'Média',
        status: 'fazer',
      },
    ],
  },
  {
    id: 2,
    nome: 'Mutirão Verde',
    descricao: 'Plantio de árvores e conscientização ambiental.',
    tarefas: [
      {
        id: 3,
        titulo: 'Confirmar locais de plantio',
        prazo: '30/10/2026',
        prioridade: 'Baixa',
        status: 'concluido',
      },
      {
        id: 4,
        titulo: 'Preparar divulgação do mutirão',
        prazo: '05/11/2026',
        prioridade: 'Alta',
        status: 'fazer',
      },
    ],
  },
  {
    id: 3,
    nome: 'Feira Tecnológica',
    descricao: 'Exposição de startups e palestras de inovação.',
    tarefas: [
      {
        id: 5,
        titulo: 'Alinhar agenda com palestrantes',
        prazo: '08/11/2026',
        prioridade: 'Média',
        status: 'em_processo',
      },
    ],
  },
])

const todasAsTarefas = computed(() =>
  projetos.value.flatMap((projeto) => projeto.tarefas)
)

const tarefasEmAndamento = computed(
  () => todasAsTarefas.value.filter((tarefa) => tarefa.status === 'em_processo').length
)

const tarefasConcluidas = computed(
  () => todasAsTarefas.value.filter((tarefa) => tarefa.status === 'concluido').length
)

const projetosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')

  return projetos.value
    .map((projeto) => ({
      ...projeto,
      tarefas: projeto.tarefas.filter((tarefa) => {
        const correspondeAoStatus =
          filtroStatus.value === 'todos' || tarefa.status === filtroStatus.value
        const correspondeAPrioridade =
          filtroPrioridade.value === 'todas' ||
          normalizarPrioridade(tarefa.prioridade) === filtroPrioridade.value
        const correspondeAoTermo =
          !termo ||
          projeto.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
          tarefa.titulo.toLocaleLowerCase('pt-BR').includes(termo)

        return correspondeAoStatus && correspondeAPrioridade && correspondeAoTermo
      }),
    }))
    .filter((projeto) => projeto.tarefas.length > 0)
})

const statusLabels = Object.fromEntries(
  STATUS_OPTIONS.map(({ value, label }) => [value, label])
)

function classeStatus(status) {
  return `status-${status}`
}
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

    <p class="aviso-demonstracao" role="note">
      Esta tela está usando dados de exemplo. A integração com os projetos e tarefas da API
      ainda não foi feita.
    </p>

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

          <FiltroDropdown
            v-model="filtroStatus"
            :options="OPCOES_FILTRO_STATUS"
            label="Filtrar tarefas por status"
          />

          <FiltroDropdown
            v-model="filtroPrioridade"
            :options="OPCOES_FILTRO_PRIORIDADE"
            label="Filtrar tarefas por prioridade"
          />
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
                  <h4>{{ tarefa.titulo }}</h4>
                  <p class="prazo-tarefa">
                    <span class="material-symbols-outlined" aria-hidden="true">
                      calendar_today
                    </span>
                    Prazo: {{ tarefa.prazo }}
                  </p>
                </div>
              </div>

              <div class="tarefa-etiquetas">
                <span class="etiqueta-status" :class="classeStatus(tarefa.status)">
                  {{ statusLabels[tarefa.status] || tarefa.status }}
                </span>
                <IndicadorPrioridade variante="tarefa" :prioridade="tarefa.prioridade" />
              </div>
            </li>
          </ul>
        </article>
      </div>

      <div v-else class="estado-vazio">
        <span class="material-symbols-outlined" aria-hidden="true">search_off</span>
        <h3>Nenhuma tarefa encontrada</h3>
        <p>Altere a busca ou o filtro de status para ver outras tarefas.</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.minhas-tarefas {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 28px 32px 48px;
  color: #1a3721;
}

.pagina-cabecalho,
.projeto-cabecalho,
.tarefa-linha,
.tarefa-principal,
.tarefa-etiquetas,
.resumo-card {
  display: flex;
  align-items: center;
}

.pagina-cabecalho,
.projeto-cabecalho,
.tarefa-linha {
  justify-content: space-between;
}

.pagina-cabecalho {
  margin-bottom: 20px;
}

.sobretitulo {
  margin: 0 0 6px;
  color: #4e7855;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pagina-cabecalho h1 {
  margin: 0;
  font-size: 2.1rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.pagina-descricao,
.secao-cabecalho p,
.projeto-info p,
.resumo-card p,
.estado-vazio p {
  color: #68756a;
}

.pagina-descricao {
  margin: 8px 0 0;
}

.icone-cabecalho {
  color: #4e7855;
  font-size: 2.8rem;
}

.aviso-demonstracao {
  margin: 0 0 20px;
  padding: 12px 16px;
  border: 1px solid #e7d39c;
  border-radius: 10px;
  background: #fff9e8;
  color: #6c5720;
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
  border: 1px solid #e7ebe7;
  border-radius: 14px;
  background: #fff;
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
  background: #eaf2eb;
  color: #315e3b;
}

.andamento-icone {
  background: #fff0dc;
  color: #b96a12;
}

.concluida-icone {
  background: #e5f4e8;
  color: #32804a;
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
  background: #f7f9f7;
}

.secao-cabecalho {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(0, 2fr);
  align-items: center;
  gap: 24px;
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
  display: grid;
  grid-template-columns: minmax(220px, 1.7fr) repeat(2, minmax(160px, 1fr));
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.campo-busca {
  align-items: center;
  min-height: 46px;
  border: 1px solid #d4dfd5;
  border-radius: 11px;
  background: #fff;
  color: #516052;
  box-shadow: 0 2px 7px rgba(26, 55, 33, 0.04);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.campo-busca:focus-within {
  border-color: #4e7855;
  box-shadow: 0 0 0 3px rgba(78, 120, 85, 0.14);
  outline: none;
}

.campo-busca {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 13px;
  min-width: 0;
}

.campo-busca .material-symbols-outlined {
  flex: 0 0 auto;
  color: #66816a;
  font-size: 1.15rem;
}

.campo-busca input {
  width: 100%;
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1a3721;
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
  border: 1px solid #e1e5e1;
  border-radius: 12px;
  background: #ebebeb;
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
  background: #eaf2eb;
  color: #315e3b;
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
  color: #315e3b;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.projeto-link:focus-visible {
  border-radius: 3px;
  outline: 2px solid #4e7855;
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
  color: #68756a;
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
  background: #fff;
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
  color: #000;
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
  color: #999;
  font-size: 0.68rem;
}

.prazo-tarefa .material-symbols-outlined {
  font-size: 0.9rem;
}

.tarefa-etiquetas {
  justify-content: space-between;
  gap: 8px;
}

.etiqueta-status {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
}

.etiqueta-status.status-fazer {
  background: #edf1ed;
  color: #526653;
}

.etiqueta-status.status-em_processo {
  background: #fff0dc;
  color: #a75e0b;
}

.etiqueta-status.status-concluido {
  background: #e5f4e8;
  color: #28713e;
}

.estado-vazio {
  padding: 44px 16px;
  text-align: center;
}

.estado-vazio > .material-symbols-outlined {
  color: #829184;
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

@media (max-width: 1000px) {
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
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .filtros {
    grid-template-columns: minmax(0, 1.5fr) repeat(2, minmax(130px, 1fr));
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

  .filtros {
    grid-template-columns: minmax(0, 1fr);
  }

  .contador-tarefas {
    font-size: 0.7rem;
  }
}
</style>
