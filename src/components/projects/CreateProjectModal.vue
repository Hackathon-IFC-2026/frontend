<template>
  <div v-if="modelValue" class="overlay" @click.self="fechar">
    <section
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-projeto"
    >
      <header class="modal-header">
        <div>
          <h2 id="titulo-modal-projeto">
            {{ projeto ? 'Editar projeto' : 'Novo projeto' }}
          </h2>
          <p>
            {{
              projeto
                ? 'Atualize as informações do projeto.'
                : 'Preencha os dados para adicionar um projeto.'
            }}
          </p>
        </div>
        <button type="button" class="fechar" aria-label="Fechar" @click="fechar">
          &times;
        </button>
      </header>

      <form @submit.prevent="salvar">
        <div class="campo">
          <label for="nome-projeto">Nome *</label>
          <input
            id="nome-projeto"
            v-model="form.nome"
            maxlength="120"
            placeholder="Ex: Revitalização da praça"
            required
          />
        </div>

        <div class="campo">
          <label for="descricao-projeto">Descrição</label>
          <textarea
            id="descricao-projeto"
            v-model="form.descricao"
            rows="3"
            maxlength="100"
            placeholder="Descreva os objetivos do projeto"
          />
          <small>{{ form.descricao.length }}/100 caracteres</small>
        </div>

        <div class="duas-colunas">
          <div class="campo">
            <label for="criado-em-projeto">Criado em *</label>
            <input id="criado-em-projeto" v-model="form.criadoEm" type="date" required />
          </div>

          <div class="campo">
            <label for="criador-projeto">Criador *</label>
            <input
              id="criador-projeto"
              :value="nomeUsuario(criador)"
              type="text"
              placeholder="Usuário autenticado"
              readonly
              :disabled="usuariosCarregando || !criador?.id"
            />
          </div>
        </div>

        <div class="campo">
          <label for="participantes-projeto">Participantes</label>
          <div id="participantes-projeto" class="lista-usuarios">
            <label
              v-for="usuario in usuarios"
              :key="usuario.id"
              class="usuario-opcao"
            >
              <input
                v-model="form.participantes"
                type="checkbox"
                :value="usuario.id"
                :disabled="usuariosCarregando"
              />
              <span class="usuario-avatar">{{ inicialUsuario(usuario) }}</span>
              <span class="usuario-dados">
                <strong>{{ nomeUsuario(usuario) }}</strong>
                <small>{{ usuario.email }}</small>
              </span>
            </label>
            <p v-if="usuariosCarregando" class="estado-usuarios">
              Carregando usuários...
            </p>
            <p v-else-if="erroUsuarios" class="erro-usuarios">
              {{ erroUsuarios }}
            </p>
            <p v-else-if="!usuarios.length" class="estado-usuarios">
              Nenhum usuário disponível.
            </p>
          </div>
        </div>

        <div class="campo">
          <label for="status-projeto">Status *</label>
          <select id="status-projeto" v-model="form.status" required>
            <option value="Planejamento">Planejamento</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Pausado">Pausado</option>
          </select>
        </div>

        <footer class="modal-footer">
          <button type="button" class="cancelar" @click="fechar">Cancelar</button>
          <button
            type="submit"
            class="salvar"
            :disabled="
              usuariosCarregando ||
              !criador?.id ||
              Boolean(erroUsuarios) ||
              (projeto && !podeEditarProjeto)
            "
          >
            {{ projeto ? 'Salvar alterações' : 'Adicionar projeto' }}
          </button>
        </footer>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  projeto: {
    type: Object,
    default: null,
  },
  criador: {
    type: Object,
    default: null,
  },
  usuarios: {
    type: Array,
    default: () => [],
  },
  usuariosCarregando: {
    type: Boolean,
    default: false,
  },
  erroUsuarios: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'created'])

function dataDeHoje() {
  const hoje = new Date()
  const offset = hoje.getTimezoneOffset()
  return new Date(hoje.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function formularioInicial() {
  const projeto = props.projeto
  return {
    nome: projeto?.nome || '',
    descricao: projeto?.descricao || projeto?.description || '',
    criadoEm:
      projeto?.criadoEm ||
      projeto?.criado_em ||
      projeto?.created_at?.slice(0, 10) ||
      dataDeHoje(),
    participantes: Array.isArray(projeto?.participantes)
      ? projeto.participantes.map((participante) =>
          typeof participante === 'object' ? participante.id : participante,
        )
      : [],
    status: projeto?.status || 'Planejamento',
  }
}

const form = reactive(formularioInicial())
const podeEditarProjeto = computed(() => {
  const dono = props.projeto?.criador || props.projeto?.creator
  return Boolean(
    props.criador?.id &&
      typeof dono === 'object' &&
      dono?.id &&
      String(dono.id) === String(props.criador.id),
  )
})

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) Object.assign(form, formularioInicial())
  },
)

watch(
  () => props.projeto,
  () => {
    if (props.modelValue) Object.assign(form, formularioInicial())
  },
)

function fechar() {
  emit('update:modelValue', false)
}

function salvar() {
  const nome = form.nome.trim()
  const donoProjeto = props.projeto?.criador || props.projeto?.creator
  const criador = props.projeto ? donoProjeto : props.criador

  if (
    !nome ||
    !form.criadoEm ||
    !criador?.id ||
    props.erroUsuarios ||
    (props.projeto && !podeEditarProjeto.value)
  ) {
    return
  }

  const participantes = props.usuarios.filter((usuario) =>
    form.participantes.includes(usuario.id),
  )

  const dadosProjeto = {
    nome,
    descricao: form.descricao.trim().slice(0, 100),
    criadoEm: form.criadoEm,
    criador,
    participantes,
    status: form.status,
  }

  if (props.projeto) {
    emit('updated', { ...props.projeto, ...dadosProjeto })
  } else {
    emit('created', dadosProjeto)
  }

  fechar()
}

function nomeUsuario(usuario) {
  return usuario?.name || usuario?.nome || usuario?.email || ''
}

function inicialUsuario(usuario) {
  return nomeUsuario(usuario).charAt(0).toLocaleUpperCase('pt-BR')
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 18, 0.55);
}

.modal {
  width: min(100%, 620px);
  max-height: min(90vh, 850px);
  overflow-y: auto;
  padding: 30px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
  font-family: Poppins, sans-serif;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  color: #243e2c;
  font-size: 25px;
}

.modal-header p {
  margin: 5px 0 0;
  color: #819087;
  font-size: 13px;
}

.fechar {
  border: 0;
  background: transparent;
  color: #7a8580;
  font-size: 29px;
  cursor: pointer;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.campo > label {
  color: #344a3a;
  font-size: 13px;
  font-weight: 600;
}

.campo > input,
.campo textarea,
.campo select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dce4de;
  border-radius: 9px;
  background: #fff;
  color: #26382b;
  font: inherit;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
}

.campo > input:focus,
.campo textarea:focus,
.campo select:focus {
  border-color: #4e7855;
  box-shadow: 0 0 0 3px rgba(78, 120, 85, 0.1);
}

.campo small {
  color: #819087;
  font-size: 12px;
}

.lista-usuarios {
  display: grid;
  max-height: 190px;
  overflow-y: auto;
  border: 1px solid #dce4de;
  border-radius: 10px;
  padding: 6px 10px;
}

.usuario-opcao {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 8px 4px;
  cursor: pointer;
}

.usuario-opcao input {
  accent-color: #4e7855;
}

.usuario-avatar {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border-radius: 50%;
  background: #e0ebe2;
  color: #345a3d;
  font-weight: 600;
}

.usuario-dados {
  display: flex;
  min-width: 0;
  flex-direction: column;
  color: #344a3a;
  font-size: 13px;
}

.usuario-dados strong,
.usuario-dados small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.estado-usuarios,
.erro-usuarios {
  margin: 8px 4px;
  color: #819087;
  font-size: 13px;
}

.erro-usuarios {
  color: #c0392b;
}

.duas-colunas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid #e7ece8;
}

.modal-footer button {
  padding: 11px 18px;
  border: 0;
  border-radius: 9px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.cancelar {
  background: #f1f4f2;
  color: #415348;
}

.salvar {
  background: #2b4532;
  color: #fff;
}

.salvar:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .modal {
    padding: 22px;
  }

  .duas-colunas {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .modal-footer button {
    flex: 1;
    padding-inline: 10px;
  }
}
</style>
