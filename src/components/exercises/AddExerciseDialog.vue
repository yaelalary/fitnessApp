<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Exercise, ImageStore } from '@/domain/types'
import { useConfirm } from '@/composables/useConfirm'
import AppDialog from '@/components/ui/AppDialog.vue'
import ConfirmActionDialog from '@/components/ui/ConfirmActionDialog.vue'
import ExerciseCreator from './ExerciseCreator.vue'
import ExercisePicker from './ExercisePicker.vue'

const props = defineProps<{ open: boolean; exercises: Exercise[]; images: ImageStore }>()
const emit = defineEmits<{ pick: [exercise: Exercise]; close: [] }>()

const creating = ref(false)
const initialName = ref('')
const creator = ref<InstanceType<typeof ExerciseCreator> | null>(null)
const confirm = useConfirm()

const title = computed(() => (creating.value ? 'Nouvel exercice' : 'Ajouter un exercice'))

watch(
  () => props.open,
  (open) => {
    if (open) creating.value = false
  },
)

function startCreating(name: string) {
  initialName.value = name
  creating.value = true
}

async function canLeaveCreation(): Promise<boolean> {
  if (!creating.value || !creator.value?.isDirty) return true
  return confirm.ask({
    title: 'Abandonner ce nouvel exercice ?',
    message: 'Ce que tu as saisi pour cet exercice sera perdu.',
    confirmLabel: 'Abandonner',
    cancelLabel: 'Continuer',
    destructive: true,
  })
}

async function backToList() {
  if (await canLeaveCreation()) creating.value = false
}

async function close() {
  if (await canLeaveCreation()) emit('close')
}
</script>

<template>
  <AppDialog :open="open" :title="title" :fullscreen="creating" @close="close">
    <ExerciseCreator v-if="creating" ref="creator" :initial-name="initialName" @created="emit('pick', $event)" @back="backToList" />
    <ExercisePicker v-else :exercises="exercises" :images="images" @pick="emit('pick', $event)" @create="startCreating" />
  </AppDialog>
  <ConfirmActionDialog :request="confirm.request.value" @respond="confirm.respond" />
</template>
