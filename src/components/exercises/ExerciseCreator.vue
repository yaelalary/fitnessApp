<script setup lang="ts">
import type { Exercise } from '@/domain/types'
import { createExercise } from '@/domain/exercises'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useExerciseEditor } from '@/composables/useExerciseEditor'
import AppButton from '@/components/ui/AppButton.vue'
import ExerciseForm from './ExerciseForm.vue'

const props = defineProps<{ initialName: string }>()
const emit = defineEmits<{ created: [exercise: Exercise]; back: [] }>()

const editor = useExerciseEditor({ ...createExercise(), name: props.initialName })
const { draft, image, errors, isDirty } = editor
const { busy, error, run } = useAsyncAction()

async function save() {
  const saved = await run(() => editor.save())
  if (saved) emit('created', saved)
}

defineExpose({ isDirty })
</script>

<template>
  <ExerciseForm
    v-model:draft="draft"
    v-model:image="image"
    :errors="errors"
    :image-src="null"
    :submitting="busy"
    :error="error"
    @submit="save"
  >
    <template #secondary-action>
      <AppButton variant="ghost" icon="back" :disabled="busy" @click="emit('back')">Retour</AppButton>
    </template>
  </ExerciseForm>
</template>
