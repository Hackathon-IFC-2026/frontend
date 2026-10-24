<template>
  <div class="card-moderno">
    <div class="card-header">
      <span class="card-code">#{{ formatarCodigo(projeto.id || projeto.id_projeto || 1) }}</span>
      <span
        class="status-dot"
        :class="statusDotClass"
        :title="projeto.status || 'Status do projeto'"
      ></span>
    </div>

    <div v-if="podeGerenciar" class="acoes-projeto">
      <button
        type="button"
        class="acao-projeto editar-projeto"
        :aria-label="`Editar projeto ${projeto.nome || projeto.titulo}`"
        title="Editar projeto"
        @click.stop="emit('editar', projeto)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">edit</span>
      </button>
      <button
        type="button"
        class="acao-projeto excluir-projeto"
        :aria-label="`Excluir projeto ${projeto.nome || projeto.titulo}`"
        title="Excluir projeto"
        @click.stop="emit('excluir', projeto)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">delete</span>
      </button>
    </div>

    <h3 class="card-title" :title="projeto.nome || projeto.titulo">
      {{ projeto.nome || projeto.titulo || 'Casamento' }}
    </h3>

    <div class="card-sections">
      <div class="section-box section-full">
        <span class="section-label">Descrição</span>
        <span class="section-value desc-text" :title="descricaoProjeto">
          {{ descricaoProjeto }}
        </span>
      </div>

      <div class="section-row">
        <div class="section-box section-half">
          <span class="section-label">Criado em</span>
          <span class="section-value">{{ dataCriacaoFormatada }}</span>
        </div>

        <div class="section-box section-half">
          <span class="section-label">Criador</span>
          <div
            class="creator-avatar"
            role="img"
            :aria-label="`Criador: ${nomeCriador}`"
            :title="nomeCriador"
          >
            <img v-if="fotoCriador" :src="fotoCriador" :alt="nomeCriador" />
            <span v-else>{{ inicialCriador }}</span>
          </div>
        </div>
      </div>

      <div class="section-box section-full">
        <span class="section-label">Status</span>
        <span class="section-value status-badge" :class="statusBadgeClass">
          {{ projeto.status || 'Planejamento' }}
        </span>
      </div>

      <div class="section-box section-full">
        <span class="section-label">Participantes</span>
        <div v-if="listaParticipantes.length" class="members-mini-group">
          <div
            v-for="(membro, idx) in participantesExibidos"
            :key="membro.id || idx"
            class="member-mini-circle"
            :title="nomeParticipante(membro)"
          >
            <img
              v-if="membro?.avatar"
              :src="membro.avatar"
              :alt="nomeParticipante(membro)"
            />
            <span v-else>{{ inicialParticipante(membro) }}</span>
          </div>
          <span v-if="totalParticipantes > 3" class="member-more-count">
            +{{ totalParticipantes - 3 }}
          </span>
        </div>
        <span v-else class="section-value participantes-vazios">Nenhum participante</span>
      </div>
    </div>

    <button
      type="button"
      class="btn-acessar"
      @click="irParaProjeto"
    >
      Acessar projeto
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  projeto: {
    type: Object,
    required: true,
    default: () => ({
      id: 1,
      nome: 'Natal luz',
      descricao: 'Decoração e iluminação natalina da cidade.',
      criadoEm: '2026-12-11',
      criador: 'Equipe Kando',
      status: 'Em andamento',
      link: '',
      participantes: [{ nome: 'Ana' }, { nome: 'Bruno' }, { nome: 'Carla' }]
    })
  },
  podeGerenciar: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['editar', 'excluir'])

const linkDestino = computed(() => {
  if (props.projeto.link) return props.projeto.link
  const idProjeto = props.projeto.id || props.projeto.id_projeto || 1
  return `/projetos/${idProjeto}`
})

function irParaProjeto(event) {
  event?.stopPropagation?.()
  router.push(linkDestino.value)
}

function formatarCodigo(id) {
  return String(id).padStart(4, '0')
}

const statusFaixa = computed(() => {
  const s = String(props.projeto.status || '').toLowerCase()
  if (s.includes('concl') || s.includes('finaliz')) return 'verde'
  if (s.includes('paus') || s.includes('cancel')) return 'vermelho'
  return 'amarelo'
})

const statusDotClass = computed(() => {
  if (statusFaixa.value === 'vermelho') return 'dot-red'
  if (statusFaixa.value === 'amarelo') return 'dot-yellow'
  return 'dot-green'
})

const statusBadgeClass = computed(() => {
  if (statusFaixa.value === 'vermelho') return 'status-vermelho'
  if (statusFaixa.value === 'amarelo') return 'status-amarelo'
  return 'status-verde'
})

const totalParticipantes = computed(() => {
  return Array.isArray(props.projeto.participantes) ? props.projeto.participantes.length : 0
})

const listaParticipantes = computed(() => {
  return Array.isArray(props.projeto.participantes) ? props.projeto.participantes : []
})

const participantesExibidos = computed(() => listaParticipantes.value.slice(0, 3))

const nomeCriador = computed(() => {
  const criador = props.projeto.criador || props.projeto.creator
  return typeof criador === 'object' && criador !== null
    ? criador.name || criador.nome || criador.email || 'Não informado'
    : criador || 'Não informado'
})

const fotoCriador = computed(() => {
  const criador = props.projeto.criador || props.projeto.creator
  return typeof criador === 'object' && criador !== null
    ? criador.foto || criador.avatar || criador.photo || criador.profile_picture || ''
    : ''
})

const inicialCriador = computed(() =>
  nomeCriador.value.charAt(0).toLocaleUpperCase('pt-BR'),
)

const descricaoProjeto = computed(() => {
  const descricao =
    props.projeto.descricao ||
    props.projeto.description ||
    'Decoração e iluminação natalina da cidade.'
  return String(descricao).slice(0, 100)
})

const dataCriacaoFormatada = computed(() => {
  const data = props.projeto.criadoEm || props.projeto.criado_em || props.projeto.created_at
  if (!data) return 'Não informada'

  const [ano, mes, dia] = String(data).slice(0, 10).split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : String(data)
})

function nomeParticipante(membro) {
  return typeof membro === 'string' ? membro : membro?.nome || membro?.name || 'Participante'
}

function inicialParticipante(membro) {
  return nomeParticipante(membro).charAt(0).toLocaleUpperCase('pt-BR')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.card-moderno {
  background-color: #ffffff;
  border-radius: 15px;
  padding: 16px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f3f5;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  position: relative;
  width: 100%;
}

.card-moderno:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.acoes-projeto {
  position: absolute;
  top: 12px;
  right: 30px;
  display: flex;
  gap: 5px;
}

.acao-projeto {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: #f1f5f1;
  color: #48634c;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.acao-projeto .material-symbols-outlined {
  font-size: 18px;
}

.editar-projeto:hover {
  background: #e3eee4;
  color: #245b31;
}

.excluir-projeto:hover {
  background: #fde8e7;
  color: #b42318;
}

.card-code {
  font-size: 0.72rem;
  font-weight: 500;
  color: #9ca3af;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  transition: background-color 0.2s ease;
}

.dot-red {
  background-color: #ef4444;
}

.dot-yellow {
  background-color: #f59e0b;
}

.dot-green {
  background-color: #10b981;
}

.card-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-sections {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 14px;
  flex: 1;
}

.section-row {
  display: flex;
  gap: 7px;
  width: 100%;
}

.section-box {
  background-color: #f8fafc;
  border-radius: 9px;
  padding: 7px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

.section-full {
  width: 100%;
}

.section-half {
  flex: 1;
  min-width: 0;
}

.section-label {
  font-size: 0.6rem;
  color: #9ca3af;
  font-weight: 500;
  margin-bottom: 2px;
  text-transform: capitalize;
}

.section-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.creator-avatar {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: #e0ebe2;
  color: #345a3d;
  font-size: 0.8rem;
  font-weight: 700;
}

.creator-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.desc-text {
  font-weight: 500;
  color: #374151;
  font-size: 0.72rem;
}

.status-badge.status-vermelho {
  color: #ef4444;
}

.status-badge.status-amarelo {
  color: #f59e0b;
}

.status-badge.status-verde {
  color: #10b981;
}

.members-mini-group {
  display: flex;
  align-items: center;
  margin-top: 1px;
}

.member-mini-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #d1d5db;
  border: 1px solid #f8fafc;
  margin-left: -4px;
  overflow: hidden;
}

.member-mini-circle span {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #344a3a;
  font-size: 0.58rem;
  font-weight: 700;
}

.member-mini-circle:first-child {
  margin-left: 0;
}

.member-mini-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-more-count {
  font-size: 0.62rem;
  color: #6b7280;
  margin-left: 4px;
  font-weight: 600;
}

.participantes-vazios {
  color: #6b7280;
  font-weight: 500;
}

.btn-acessar {
  width: 100%;
  background-color: #1A3721;
  color: #F6E8D0;
  border: none;
  border-radius: 9px;
  padding: 9px 0;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
  transition: background-color 0.2s ease, opacity 0.15s ease, transform 0.15s ease;
  box-sizing: border-box;
}

.btn-acessar:hover {
  background-color: #234d2e;
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-acessar:active {
  transform: translateY(0);
}
</style>
