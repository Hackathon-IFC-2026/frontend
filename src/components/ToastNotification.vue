<template>
  <Transition name="toast">
    <div
      v-if="toast.visivel"
      class="toast-notification"
      :class="`toast--${toast.tipo}`"
      role="alert">
      <div class="toast-icon">
        <span v-if="toast.tipo === 'success'">✓</span>
        <span v-else-if="toast.tipo === 'error'">!</span>
        <span v-else>i</span>
      </div>
      <p>{{ toast.mensagem }}</p>
      <button
        class="toast-close"
        type="button"
        aria-label="Fechar notificação"
        @click="toast.fechar()">
        ×
      </button>
    </div>
  </Transition>
</template>
<script setup>
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;

  display: flex;
  align-items: center;
  gap: 14px;

  width: max-content;
  max-width: calc(100vw - 32px);
  min-width: 300px;
  padding: 16px 22px;

  background: var(--theme-bg-fff9e3, #FFF9E3);
  color: var(--theme-text-183826, #183826);
  border: 1px solid var(--theme-border-4e7855, #4E7855);
  border-radius: 14px;

  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.18);

  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 28px;
  height: 28px;
  border-radius: 50%;

  background: #4E7855;
  color: #FFF9E3;
  font-size: 18px;
  font-weight: 600;
}

.toast-notification p {
  margin: 0;
  flex: 1;
}

.toast--error {
  border-color: var(--theme-border-a44b58, #A44B58);
}

.toast--error .toast-icon {
  background: #A44B58;
}

.toast-close {
  border: none;
  background: transparent;
  color: var(--theme-text-183826, #183826);
  cursor: pointer;
  font-size: 23px;
  line-height: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, top 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  top: 0;
}

@media (max-width: 480px) {
  .toast-notification {
    min-width: 0;
    width: calc(100vw - 32px);
    padding: 14px 16px;
    font-size: 13px;
  }
}
</style>
