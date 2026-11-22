import type { Exercise, Routine, RoutineItem } from './types'
import { createId } from './ids'
import { requiredText, type ValidationErrors } from './validation'

export type RoutineField = 'name' | 'items'

export function createRoutine(): Routine {
  return { id: createId(), name: '', notes: '', items: [] }
}

export function createRoutineItem(exercise: Exercise): RoutineItem {
  return { id: createId(), exerciseId: exercise.id, targets: { ...exercise.defaults } }
}

export function validateRoutine(routine: Routine): ValidationErrors<RoutineField> {
  return {
    name: requiredText(routine.name, 'Donne un nom au parcours.'),
    items: routine.items.length === 0 ? 'Ajoute au moins un exercice.' : undefined,
  }
}

export function removeExerciseFromRoutines(routines: readonly Routine[], exerciseId: string): Routine[] {
  return routines.map((routine) => ({
    ...routine,
    items: routine.items.filter((item) => item.exerciseId !== exerciseId),
  }))
}
