<script setup>
import { computed } from 'vue'
import TaskDetails from './TaskDetails.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/auth'
const props = defineProps({ taskId: { type: [Number, String], required: true } })
const emit = defineEmits(['close', 'deleted'])
const tasks = useTaskStore()
const projects = useProjectStore()
const auth = useAuthStore()
const tarefa = computed(() => tasks.todasTarefas.find(t => Number(t.id) === Number(props.taskId)) || (Number(tasks.tarefaAtual?.id) === Number(props.taskId) ? tasks.tarefaAtual : null))
const projeto = computed(() => projects.buscarProjeto(tarefa.value?.projeto))
</script>
<template>
  <TaskDetails :task-id="taskId" :usuario-atual-id="auth.usuario?.id" :is-admin="projects.podeAdministrar(projeto?.id)" :participantes="projeto?.participantes || []" @close="emit('close')" @deleted="emit('deleted'); emit('close')" />
</template>
