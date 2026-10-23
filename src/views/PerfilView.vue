<template>
  <div class="page-layout">
    <div class="main-content">
      <div class="page-body">
        <div class="header-profile">
          <div>
            <h2 class="title">Meu perfil</h2>
            <p class="subtitle">Visualize e edite suas informações pessoais</p>
          </div>
        </div>
        <div class="profile-card">
          <div class="profile-header">
            <div
              class="avatar-container"
              :class="{ 'editable': editando }"
              @click="editando && acionarInputFoto()"
            >
              <img
                v-if="previewFoto || usuarioAtual.foto || usuarioAtual.avatar"
                :src="previewFoto || usuarioAtual.foto || usuarioAtual.avatar"
                alt="Foto do perfil"
                class="avatar-img"
              />
              <div v-else class="avatar">
                {{ inicialUsuario }}
              </div>
              <div v-if="editando" class="avatar-overlay">
                <span class="material-symbols-outlined">photo_camera</span>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none;"
              @change="aoSelecionarFoto"
            />

            <div class="profile-name">
              <h2>{{ usuarioAtual.nome || usuarioAtual.name || 'Usuário' }}</h2>
              <p>{{ usuarioAtual.email || 'E-mail não informado' }}</p>
            </div>
          </div>

          <div class="divider"></div>
          <div class="section-header">
            <div class="section-icon">
              <span class="material-symbols-outlined">person</span>
            </div>

            <div>
              <h3>Informações pessoais</h3>
              <p>Dados utilizados no seu cadastro</p>
            </div>
          </div>
          <form @submit.prevent="salvarPerfil">
            <div class="form-grid">
              <div class="info-block">
                <label for="nome">Nome</label>
                <div class="input-container">
                  <span class="material-symbols-outlined">person</span>
                  <input
                    id="nome"
                    v-model="form.nome"
                    type="text"
                    placeholder="Digite seu nome"
                    :disabled="!editando"
                    required
                  />
                </div>
              </div>
              <div class="info-block">
                <label for="email">E-mail</label>
                <div class="input-container">
                  <span class="material-symbols-outlined">mail</span>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    :disabled="!editando"
                    required
                  />
                </div>
              </div>
            </div>
            <div v-if="mensagem" class="message success">
              <span class="material-symbols-outlined">check_circle</span>
              {{ mensagem }}
            </div>
            <div v-if="authStore.error" class="message error">
              <span class="material-symbols-outlined">error</span>
              {{ authStore.error }}
            </div>
            <div class="actions">
              <template v-if="!editando">
                <button
                  type="button"
                  class="edit-btn"
                  @click="iniciarEdicao"
                >
                  <span class="material-symbols-outlined">edit</span>
                  Editar perfil
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="cancel-btn"
                  @click="cancelarEdicao"
                  :disabled="authStore.loading"
                >Cancelar</button>
                <button
                  type="submit"
                  class="save-btn"
                  :disabled="authStore.loading"
                >
                  <span v-if="authStore.loading" class="spinner"></span>
                  <span v-else class="material-symbols-outlined">save</span>
                  {{ authStore.loading ? 'Salvando...' : 'Salvar alterações' }}
                </button>
              </template>
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const editando = ref(false);
const mensagem = ref('');

const fileInput = ref(null);
const fotoArquivo = ref(null);
const previewFoto = ref(null);

const form = reactive({
  nome: '',
  email: ''
});

const usuarioAtual = computed(() => authStore.usuario || {});

const inicialUsuario = computed(() => {
  const nome = usuarioAtual.value.nome || usuarioAtual.value.name || 'U';
  return nome.charAt(0).toUpperCase();
});

function preencherFormulario() {
  form.nome = usuarioAtual.value.nome || usuarioAtual.value.name || '';
  form.email = usuarioAtual.value.email || '';
}

function limparPreviewFoto() {
  if (previewFoto.value) {
    URL.revokeObjectURL(previewFoto.value);
    previewFoto.value = null;
  }
  fotoArquivo.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function acionarInputFoto() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

function aoSelecionarFoto(event) {
  const arquivo = event.target.files[0];
  if (arquivo) {
    limparPreviewFoto();
    fotoArquivo.value = arquivo;
    previewFoto.value = URL.createObjectURL(arquivo);
  }
}

function iniciarEdicao() {
  mensagem.value = '';
  if (authStore.error) authStore.error = null;
  preencherFormulario();
  editando.value = true;
}

function cancelarEdicao() {
  preencherFormulario();
  mensagem.value = '';
  if (authStore.error) authStore.error = null;
  limparPreviewFoto();
  editando.value = false;
}

async function salvarPerfil() {
  mensagem.value = '';
  if (authStore.error) authStore.error = null;

  const sucesso = await authStore.updateProfile({
    nome: form.nome.trim(),
    email: form.email.trim(),
    foto: fotoArquivo.value
  });

  if (sucesso) {
    editando.value = false;
    limparPreviewFoto();
    mensagem.value = 'Perfil atualizado com sucesso!';

    setTimeout(() => {
      mensagem.value = '';
    }, 4000);
  }
}

watch(usuarioAtual, () => {
  if (!editando.value) {
    preencherFormulario();
  }
}, { immediate: true });

onMounted(async () => {
  if (!authStore.usuario && authStore.token) {
    await authStore.me();
  }
  preencherFormulario();
});
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
  color: #333;
}

.subtitle {
  margin: 5px 0 0;
  color: #888;
  font-size: 0.85rem;
}

.profile-card {
  width: 100%;
  background: #ffffff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-container {
  position: relative;
  width: 65px;
  height: 65px;
  min-width: 65px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-container.editable {
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar {
  width: 100%;
  height: 100%;
  background-color: #e4f4e6;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.avatar-container.editable:hover .avatar-overlay {
  opacity: 1;
}

.profile-name {
  min-width: 0;
}

.profile-name h2 {
  margin: 0;
  color: #333;
  font-size: 1.15rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.profile-name p {
  margin: 4px 0 0;
  color: #888;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}

.divider {
  height: 1px;
  background-color: #eeeeee;
  margin: 22px 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #e4f4e6;
  color: #1A3721;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon .material-symbols-outlined {
  font-size: 21px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 0.95rem;
  font-weight: 700;
}

.section-header p {
  margin: 3px 0 0;
  color: #888;
  font-size: 0.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.info-block {
  background: #f9f9f9;
  padding: 10px 12px;
  border-radius: 8px;
}

.info-block label {
  display: block;
  color: #888;
  font-size: 10px;
  margin-bottom: 6px;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-container .material-symbols-outlined {
  color: #888;
  font-size: 19px;
}

.input-container input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #333;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  padding: 2px 0;
}

.input-container input:disabled {
  color: #333;
  cursor: default;
}

.input-container input:focus {
  color: #1A3721;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.edit-btn,
.save-btn,
.cancel-btn {
  width: 100%;
  min-height: 44px;
  border-radius: 8px;
  padding: 8px 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: 0.2s;
}

.edit-btn {
  border: none;
  background-color: #e4f4e6;
  color: #333;
}

.edit-btn:hover {
  background-color: #b5e0ba;
}

.save-btn {
  border: none;
  background-color: #e4f4e6;
  color: #333;
}

.save-btn:hover:not(:disabled) {
  background-color: #b5e0ba;
}

.cancel-btn {
  border: 1px solid #ddd;
  background-color: #ffffff;
  color: #555;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 0.8rem;
}

.message .material-symbols-outlined {
  font-size: 18px;
}

.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.error {
  background-color: #ffebee;
  color: #c62828;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 600px) {
  .page-body {
    padding: 25px 30px;
  }

  .profile-card {
    padding: 25px;
  }

  .actions {
    flex-direction: row;
    justify-content: flex-end;
  }

  .edit-btn,
  .save-btn,
  .cancel-btn {
    width: auto;
    min-width: 120px;
  }

  .save-btn {
    min-width: 175px;
  }
}

@media (min-width: 768px) {
  .page-body {
    padding: 30px;
  }

  .profile-card {
    max-width: 900px;
    padding: 30px;
  }

  .form-grid {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .profile-header {
    gap: 18px;
  }

  .avatar-container {
    width: 75px;
    height: 75px;
    min-width: 75px;
  }

  .avatar {
    font-size: 1.7rem;
  }
}

@media (min-width: 1024px) {
  .page-body {
    padding: 30px 40px;
  }

  .profile-card {
    max-width: 1000px;
  }
}
</style>
