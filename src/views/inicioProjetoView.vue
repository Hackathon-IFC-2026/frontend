<template>
  <div class="projetos-container">
    <div class="page-header">
      <h1 class="page-title">Projetos</h1>
      <p class="pagina-descricao">
          Acompanhe todos os projetos que você faz parte e acompanhe seu andamento.
        </p>
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
        @click="selecionarProjeto(projeto)"
        @opcoes="abrirMenuProjeto"
      />
    </div>

    <div v-if="!carregando && projetos.length === 0" class="empty-state">
      <p>Nenhum projeto encontrado.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import cardProjeto from '@/components/cardProjeto.vue'
//import api from '/services/api.js'

// DADOS ESTÁTICOS
const projetos = ref([
  {
    id: 1,
    nome: 'Natal luz',
    descricao: 'Decoração e iluminação natalina da cidade.',
    prioridade: 'Alta',
    status: '50% Concluído',
    endereco: 'BR-280, 123',
    data: '11/12/2026',
    link: '',
    imagem: null,
    participantes: [{}, {}, {}]
  },
  {
    id: 2,
    nome: 'Reforma Praça Central',
    descricao: 'Paisagismo, bancos e iluminação pública.',
    prioridade: 'Média',
    status: '20% Concluído',
    endereco: 'Av. Brasil, 500',
    data: '15/01/2027',
    imagem: null,
    participantes: [{}, {}]
  },
  {
    id: 3,
    nome: 'Mutirão Verde',
    descricao: 'Plantio de árvores e conscientização ambiental.',
    prioridade: 'Baixa',
    status: '85% Concluído',
    endereco: 'Rua das Flores, 42',
    data: '05/11/2026',
    imagem: null,
    participantes: [{}, {}, {}, {}]
  },
  {
    id: 4,
    nome: 'Festival de Inverno',
    descricao: 'Shows culturais, gastronomia e artesanato.',
    prioridade: 'Alta',
    status: '40% Concluído',
    endereco: 'Parque Municipal',
    data: '20/07/2027',
    imagem: null,
    participantes: [{}, {}]
  },
  {
    id: 5,
    nome: 'Feira Tecnológica',
    descricao: 'Exposição de startups e palestras de inovação.',
    prioridade: 'Média',
    status: '10% Concluído',
    endereco: 'Centro de Eventos',
    data: '18/09/2027',
    imagem: null,
    participantes: [{}, {}, {}]
  },
  {
    id: 6,
    nome: 'Iluminação Pública LED',
    descricao: 'Instalação de lâmpadas LED sustentáveis.',
    prioridade: 'Alta',
    status: '90% Concluído',
    endereco: 'Bairro Novo',
    data: '02/12/2026',
    imagem: null,
    participantes: [{}]
  },
  {
    id: 7,
    nome: 'Revitalização Orla',
    descricao: 'Ciclovia e nova calçada para caminhada.',
    prioridade: 'Média',
    status: '65% Concluído',
    endereco: 'Av. Beira Mar, 100',
    data: '30/03/2027',
    imagem: null,
    participantes: [{}, {}, {}]
  },
  {
    id: 8,
    nome: 'Horta Comunitária',
    descricao: 'Cultivo de hortaliças e oficinas ecológicas.',
    prioridade: 'Baixa',
    status: '100% Concluído',
    endereco: 'Rua São Paulo, 88',
    data: '10/10/2026',
    imagem: null,
    participantes: [{}, {}]
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
      prioridade: item.prioridade || 'Média',
      status: item.status || 'Em andamento',
      endereco: item.endereco || item.localizacao || '',
      data: item.data || item.prazo || item.data_fim || '',
      link: item.link || '', // Link para navegação
      imagem: item.imagem || item.banner || null,
      participantes: item.participantes || item.membros || [{}, {}, {}]
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

/* Layout em 3 colunas */
.projetos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  width: 100%;
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

@media (max-width: 950px) {
  .projetos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .projetos-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

}

@media (max-width: 760px) {
  .projetos-container {
    padding: 20px 16px 32px;
  }
}
</style>
