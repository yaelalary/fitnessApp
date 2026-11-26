import { ref } from 'vue'
import type { ExerciseTargets } from '@/domain/types'
import { useWorkoutStore } from '@/stores/workout'

export interface ExerciseDefaultsUpdateState {
  busy: boolean
  error: string
}

export function useExerciseDefaultsUpdate() {
  const workout = useWorkoutStore()
  const pendingKey = ref<string | null>(null)
  const failedKey = ref<string | null>(null)
  const error = ref('')

  async function apply(key: string, exerciseId: string, targets: ExerciseTargets) {
    pendingKey.value = key
    failedKey.value = null
    try {
      await workout.updateExerciseDefaults(exerciseId, targets)
    } catch (caught) {
      failedKey.value = key
      error.value = caught instanceof Error ? caught.message : 'La mise à jour de l’exercice a échoué.'
    } finally {
      pendingKey.value = null
    }
  }

  function stateOf(key: string): ExerciseDefaultsUpdateState {
    return { busy: pendingKey.value === key, error: failedKey.value === key ? error.value : '' }
  }

  return { apply, stateOf }
}
