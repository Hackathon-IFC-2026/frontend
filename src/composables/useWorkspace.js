import { onMounted, onUnmounted, ref } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { mensagemErro } from '/services/apiHelpers'
export function useWorkspace() {
  const projects = useProjectStore()
  const tasks = useTaskStore()
  const loading = ref(true)
  const error = ref('')
  async function carregar() {
    error.value = ''
    loading.value = true
    try { await projects.listarProjetos(); await tasks.listarTodas() }
    catch (err) { error.value = mensagemErro(err) }
    finally { loading.value = false }
  }
  onMounted(carregar)
  return { projects, tasks, loading, error, carregar }
}
