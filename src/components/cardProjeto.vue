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
      {{ projeto.nome || projeto.titulo || 'Casamento' }}
    </h3>

    <div class="card-sections">
      <div class="section-box section-full">
        <span class="section-label">Descrição</span>
        <span class="section-value desc-text" :title="projeto.descricao || projeto.description">
          {{ projeto.descricao || projeto.description || 'Decoração e iluminação natalina da cidade.' }}
        </span>
      </div>

      <div class="section-row">
        <div class="section-box section-half">
          <span class="section-label">Prioridade</span>
          <span class="section-value priority-badge" :class="prioridadeClass">
            {{ projeto.prioridade || 'Alta' }}
          </span>
        </div>

        <div class="section-box section-half">
          <span class="section-label">Status</span>
          <span class="section-value status-badge" :class="statusBadgeClass">
            {{ projeto.status || '50% Concluído' }}
          </span>
        </div>
      </div>

      <div class="section-row">
        <div class="section-box section-half">
          <span class="section-label">Data</span>
          <span class="section-value">{{ projeto.data || '28/07/2026' }}</span>
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
              <img v-if="membro?.avatar" :src="membro.avatar" :alt="membro?.nome || 'Participante'" />
            </div>
            <span v-if="totalParticipantes > 3" class="member-more-count">
              +{{ totalParticipantes - 3 }}
            </span>
          </div>
        </div>
      </div>

      <div class="section-box section-full">
        <span class="section-label">Endereço</span>
        <span class="section-value address-text" :title="projeto.endereco">
          {{ projeto.endereco || 'BR-280, 123' }}
        </span>
      </div>
    </div>

    <router-link
      :to="linkDestino"
      class="btn-acessar"
      @click.stop
    >
      Acessar projeto
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  projeto: {
    type: Object,
    required: true,
    default: () => ({
      id: 1,
      nome: 'Natal luz',
      descricao: 'Decoração e iluminação natalina da cidade.',
      prioridade: 'Alta',
      status: '50% Concluído',
      endereco: 'BR-280, 123',
      data: '11/12/2026',
      link: '',
      participantes: [{}, {}, {}]
    })
  }
})

function formatarCodigo(id) {
  return String(id).padStart(4, '0')
}

const prioridadeClass = computed(() => {
  const p = (props.projeto.prioridade || '').toLowerCase()
  if (p.includes('alta')) return 'priority-alta'
  if (p.includes('med') || p.includes('méd')) return 'priority-media'
  if (p.includes('baix')) return 'priority-baixa'
  return 'priority-alta'
})

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
  return Array.isArray(props.projeto.participantes) ? props.projeto.participantes.length : 3
})

const listaParticipantes = computed(() => {
  if (Array.isArray(props.projeto.participantes) && props.projeto.participantes.length > 0) {
    return props.projeto.participantes.slice(0, 3)
  }
  return [{}, {}, {}]
})
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

.desc-text,
.address-text {
  font-weight: 500;
  color: #374151;
  font-size: 0.72rem;
}

.priority-badge.priority-alta {
  color: #ef4444;
}

.priority-badge.priority-media {
  color: #f59e0b;
}

.priority-badge.priority-baixa {
  color: #10b981;
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
