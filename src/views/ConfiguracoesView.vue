<template>
  <div class="page-layout">
    <div class="main-content">
      <div class="page-body">

        <div class="header-profile">
          <h2 class="title">Configurações</h2>
          <p class="subtitle">Personalize sua experiência</p>
        </div>
        <div class="settings-card">
          <div class="section-header">
            <div class="section-icon">
              <span class="material-symbols-outlined">palette</span>
            </div>
            <div>
              <h3>Aparência</h3>
              <p>Escolha como será exibido</p>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <span class="material-symbols-outlined">
                  {{ temaEscuro ? 'dark_mode' : 'light_mode' }}
                </span>
              </div>
              <div>
                <strong>Tema escuro</strong>
                <small>
                  {{
                    temaEscuro
                      ? 'O tema escuro está ativado'
                      : 'Usar com fundo claro'
                  }}
                </small>
              </div>
            </div>
            <button
              type="button"
              class="toggle"
              :class="{ active: temaEscuro }"
              role="switch"
              :aria-checked="temaEscuro"
              @click="alternarTema"
              :aria-label="
                temaEscuro
                  ? 'Desativar tema escuro'
                  : 'Ativar tema escuro'
              "
            >
              <span class="toggle-circle"></span>
            </button>
          </div>
          <div class="divider"></div>
          <div class="section-header">
            <div class="section-icon">
              <span class="material-symbols-outlined">
                notifications
              </span>
            </div>
            <div>
              <h3>Notificações</h3>
              <p>Controle suas preferências de notificações</p>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <span class="material-symbols-outlined">
                  notifications_active
                </span>
              </div>
              <div>
                <strong>Notificações</strong>
                <small>
                  Receber notificações do sistema
                </small>
              </div>
            </div>
            <button
              type="button"
              class="toggle"
              :class="{ active: notificacoes }"
              @click="notificacoes = !notificacoes"
            >
              <span class="toggle-circle"></span>
            </button>
          </div>
          <div class="divider"></div>
          <div class="section-header">
            <div class="section-icon">
              <span class="material-symbols-outlined">
                info
              </span>
            </div>
            <div>
              <h3>Sobre</h3>
              <p>Informações sobre o sistema</p>
            </div>
          </div>
          <div class="about-box">
            <div>
              <strong>KANDO</strong>
              <span>Sistema de gerenciamento</span>
            </div>
            <span class="version">
              Versão 1.0.0
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
const theme = useThemeStore()
const { temaEscuro } = storeToRefs(theme)
const alternarTema = theme.alternarTema
const notificacoes = ref(localStorage.getItem('notificacoes') !== 'desativadas')
watch(notificacoes, valor => {
  localStorage.setItem('notificacoes', valor ? 'ativadas' : 'desativadas')
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

.header-profile {
  margin-bottom: 20px;
}

.title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--theme-text-333333, #333);
}

.subtitle {
  margin: 5px 0 0;
  color: var(--theme-text-888888, #888);
  font-size: 0.85rem;
}

.settings-card {
  width: 100%;
  background-color: var(--theme-bg-ffffff, #fff);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.section-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  background-color: var(--theme-bg-e4f4e6, #e4f4e6);
  color: var(--theme-text-1a3721, #1A3721);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon .material-symbols-outlined {
  font-size: 21px;
}

.section-header h3 {
  margin: 0;
  color: var(--theme-text-333333, #333);
  font-size: 0.95rem;
  font-weight: 700;
}

.section-header p {
  margin: 3px 0 0;
  color: var(--theme-text-888888, #888);
  font-size: 0.75rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  background-color: var(--theme-bg-f9f9f9, #f9f9f9);
  padding: 12px;
  border-radius: 10px;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.setting-icon {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 9px;
  background-color: var(--theme-bg-ffffff, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-text-666666, #666);
}

.setting-icon .material-symbols-outlined {
  font-size: 20px;
}

.setting-info strong {
  display: block;
  color: var(--theme-text-333333, #333);
  font-size: 0.85rem;
  font-weight: 600;
}

.setting-info small {
  display: block;
  margin-top: 3px;
  color: var(--theme-text-888888, #888);
  font-size: 0.7rem;
}

.divider {
  height: 1px;
  background-color: var(--theme-bg-eeeeee, #eee);
  margin: 22px 0;
}

.toggle {
  position: relative;
  width: 45px;
  min-width: 45px;
  height: 24px;
  border: none;
  border-radius: 20px;
  background-color: var(--theme-bg-d5d5d5, #d5d5d5);
  padding: 0;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.toggle-circle {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--theme-bg-ffffff, #fff);
  transition: transform 0.25s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle.active {
  background-color: #1A3721;
}

.toggle.active .toggle-circle {
  transform: translateX(21px);
}

.about-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  background-color: var(--theme-bg-f9f9f9, #f9f9f9);
  padding: 14px;
  border-radius: 10px;
}

.about-box strong {
  display: block;
  color: var(--theme-text-333333, #333);
  font-size: 0.9rem;
}

.about-box span {
  display: block;
  margin-top: 3px;
  color: var(--theme-text-888888, #888);
  font-size: 0.7rem;
}

.about-box .version {
  margin: 0;
  white-space: nowrap;
}

@media (min-width: 600px) {
  .page-body {
    padding: 25px 30px;
  }

  .settings-card {
    padding: 25px;
  }
}

@media (min-width: 768px) {
  .page-body {
    padding: 30px;
  }

  .settings-card {
    max-width: 900px;
    padding: 30px;
  }

  .setting-item {
    padding: 14px;
  }
}

@media (min-width: 1024px) {
  .page-body {
    padding: 30px 40px;
  }

  .settings-card {
    max-width: 1000px;
  }
}
</style>
