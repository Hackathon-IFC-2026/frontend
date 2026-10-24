<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { mensagemErro } from '/services/apiHelpers'
const auth = useAuthStore()
const fileInput = ref(null)
const preview = ref('')
const imagem = ref(null)
const zoom = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const erro = ref('')
const sucesso = ref('')
const carregando = ref(false)
const size = 230
let version = 0
let drag = null
const transformacao = computed(() => {
  if (!imagem.value) return {}
  const scale =
    Math.max(size / imagem.value.naturalWidth, size / imagem.value.naturalHeight) * zoom.value
  const width = imagem.value.naturalWidth * scale,
    height = imagem.value.naturalHeight * scale
  return {
    width,
    height,
    x: (size - width) / 2 + (((width - size) / 2) * offsetX.value) / 100,
    y: (size - height) / 2 + (((height - size) / 2) * offsetY.value) / 100,
  }
})
const imagemStyle = computed(() => ({
  width: transformacao.value.width + 'px',
  height: transformacao.value.height + 'px',
  left: transformacao.value.x + 'px',
  top: transformacao.value.y + 'px',
}))
function cancelar() {
  version++
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = ''
  imagem.value = null
  zoom.value = 1
  offsetX.value = 0
  offsetY.value = 0
  if (fileInput.value) fileInput.value.value = ''
}
async function selecionar(event) {
  const file = event.target.files?.[0]
  erro.value = ''
  sucesso.value = ''
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    erro.value = 'Selecione uma imagem JPG, PNG ou WebP.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    erro.value = 'A imagem deve ter no máximo 5 MB.'
    return
  }
  cancelar()
  const atual = version
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.src = url
  try {
    await img.decode()
    if (atual !== version) {
      URL.revokeObjectURL(url)
      return
    }
    if (img.naturalWidth * img.naturalHeight > 20000000)
      throw new Error('A resolução da imagem é muito grande.')
    imagem.value = img
    preview.value = url
  } catch (err) {
    URL.revokeObjectURL(url)
    erro.value = err.message || 'Não foi possível abrir esta imagem.'
  }
}
function iniciarArrasto(event) {
  drag = { x: event.clientX, y: event.clientY, offsetX: offsetX.value, offsetY: offsetY.value }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function mover(event) {
  if (!drag) return
  const t = transformacao.value
  const clamp = (n) => Math.min(100, Math.max(-100, n))
  offsetX.value = clamp(
    drag.offsetX + ((event.clientX - drag.x) / Math.max(1, t.width - size)) * 200,
  )
  offsetY.value = clamp(
    drag.offsetY + ((event.clientY - drag.y) / Math.max(1, t.height - size)) * 200,
  )
}
async function salvar() {
  if (!imagem.value || carregando.value) return
  const atual = version
  carregando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 512, 512)
    const t = transformacao.value,
      ratio = 512 / size
    context.drawImage(imagem.value, t.x * ratio, t.y * ratio, t.width * ratio, t.height * ratio)
    const blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(new Error('Não foi possível preparar a foto.')),
        'image/jpeg',
        0.92,
      ),
    )
    if (atual !== version) return
    await auth.atualizarFoto(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
    cancelar()
    sucesso.value = 'Foto de perfil atualizada.'
  } catch (err) {
    erro.value = mensagemErro(err)
  } finally {
    carregando.value = false
  }
}
async function remover() {
  if (carregando.value || !confirm('Remover sua foto de perfil?')) return
  carregando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    await auth.atualizarFoto(null)
    cancelar()
    sucesso.value = 'Foto de perfil removida.'
  } catch (err) {
    erro.value = mensagemErro(err)
  } finally {
    carregando.value = false
  }
}
onUnmounted(cancelar)
</script>
<template>
  <section class="photo-editor" aria-label="Editar foto de perfil">
    <div class="photo-tools">
      <button type="button" :disabled="carregando" @click="fileInput.click()">
        <span class="material-symbols-outlined" aria-hidden="true">photo_camera</span
        >{{ auth.usuario?.foto ? 'Alterar foto' : 'Adicionar foto' }}
      </button>
      <button v-if="auth.usuario?.foto" type="button" :disabled="carregando" @click="remover">
        Remover foto
      </button>
      <input
        ref="fileInput"
        type="file"
        tabindex="-1"
        accept="image/jpeg,image/png,image/webp"
        class="visually-hidden"
        aria-label="Selecionar foto de perfil"
        :disabled="carregando"
        @change="selecionar"
      />
      <small>JPG, PNG ou WebP · até 5 MB</small>
    </div>
    <div v-if="preview" class="crop-layout">
      <div
        class="crop-window"
        @pointerdown="iniciarArrasto"
        @pointermove="mover"
        @pointerup="drag = null"
        @pointercancel="drag = null"
      >
        <img
          :src="preview"
          :style="imagemStyle"
          alt="Prévia do recorte da foto"
          draggable="false"
        />
      </div>
      <div class="crop-controls">
        <p>Arraste a imagem ou use os controles para centralizar seu rosto.</p>
        <label>Zoom<input v-model.number="zoom" type="range" min="1" max="3" step=".01" /></label>
        <label
          >Posição horizontal<input
            v-model.number="offsetX"
            type="range"
            min="-100"
            max="100"
            step="1"
        /></label>
        <label
          >Posição vertical<input
            v-model.number="offsetY"
            type="range"
            min="-100"
            max="100"
            step="1"
        /></label>
        <div class="photo-tools">
          <button type="button" :disabled="carregando" @click="salvar">
            {{ carregando ? 'Salvando...' : 'Salvar foto' }}</button
          ><button type="button" :disabled="carregando" @click="cancelar">Cancelar recorte</button>
        </div>
      </div>
    </div>
    <p v-if="erro" role="alert" class="photo-error">{{ erro }}</p>
    <p v-if="sucesso" role="status">{{ sucesso }}</p>
  </section>
</template>
<style scoped>
.photo-editor {
  margin: 18px 0;
  padding: 16px;
  border-radius: 12px;
  background: var(--color-background-soft);
  color: var(--color-text);
}
.photo-tools {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.photo-tools button {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}
.photo-tools button:disabled {
  opacity: 0.5;
  cursor: wait;
}
.photo-tools small {
  font-size: 10px;
  color: var(--color-text-secondary);
}
.photo-tools .material-symbols-outlined {
  font-size: 18px;
}
.crop-layout {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
}
.crop-window {
  width: 230px;
  height: 230px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  touch-action: none;
  background: white;
  cursor: grab;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
}
.crop-window img {
  position: absolute;
  max-width: none;
  pointer-events: none;
  user-select: none;
}
.crop-controls {
  flex: 1;
  min-width: 180px;
}
.crop-controls p {
  font-size: 11px;
  color: var(--color-text-secondary);
}
.crop-controls label {
  display: block;
  font-size: 11px;
  margin: 10px 0;
}
.crop-controls input {
  display: block;
  width: 100%;
  accent-color: var(--color-primary);
}
.photo-error {
  color: #b85c5c;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  clip-path: inset(50%);
  overflow: hidden;
  white-space: nowrap;
}
@media (max-width: 480px) {
  .photo-editor {
    padding: 12px;
  }
  .crop-window {
    margin: auto;
  }
}
</style>
