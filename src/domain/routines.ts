import type { Exercise, Routine, RoutineItem, Session, SessionEntry } from './types'
import { createId } from './ids'
import { targetsFromEntry } from './exerciseDefaults'
import { requiredText, type ValidationErrors } from './validation'

export type RoutineField = 'name' | 'items'

export function createRoutine(): Routine {
  return { id: createId(), name: '', notes: '', items: [] }
}

export function createRoutineItem(exercise: Exercise): RoutineItem {
  return { id: createId(), exerciseId: exercise.id, targets: { ...exercise.defaults }, notes: '' }
}

export function validateRoutine(routine: Routine): ValidationErrors<RoutineField> {
  return {
    name: requiredText(routine.name, 'Donne un nom au parcours.'),
    items: routine.items.length === 0 ? 'Ajoute au moins un exercice.' : undefined,
  }
}

export function routineItemNote(routine: Routine | null, exerciseId: string): string {
  return routine?.items.find((item) => item.exerciseId === exerciseId)?.notes.trim() ?? ''
}

export function removeExerciseFromRoutines(routines: readonly Routine[], exerciseId: string): Routine[] {
  return routines.map((routine) => ({
    ...routine,
    items: routine.items.filter((item) => item.exerciseId !== exerciseId),
  }))
}

function isInRoutine(items: readonly RoutineItem[], exerciseId: string): boolean {
  return items.some((item) => item.exerciseId === exerciseId)
}

function routineItemFromEntry(entry: SessionEntry, exercise: Exercise): RoutineItem {
  return { id: createId(), exerciseId: exercise.id, targets: targetsFromEntry(entry, exercise.defaults), notes: '' }
}

export function exercisesMissingFromRoutine(routine: Routine, session: Session, exercisesById: ReadonlyMap<string, Exercise>): Exercise[] {
  const missing = new Map<string, Exercise>()
  for (const entry of session.entries) {
    const exercise = exercisesById.get(entry.exerciseId)
    if (exercise && !isInRoutine(routine.items, exercise.id)) missing.set(exercise.id, exercise)
  }
  return [...missing.values()]
}

export function addSessionExercisesToRoutine(routine: Routine, session: Session, exercisesById: ReadonlyMap<string, Exercise>): Routine {
  const items = [...routine.items]
  let insertAfter = -1
  for (const entry of session.entries) {
    const existing = items.findIndex((item) => item.exerciseId === entry.exerciseId)
    if (existing >= 0) {
      insertAfter = existing
      continue
    }
    const exercise = exercisesById.get(entry.exerciseId)
    if (!exercise) continue
    insertAfter += 1
    items.splice(insertAfter, 0, routineItemFromEntry(entry, exercise))
  }
  return { ...routine, items }
}
