
<template>
  <div class="page-layout">
    <div class="main-content">
      <div class="page-body">

        <!-- Cabeçalho -->
        <div class="header-notificacoes">
          <div>
            <h2 class="title">Notificações</h2>
            <p class="subtitle">Acompanhe seus alertas e atualizações importantes</p>
          </div>

          <button
            v-if="notificacoesStore.naoLidasCount > 0"
            class="mark-all-btn"
            @click="notificacoesStore.marcarTodasComoLidas"
          >
            <span class="material-symbols-outlined">done_all</span>
            Marcar todas como lidas
          </button>
        </div>

        <div class="card-container">
          <!-- Filtros de Abas -->
          <div class="tabs">
            <button
              :class="{ active: filtro === 'todas' }"
              @click="filtro = 'todas'"
            >
              Todas ({{ notificacoesStore.notificacoes.length }})
            </button>
            <button
              :class="{ active: filtro === 'naoLidas' }"
              @click="filtro = 'naoLidas'"
            >
              Não lidas ({{ notificacoesStore.naoLidasCount }})
            </button>
          </div>

          <!-- Estado de Carregamento -->
          <div v-if="notificacoesStore.loading" class="state-container">
            <span class="spinner"></span>
            <p>Carregando notificações...</p>
          </div>

          <!-- Estado Vazio -->
          <div v-else-if="notificacoesFiltradas.length === 0" class="state-container">
            <span class="material-symbols-outlined empty-icon">notifications_off</span>
            <p class="empty-title">Nenhuma notificação por aqui</p>
            <p class="empty-desc">
              {{ filtro === 'naoLidas' ? 'Você leu todas as suas notificações!' : 'Você não possui avisos recentes.' }}
            </p>
          </div>

          <!-- Lista de Notificações -->
          <div v-else class="lista-notificacoes">
            <div
              v-for="item in notificacoesFiltradas"
              :key="item.id"
              class="notificacao-item"
              :class="{ 'nao-lida': !item.lida }"
              @click="!item.lida && notificacoesStore.marcarComoLida(item.id)"
            >
              <!-- Ícone por Tipo -->
              <div class="icon-box" :class="item.tipo || 'info'">
                <span class="material-symbols-outlined">
                  {{ getIcone(item.tipo) }}
                </span>
              </div>

              <!-- Conteúdo -->
              <div class="conteudo">
                <div class="topo">
                  <h4 class="titulo-item">{{ item.titulo }}</h4>
                  <span class="data">{{ formatarData(item.data) }}</span>
                </div>
                <p class="mensagem">{{ item.mensagem }}</p>
              </div>

              <!-- Ações -->
              <div class="acoes" @click.stop>
                <button
                  v-if="!item.lida"
                  class="action-btn"
                  title="Marcar como lida"
                  @click="notificacoesStore.marcarComoLida(item.id)"
                >
                  <span class="material-symbols-outlined">check</span>
                </button>
                <button
                  class="action-btn delete"
                  title="Excluir"
                  @click="notificacoesStore.removerNotificacao(item.id)"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificacoesStore } from '@/stores/notificacoes'

const notificacoesStore = useNotificacoesStore()
const filtro = ref('todas')

const notificacoesFiltradas = computed(() => {
  if (filtro.value === 'naoLidas') {
    return notificacoesStore.notificacoes.filter(n => !n.lida)
  }
  return notificacoesStore.notificacoes
})

function getIcone(tipo) {
  switch (tipo) {
    case 'sucesso': return 'check_circle'
    case 'alerta': return 'warning'
    case 'erro': return 'error'
    default: return 'info'
  }
}

function formatarData(isoString) {
  if (!isoString) return ''
  const data = new Date(isoString)
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  notificacoesStore.buscarNotificacoes()
})
</script>

<style scoped>
.page-layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-body {
  padding: 20px 16px 40px;
}

.header-notificacoes {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
}

.subtitle {
  margin: 5px 0 0;
  color: #888;
  font-size: 0.85rem;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #1A3721;
  color: #1A3721;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.mark-all-btn:hover {
  background-color: #e4f4e6;
}

.card-container {
  background: #ffffff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 900px;
}

.tabs {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
  margin-bottom: 15px;
}

.tabs button {
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: #777;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.tabs button.active {
  background-color: #e4f4e6;
  color: #1A3721;
}

.lista-notificacoes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notificacao-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  background-color: #fafafa;
  transition: 0.2s;
}

.notificacao-item.nao-lida {
  background-color: #ffffff;
  border-left: 4px solid #1A3721;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.notificacao-item:hover {
  border-color: #ddd;
}

.icon-box {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box.sucesso { background-color: #e8f5e9; color: #2e7d32; }
.icon-box.alerta  { background-color: #fff8e1; color: #f57f17; }
.icon-box.erro    { background-color: #ffebee; color: #c62828; }
.icon-box.info    { background-color: #e4f4e6; color: #1A3721; }

.conteudo {
  flex: 1;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.titulo-item {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #333;
}

.data {
  font-size: 0.72rem;
  color: #999;
}

.mensagem {
  margin: 0;
  font-size: 0.82rem;
  color: #666;
  line-height: 1.4;
}

.acoes {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.action-btn:hover {
  background-color: #eee;
  color: #333;
}

.action-btn.delete:hover {
  background-color: #ffebee;
  color: #c62828;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #888;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 8px;
}

.empty-title {
  margin: 0;
  font-weight: 700;
  color: #555;
}

.empty-desc {
  margin: 4px 0 0;
  font-size: 0.8rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #1A3721;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (min-width: 768px) {
  .page-body {
    padding: 30px;
  }
}
</style>
