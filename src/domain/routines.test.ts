import { describe, expect, it } from 'vitest'
import type { Exercise, Routine, Session, SessionEntry } from './types'
import { createExercise } from './exercises'
import { addSessionExercisesToRoutine, exercisesMissingFromRoutine } from './routines'
import { targetSets } from './setTargets'

function exercise(id: string): Exercise {
  return { ...createExercise('strength'), id, name: id, defaults: { sets: 3, reps: 10, weightKg: 20, restSeconds: 90, durationMinutes: 0 } }
}

const exercisesById = new Map(['bike', 'press', 'curl', 'row'].map((id) => [id, exercise(id)]))

function entry(exerciseId: string, weightKg = 20): SessionEntry {
  return {
    id: `e-${exerciseId}`,
    exerciseId,
    exerciseName: exerciseId,
    category: 'strength',
    restSeconds: 60,
    sets: [
      { reps: 8, weightKg, done: true },
      { reps: 8, weightKg, done: true },
    ],
    intervals: [],
    durationMinutes: 0,
    distanceKm: 0,
    notes: '',
  }
}

const routine: Routine = {
  id: 'r',
  name: 'Haut',
  notes: '',
  items: [
    { id: 'i1', exerciseId: 'bike', targets: exercise('bike').defaults, notes: 'Échauffement' },
    { id: 'i2', exerciseId: 'press', targets: exercise('press').defaults, notes: '' },
  ],
}

function session(...entries: SessionEntry[]): Session {
  return { id: 's', date: '2026-11-28', routineId: 'r', title: 'Haut', notes: '', entries }
}

describe('exercisesMissingFromRoutine', () => {
  it('liste une seule fois les exercices de la séance absents du parcours', () => {
    const missing = exercisesMissingFromRoutine(routine, session(entry('bike'), entry('curl'), entry('curl'), entry('row')), exercisesById)
    expect(missing.map((item) => item.id)).toEqual(['curl', 'row'])
  })

  it('ignore les exercices supprimés depuis', () => {
    expect(exercisesMissingFromRoutine(routine, session(entry('deleted')), exercisesById)).toEqual([])
  })
})

describe('addSessionExercisesToRoutine', () => {
  it('insère les exercices ajoutés à la place qu’ils occupent dans la séance', () => {
    const updated = addSessionExercisesToRoutine(routine, session(entry('curl'), entry('bike'), entry('row'), entry('press')), exercisesById)
    expect(updated.items.map((item) => item.exerciseId)).toEqual(['curl', 'bike', 'row', 'press'])
  })

  it('garde les exercices du parcours non faits pendant la séance, avec leurs objectifs et consignes', () => {
    const updated = addSessionExercisesToRoutine(routine, session(entry('press'), entry('curl')), exercisesById)
    expect(updated.items.map((item) => item.exerciseId)).toEqual(['bike', 'press', 'curl'])
    expect(updated.items.slice(0, 2)).toEqual(routine.items)
  })

  it('reprend pour l’exercice ajouté ce qui a été fait pendant la séance', () => {
    const [, , added] = addSessionExercisesToRoutine(routine, session(entry('press'), entry('curl', 35)), exercisesById).items
    expect(added.targets.restSeconds).toBe(60)
    expect(targetSets(added.targets)).toEqual([
      { reps: 8, weightKg: 35 },
      { reps: 8, weightKg: 35 },
    ])
    expect(added.notes).toBe('')
  })

  it('ne change rien quand le parcours contient déjà tous les exercices', () => {
    expect(addSessionExercisesToRoutine(routine, session(entry('press'), entry('bike')), exercisesById).items).toEqual(routine.items)
  })
})
