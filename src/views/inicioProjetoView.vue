<template>
  <div class="projetos-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Projetos</h1>
        <p class="pagina-descricao">
          Acompanhe todos os projetos que você faz parte e acompanhe seu andamento.
        </p>
      </div>
      <button class="adicionar-projeto" type="button" @click="abrirFormularioProjeto">
        <span class="material-symbols-outlined" aria-hidden="true">add</span>
        Adicionar projeto
      </button>
    </div>

    <div v-if="carregando" class="loading-state">
      <p>Carregando projetos...</p>
    </div>

    <div v-else-if="erro" class="error-state">
      <p>{{ erro }}</p>
      <button @click="buscarProjetos" class="retry-btn">Tentar novamente</button>
    </div>

    <div v-else class="projetos-grid">
      <cardProjeto
        v-for="projeto in projetos"
        :key="projeto.id || projeto.id_projeto || projeto._id"
        :projeto="projeto"
        :pode-gerenciar="podeGerenciarProjeto(projeto)"
        @editar="editarProjeto"
        @excluir="excluirProjeto"
        @click="selecionarProjeto(projeto)"
        @opcoes="abrirMenuProjeto"
      />
    </div>

    <div v-if="!carregando && projetos.length === 0" class="empty-state">
      <p>Nenhum projeto encontrado.</p>
    </div>

    <CreateProjectModal
      v-model="modalProjetoAberto"
      :projeto="projetoEmEdicao"
      :criador="usuarioAtual"
      :usuarios="usuarios"
      :usuarios-carregando="carregandoUsuarios"
      :erro-usuarios="erroUsuarios"
      @created="adicionarProjeto"
      @updated="atualizarProjeto"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '/services/api.js'
import cardProjeto from '@/components/projects/cardProjeto.vue'
import CreateProjectModal from '@/components/projects/CreateProjectModal.vue'

const authStore = useAuthStore()
const modalProjetoAberto = ref(false)
const projetoEmEdicao = ref(null)
const usuarioAtual = computed(() => authStore.usuario)
const usuarios = ref([])
const carregandoUsuarios = ref(false)
const erroUsuarios = ref('')

// DADOS ESTÁTICOS
const projetos = ref([
  {
    id: 1,
    nome: 'Natal luz',
    descricao: 'Decoração e iluminação natalina da cidade.',
    status: 'Em andamento',
    criadoEm: '2026-12-11',
    criador: 'Equipe Kando',
    link: '',
    participantes: [{ nome: 'Ana' }, { nome: 'Bruno' }, { nome: 'Carla' }]
  },
  {
    id: 2,
    nome: 'Reforma Praça Central',
    descricao: 'Paisagismo, bancos e iluminação pública.',
    status: 'Planejamento',
    criadoEm: '2027-01-15',
    criador: 'Equipe Kando',
    participantes: [{ nome: 'Ana' }, { nome: 'Bruno' }]
  },
  {
    id: 3,
    nome: 'Mutirão Verde',
    descricao: 'Plantio de árvores e conscientização ambiental.',
    status: 'Concluído',
    criadoEm: '2026-11-05',
    criador: 'Equipe Kando',
    participantes: [{ nome: 'Ana' }, { nome: 'Bruno' }, { nome: 'Carla' }, { nome: 'Davi' }]
  },
  {
    id: 4,
    nome: 'Festival de Inverno',
    descricao: 'Shows culturais, gastronomia e artesanato.',
    status: 'Em andamento',
    criadoEm: '2027-07-20',
    criador: 'Equipe Kando',
    participantes: [{ nome: 'Ana' }, { nome: 'Bruno' }]
  },
  {
    id: 5,
    nome: 'Feira Tecnológica',
    descricao: 'Exposição de startups e palestras de inovação.',
    status: 'Planejamento',
    criadoEm: '2027-09-18',
    criador: 'Equipe Kando',
    participantes: [{ nome: 'Ana' }, { nome: 'Bruno' }, { nome: 'Carla' }]
  },
  {
    id: 6,
    nome: 'Iluminação Pública LED',
    descricao: 'Instalação de lâmpadas LED sustentáveis.',
    status: 'Concluído',
    criadoEm: '2026-12-02',
    criador: 'Equipe Kando',
    participantes: [{ nome: 'Ana' }]
  },
  {
    id: 7,
    nome: 'Revitalização Orla',
    descricao: 'Ciclovia e nova calçada para caminhada.',
    status: 'Em andamento',
    criadoEm: '2027-03-30',
    criador: 'Equipe Kando',
    participantes: [{ nome: 'Ana' }, { nome: 'Bruno' }, { nome: 'Carla' }]
  },
  {
    id: 8,
    nome: 'Horta Comunitária',
    descricao: 'Cultivo de hortaliças e oficinas ecológicas.',
    status: 'Concluído',
    criadoEm: '2026-10-10',
    criador: 'Equipe Kando',
    participantes: [{ nome: 'Ana' }, { nome: 'Bruno' }]
  }
])


// BACKEND
const carregando = ref(false)
const erro = ref(null)

const buscarProjetos = async () => {
  carregando.value = true
  erro.value = null

  try {
    // const response = await api.get('/api/projetos/')

    /*
    const response = await api.get('/api/projetos/')
    projetos.value = response.data.map(item => ({
      id: item.id || item.id_projeto,
      nome: item.nome || item.titulo || item.name,
      descricao: item.descricao || item.description || '',
      status: item.status || 'Em andamento',
      criadoEm: item.criadoEm || item.criado_em || item.created_at || '',
      criador: item.criador || item.creator || item.created_by || '',
      link: item.link || '', // Link para navegação
      participantes: item.participantes || item.membros || []
    }))
    */
  } catch (err) {
    console.error('Erro ao buscar projetos do backend:', err)
    // erro.value = 'Não foi possível carregar os projetos cadastrados.'
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  // buscarProjetos()
})

function selecionarProjeto(projeto) {
  console.log('Projeto selecionado:', projeto)
}

function abrirMenuProjeto(projeto) {
  console.log('Opções do projeto:', projeto)
}

async function abrirFormularioProjeto(projeto = null) {
  projetoEmEdicao.value = projeto
  modalProjetoAberto.value = true
  if (
    (usuarios.value.length && authStore.usuario?.id && !erroUsuarios.value) ||
    carregandoUsuarios.value
  ) {
    return
  }

  carregandoUsuarios.value = true
  erroUsuarios.value = ''
  usuarios.value = []

  try {
    const primeiraResposta = await api.get('/api/usuarios/')
    const dados = primeiraResposta.data
    const listaInicial = Array.isArray(dados) ? dados : dados.results || []
    const listaUsuarios = [...listaInicial]
    let proximaPagina = dados.next

    while (proximaPagina) {
      const resposta = await api.get(proximaPagina)
      const usuariosDaPagina = Array.isArray(resposta.data)
        ? resposta.data
        : resposta.data.results || []
      listaUsuarios.push(...usuariosDaPagina)
      proximaPagina = resposta.data.next
    }

    usuarios.value = listaUsuarios.filter((usuario) => usuario.is_active !== false)

    if (!authStore.usuario?.id) {
      await authStore.buscarUsuario()
    }

    if (!authStore.usuario?.id) {
      throw new Error('Não foi possível identificar o usuário autenticado.')
    }
  } catch (error) {
    console.error('Erro ao carregar usuários para o projeto:', error)
    erroUsuarios.value = 'Não foi possível carregar os usuários. Tente novamente.'
  } finally {
    carregandoUsuarios.value = false
  }
}

function adicionarProjeto(dadosProjeto) {
  const proximoId = Math.max(0, ...projetos.value.map((projeto) => Number(projeto.id) || 0)) + 1
  projetos.value.unshift({ id: proximoId, ...dadosProjeto })
}

function podeGerenciarProjeto(projeto) {
  const criador = projeto.criador || projeto.creator
  return Boolean(
    usuarioAtual.value?.id &&
      typeof criador === 'object' &&
      criador?.id &&
      String(criador.id) === String(usuarioAtual.value.id),
  )
}

function editarProjeto(projeto) {
  if (!podeGerenciarProjeto(projeto)) return
  abrirFormularioProjeto(projeto)
}

function atualizarProjeto(projetoAtualizado) {
  if (!podeGerenciarProjeto(projetoAtualizado)) return

  const indice = projetos.value.findIndex(
    (projeto) => String(projeto.id) === String(projetoAtualizado.id),
  )

  if (indice === -1) return
  projetos.value[indice] = projetoAtualizado
  projetoEmEdicao.value = null
}

function excluirProjeto(projeto) {
  if (!podeGerenciarProjeto(projeto)) return
  if (!window.confirm(`Deseja excluir o projeto "${projeto.nome}"?`)) return

  projetos.value = projetos.value.filter(
    (item) => String(item.id) !== String(projeto.id),
  )
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.projetos-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 32px 48px;
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 2.1rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
  letter-spacing: -0.5px;
}


.pagina-descricao {
  margin: 8px 0 0;
  color: #68756a;
}

.adicionar-projeto {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 9px;
  background: #1a3721;
  color: #f6e8d0;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.adicionar-projeto:hover {
  transform: translateY(-1px);
  background: #234d2e;
}

.adicionar-projeto:active {
  transform: translateY(0);
}

.adicionar-projeto .material-symbols-outlined {
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.adicionar-projeto:hover .material-symbols-outlined {
  transform: rotate(90deg);
}

.projetos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 18px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.loading-state,
.empty-state,
.error-state {
  padding: 40px;
  text-align: center;
  color: #4b5563;
  font-size: 1rem;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 18px;
  background-color: #1A3721;
  color: #F6E8D0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.retry-btn:hover {
  opacity: 0.9;
}

@media (max-width: 760px) {
  .projetos-container {
    padding: 20px 16px 32px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
  }

  .adicionar-projeto {
    align-self: flex-start;
  }

  .projetos-grid {
    gap: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .adicionar-projeto,
  .adicionar-projeto .material-symbols-outlined {
    transition: none;
  }

  .adicionar-projeto:hover,
  .adicionar-projeto:active,
  .adicionar-projeto:hover .material-symbols-outlined {
    transform: none;
  }
}
</style>
