import { computed, ref } from 'vue'
import type { Exercise } from '@/domain/types'
import type { ImageInput } from '@/domain/images'
import { cloneData, isSameData } from '@/domain/collections'
import { validateExercise, type ExerciseField } from '@/domain/exercises'
import { hasErrors, type ValidationErrors } from '@/domain/validation'
import { useWorkoutStore } from '@/stores/workout'

export function useExerciseEditor(initial: Exercise) {
  const workout = useWorkoutStore()
  const baseline = cloneData(initial)
  const draft = ref<Exercise>(cloneData(initial))
  const image = ref<ImageInput>({ kind: 'keep' })
  const errors = ref<ValidationErrors<ExerciseField>>({})

  const isDirty = computed(() => !isSameData(draft.value, baseline) || image.value.kind !== 'keep')

  async function save(): Promise<boolean> {
    errors.value = validateExercise(draft.value)
    if (hasErrors(errors.value)) return false
    await workout.saveExercise(draft.value, image.value)
    return true
  }

  return { draft, image, errors, isDirty, save }
}
