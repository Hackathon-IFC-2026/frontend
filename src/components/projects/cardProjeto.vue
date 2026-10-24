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

    <h3 class="card-title" :title="projeto.nome || projeto.titulo">
      {{ projeto.nome || projeto.titulo || 'Projeto' }}
    </h3>

    <div class="card-sections">
      <div class="section-box section-full">
        <span class="section-label">Descrição</span>
        <span class="section-value desc-text" :title="projeto.descricao || projeto.description">
          {{ projeto.descricao || projeto.description || 'Sem descrição' }}
        </span>
      </div>

      <div class="section-row">
        <div class="section-box section-half">
          <span class="section-label">Administrador</span>
          <span class="section-value">
            {{ projeto.administrador?.nome || '—' }}
          </span>
        </div>

        <div class="section-box section-half">
          <span class="section-label">Status</span>
          <span class="section-value status-badge" :class="statusBadgeClass">
            {{ projeto.status || '0% Concluído' }}
          </span>
        </div>
      </div>

      <div class="section-row">
        <div class="section-box section-half">
          <span class="section-label">Data</span>
          <span class="section-value">{{ projeto.data || '—' }}</span>
        </div>

        <div class="section-box section-half">
          <span class="section-label">Participantes</span>
          <div class="members-mini-group">
            <div
              v-for="(membro, idx) in listaParticipantes"
              :key="idx"
              class="member-mini-circle"
              :title="membro?.nome || 'Participante'"
            >
              <img v-if="membro?.avatar" :src="membro.avatar" :alt="membro?.nome || 'Participante'" /><span v-else>{{ (membro?.nome || membro?.email || '?').charAt(0).toUpperCase() }}</span>
            </div>
            <span v-if="totalParticipantes > 3" class="member-more-count">
              +{{ totalParticipantes - 3 }}
            </span>
          </div>
        </div>
      </div>

      <div class="section-box section-full">
        <span class="section-label">Tarefas</span>
        <span class="section-value address-text" >
          {{ projeto.totalTarefas ?? 0 }}
        </span>
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

  }
})

const linkDestino = computed(() => {
  if (props.projeto.link) return props.projeto.link
  const idProjeto = props.projeto.id || props.projeto.id_projeto || 1
  return `/projetos/${idProjeto}/kanban`
})

function irParaProjeto(event) {
  event?.stopPropagation?.()
  router.push(linkDestino.value)
}

function formatarCodigo(id) {
  return String(id).padStart(4, '0')
}

function extrairPorcentagem(status) {
  if (typeof status === 'number') return status
  if (!status) return null
  const str = String(status)
  const match = str.match(/(\d+(\.\d+)?)\s*%?/)
  return match ? parseFloat(match[1]) : null
}

const statusFaixa = computed(() => {
  const porcentagem = extrairPorcentagem(props.projeto.status)
  if (porcentagem !== null) {
    if (porcentagem <= 30) return 'vermelho'
    if (porcentagem <= 70) return 'amarelo'
    return 'verde'
  }

  const s = String(props.projeto.status || '').toLowerCase()
  if (s.includes('concl') || s.includes('finaliz')) return 'verde'
  if (s.includes('anda') || s.includes('prog')) return 'amarelo'
  if (s.includes('inic') || s.includes('pend') || s.includes('paus') || s.includes('cancel')) return 'vermelho'

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
  if (Array.isArray(props.projeto.participantes) && props.projeto.participantes.length > 0) {
    return props.projeto.participantes.slice(0, 3)
  }
  return []
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.card-moderno {
  background-color: var(--theme-bg-ffffff, #ffffff);
  border-radius: 15px;
  padding: 16px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--theme-border-f1f3f5, #f1f3f5);
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

.card-code {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--theme-text-9ca3af, #9ca3af);
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
  color: var(--theme-text-111827, #111827);
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
  background-color: var(--theme-bg-f8fafc, #f8fafc);
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
  color: var(--theme-text-9ca3af, #9ca3af);
  font-weight: 500;
  margin-bottom: 2px;
  text-transform: capitalize;
}

.section-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--theme-text-1f2937, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desc-text,
.address-text {
  font-weight: 500;
  color: var(--theme-text-374151, #374151);
  font-size: 0.72rem;
}

.priority-badge.priority-alta {
  color: var(--theme-text-ef4444, #ef4444);
}

.priority-badge.priority-media {
  color: var(--theme-text-f59e0b, #f59e0b);
}

.priority-badge.priority-baixa {
  color: var(--theme-text-10b981, #10b981);
}

.status-badge.status-vermelho {
  color: var(--theme-text-ef4444, #ef4444);
}

.status-badge.status-amarelo {
  color: var(--theme-text-f59e0b, #f59e0b);
}

.status-badge.status-verde {
  color: var(--theme-text-10b981, #10b981);
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
  background-color: var(--theme-bg-d1d5db, #d1d5db);
  border: 1px solid var(--theme-border-f8fafc, #f8fafc);
  margin-left: -4px;
  overflow: hidden;
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
  color: var(--theme-text-6b7280, #6b7280);
  margin-left: 4px;
  font-weight: 600;
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
