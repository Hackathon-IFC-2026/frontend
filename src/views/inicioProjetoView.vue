<template>
  <div class="projetos-container">
    <div class="page-header">
      <h1 class="page-title">Projetos</h1>
      <button class="new-project" @click="modalAberto = true">+ Novo projeto</button>
      <p class="pagina-descricao">
          Acompanhe todos os projetos que você faz parte e acompanhe seu andamento.
        </p>
    </div>

    <p v-if="store.loading" role="status">Carregando projetos...</p>
    <div v-if="store.error" class="error-state" role="alert">{{ store.error }} <button class="retry-btn" @click="carregar">Tentar novamente</button></div>
    <div v-if="!store.loading && !store.error" class="projetos-grid">
      <cardProjeto
        v-for="projeto in projetos"
        :key="projeto.id || projeto.id_projeto || projeto._id"
        :projeto="projeto"
        @click="selecionarProjeto(projeto)"
      />
    </div>

    <div v-if="!store.loading && !store.error && projetos.length === 0" class="empty-state">
      <p>Nenhum projeto encontrado.</p>
    </div>
    <ProjectFormModal v-model="modalAberto" @saved="selecionarProjeto" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import cardProjeto from '@/components/projects/cardProjeto.vue'
import ProjectFormModal from '@/components/ProjectFormModal.vue'
import { useProjectStore } from '@/stores/projectStore'
const store = useProjectStore()
const router = useRouter()
const projetos = computed(() => store.projetos)
const modalAberto = ref(false)
function selecionarProjeto(projeto) { router.push('/projetos/' + projeto.id + '/kanban') }
async function carregar() { try { await store.listarProjetos() } catch { /* A store apresenta o erro. */ } }
onMounted(carregar)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.new-project { float: right; padding: 12px 18px; border: 0; border-radius: 9px; background: #2b4532; color: white; cursor: pointer; font: inherit; }

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
  color: var(--theme-text-111827, #111827);
  line-height: 1.15;
  letter-spacing: -0.5px;
}


.pagina-descricao {
  margin: 8px 0 0;
  color: var(--theme-text-68756a, #68756a);
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
  color: var(--theme-text-4b5563, #4b5563);
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
