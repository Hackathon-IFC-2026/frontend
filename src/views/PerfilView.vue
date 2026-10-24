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
            <div class="avatar-container"><img v-if="usuarioAtual.foto" :src="usuarioAtual.foto" class="avatar-img" alt="Sua foto de perfil" /><div v-else class="avatar">{{ inicialUsuario }}</div></div>
            <div class="profile-name">
              <h2>{{ usuarioAtual.nome || usuarioAtual.name || 'Usuário' }}</h2>
              <p>{{ usuarioAtual.email || 'E-mail não informado' }}</p>
            </div>
          </div>

          <ProfilePhotoEditor v-if="editando" />
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
              <div class="info-block"><label for="data-nascimento">Data de nascimento</label><div class="input-container"><span class="material-symbols-outlined">cake</span><input id="data-nascimento" v-model="form.data_nascimento" type="date" :max="new Date().toISOString().slice(0, 10)" :disabled="!editando" /></div></div>
            </div>
            <div v-if="mensagem" class="message success">
              <span class="material-symbols-outlined">check_circle</span>
              {{ mensagem }}
            </div>
            <div v-if="authStore.erro" class="message error">
              <span class="material-symbols-outlined">error</span>
              {{ authStore.erro }}
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
                  :disabled="authStore.carregando"
                >Cancelar</button>
                <button
                  type="submit"
                  class="save-btn"
                  :disabled="authStore.carregando"
                >
                  <span v-if="authStore.carregando" class="spinner"></span>
                  <span v-else class="material-symbols-outlined">save</span>
                  {{ authStore.carregando ? 'Salvando...' : 'Salvar alterações' }}
                </button>
              </template>
            </div>
          </form>
        </div>

        <section class="profile-card password-card">
          <div class="section-header"><div class="section-icon"><span class="material-symbols-outlined">lock</span></div><div><h3>Alterar senha</h3><p>Atualize a senha da sua conta com segurança.</p></div></div>
          <form @submit.prevent="salvarSenha">
            <div class="form-grid">
              <div class="info-block"><label for="senha-atual">Senha atual</label><PasswordInput id="senha-atual" v-model="senha.senha_atual" autocomplete="current-password" required /></div>
              <div class="info-block"><label for="nova-senha">Nova senha</label><PasswordInput id="nova-senha" v-model="senha.nova_senha" autocomplete="new-password" minlength="8" required /></div>
              <div class="info-block"><label for="confirmar-senha">Confirmar nova senha</label><PasswordInput id="confirmar-senha" v-model="senha.confirmar_senha" autocomplete="new-password" minlength="8" required /></div>
            </div>
            <p v-if="erroSenha" class="message error" role="alert">{{ erroSenha }}</p>
            <p v-if="sucessoSenha" class="message success" role="status">{{ sucessoSenha }}</p>
            <div class="actions"><button class="save-btn" :disabled="authStore.carregando" type="submit">{{ authStore.carregando ? 'Salvando...' : 'Salvar nova senha' }}</button></div>
          </form>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ProfilePhotoEditor from '@/components/ProfilePhotoEditor.vue'
import PasswordInput from '@/components/shared/PasswordInput.vue'
import { mensagemErro } from '/services/apiHelpers'
const authStore = useAuthStore()
const usuarioAtual = computed(() => authStore.usuario || {})
const inicialUsuario = computed(() => (usuarioAtual.value.nome || usuarioAtual.value.name || 'U').charAt(0).toUpperCase())
const editando = ref(false)
const mensagem = ref('')
const form = reactive({ nome: '', email: '', data_nascimento: '' })
const senha = reactive({ senha_atual: '', nova_senha: '', confirmar_senha: '' })
const erroSenha = ref('')
const sucessoSenha = ref('')
function preencher() {
  form.nome = usuarioAtual.value.nome || usuarioAtual.value.name || ''
  form.email = usuarioAtual.value.email || ''
  form.data_nascimento = usuarioAtual.value.data_nascimento || ''
}
watch(usuarioAtual, () => { if (!editando.value) preencher() }, { immediate: true })
function iniciarEdicao() { preencher(); mensagem.value = ''; authStore.erro = null; editando.value = true }
function cancelarEdicao() { preencher(); editando.value = false; authStore.erro = null }
async function salvarPerfil() {
  try { await authStore.atualizarPerfil(form); editando.value = false; mensagem.value = 'Perfil atualizado com sucesso.' }
  catch { /* Erro exibido pela store. */ }
}
async function salvarSenha() {
  erroSenha.value = ''; sucessoSenha.value = ''
  if (senha.nova_senha !== senha.confirmar_senha) { erroSenha.value = 'As novas senhas não coincidem.'; return }
  try {
    await authStore.alterarSenha(senha)
    Object.keys(senha).forEach(k => { senha[k] = '' })
    sucessoSenha.value = 'Senha atualizada com sucesso.'
  } catch (err) { erroSenha.value = mensagemErro(err) }
}
onMounted(async () => { try { await authStore.buscarUsuario() } catch (err) { authStore.erro = mensagemErro(err) } })
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

.profile-card {
  width: 100%;
  background: var(--theme-bg-ffffff, #ffffff);
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
  background-color: var(--theme-bg-e4f4e6, #e4f4e6);
  color: var(--theme-text-333333, #333);
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
  color: var(--theme-text-333333, #333);
  font-size: 1.15rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.profile-name p {
  margin: 4px 0 0;
  color: var(--theme-text-888888, #888);
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}

.divider {
  height: 1px;
  background-color: var(--theme-bg-eeeeee, #eeeeee);
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.info-block {
  background: var(--theme-bg-f9f9f9, #f9f9f9);
  padding: 10px 12px;
  border-radius: 8px;
}

.info-block label {
  display: block;
  color: var(--theme-text-888888, #888);
  font-size: 10px;
  margin-bottom: 6px;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-container .material-symbols-outlined {
  color: var(--theme-text-888888, #888);
  font-size: 19px;
}

.input-container input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--theme-text-333333, #333);
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  padding: 2px 0;
}

.input-container input:disabled {
  color: var(--theme-text-333333, #333);
  cursor: default;
}

.input-container input:focus {
  color: var(--theme-text-1a3721, #1A3721);
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
  background-color: var(--theme-bg-e4f4e6, #e4f4e6);
  color: var(--theme-text-333333, #333);
}

.edit-btn:hover {
  background-color: var(--theme-bg-b5e0ba, #b5e0ba);
}

.save-btn {
  border: none;
  background-color: var(--theme-bg-e4f4e6, #e4f4e6);
  color: var(--theme-text-333333, #333);
}

.save-btn:hover:not(:disabled) {
  background-color: var(--theme-bg-b5e0ba, #b5e0ba);
}

.cancel-btn {
  border: 1px solid var(--theme-border-dddddd, #ddd);
  background-color: var(--theme-bg-ffffff, #ffffff);
  color: var(--theme-text-555555, #555);
}

.cancel-btn:hover:not(:disabled) {
  background-color: var(--theme-bg-f5f5f5, #f5f5f5);
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
  background-color: var(--theme-bg-e8f5e9, #e8f5e9);
  color: var(--theme-text-2e7d32, #2e7d32);
}

.error {
  background-color: var(--theme-bg-ffebee, #ffebee);
  color: var(--theme-text-c62828, #c62828);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--theme-border-000000-0_2, rgba(0, 0, 0, 0.2));
  border-top-color: var(--theme-border-333333, #333);
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
.password-card { margin-top: 24px; }
.password-card :deep(.password-input input) { width: 100%; padding: 12px 50px 12px 12px; border-radius: 8px; border: 1px solid var(--color-border); color: var(--color-text); background: var(--color-input); font: inherit; }
.password-card :deep(.password-toggle) { color: var(--color-text-secondary); }
</style>
