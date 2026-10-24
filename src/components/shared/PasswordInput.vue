<script setup>
import { ref } from 'vue'

defineOptions({ inheritAttrs: false })
const model = defineModel({ type: String, default: '' })
const visible = ref(false)
</script>

<template>
  <div class="password-input">
    <input v-bind="$attrs" v-model="model" :type="visible ? 'text' : 'password'" />
    <button
      type="button"
      class="password-toggle"
      :aria-label="visible ? 'Ocultar senha' : 'Mostrar senha'"
      :aria-pressed="visible"
      :aria-controls="$attrs.id"
      @click="visible = !visible"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        <path v-if="visible" d="m3 3 18 18" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.password-input {
  position: relative;
  width: 100%;
}

.password-input input {
  padding-right: 52px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 8px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #fff9e3;
  cursor: pointer;
}

.password-toggle:hover {
  background: rgb(255 249 227 / 10%);
}

.password-toggle:focus-visible {
  outline: 2px solid #fff9e3;
  outline-offset: -2px;
}

.password-toggle svg {
  width: 22px;
  height: 22px;
}
</style>
