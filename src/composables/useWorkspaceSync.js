import { onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { useNotificacoesStore } from '@/stores/notificacoes'
export function useWorkspaceSync() {
  const auth = useAuthStore()
  const projects = useProjectStore()
  const tasks = useTaskStore()
  const notifications = useNotificacoesStore()
  let timer
  let executando = false
  async function atualizar() {
    if (!auth.usuario?.id || document.hidden || executando) return
    executando = true
    try {
      await projects.listarProjetos({ silencioso: true })
      if (auth.usuario?.id) await tasks.listarTodas({ silencioso: true })
      if (auth.usuario?.id) await notifications.buscarNotificacoes({ silencioso: true })
    } catch { /* As stores mantêm os dados e apresentam erros na página correspondente. */ }
    finally { executando = false }
  }
  watch(() => auth.usuario?.id, id => {
    clearInterval(timer)
    if (id) {
      notifications.buscarNotificacoes({ silencioso: true })
      timer = setInterval(atualizar, 30000)
    }
  }, { immediate: true })
  window.addEventListener('focus', atualizar)
  document.addEventListener('visibilitychange', atualizar)
  onUnmounted(() => { clearInterval(timer); window.removeEventListener('focus', atualizar); document.removeEventListener('visibilitychange', atualizar) })
}
