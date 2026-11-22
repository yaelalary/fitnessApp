import { describe, expect, it } from 'vitest'
import type { Exercise, Routine, Session } from './types'
import { addSet, createSessionFromRoutine, describePerformance, describeSessionSummary, findLastEntry, removeSet, summarizeSession, updateSet } from './sessions'
import { createExercise } from './exercises'

function exercise(id: string, overrides: Partial<Exercise> = {}): Exercise {
  return { ...createExercise('strength'), id, name: id, ...overrides }
}

const press = exercise('press', { defaults: { sets: 3, reps: 10, restSeconds: 90, durationMinutes: 0 } })
const bike = exercise('bike', { category: 'cardio', defaults: { sets: 0, reps: 0, restSeconds: 0, durationMinutes: 15 } })
const exercisesById = new Map([press, bike].map((item) => [item.id, item]))

const routine: Routine = {
  id: 'r1',
  name: 'Haut du corps',
  notes: '',
  items: [
    { id: 'i1', exerciseId: 'bike', targets: bike.defaults },
    { id: 'i2', exerciseId: 'press', targets: { sets: 4, reps: 8, restSeconds: 120, durationMinutes: 0 } },
    { id: 'i3', exerciseId: 'deleted', targets: press.defaults },
  ],
}

const history: Session[] = [
  {
    id: 'old',
    date: '2026-11-01',
    routineId: 'r1',
    title: 'Haut du corps',
    notes: '',
    entries: [
      {
        id: 'e1',
        exerciseId: 'press',
        exerciseName: 'press',
        category: 'strength',
        restSeconds: 90,
        sets: [
          { reps: 10, weightKg: 40, done: true },
          { reps: 8, weightKg: 45, done: true },
        ],
        durationMinutes: 0,
        distanceKm: 0,
        notes: '',
      },
    ],
  },
]

describe('createSessionFromRoutine', () => {
  const session = createSessionFromRoutine(routine, exercisesById, history, '2026-11-22')

  it('reprend l’ordre du parcours et ignore les exercices supprimés', () => {
    expect(session.entries.map((entry) => entry.exerciseId)).toEqual(['bike', 'press'])
    expect(session.title).toBe('Haut du corps')
    expect(session.date).toBe('2026-11-22')
  })

  it('pré-remplit les charges de la dernière séance, sur le nombre de séries du parcours', () => {
    const pressEntry = session.entries[1]
    expect(pressEntry.sets).toEqual([
      { reps: 10, weightKg: 40, done: false },
      { reps: 8, weightKg: 45, done: false },
      { reps: 8, weightKg: 45, done: false },
      { reps: 8, weightKg: 45, done: false },
    ])
    expect(pressEntry.restSeconds).toBe(120)
  })

  it('utilise la durée cible pour le cardio sans historique', () => {
    expect(session.entries[0].durationMinutes).toBe(15)
    expect(session.entries[0].sets).toEqual([])
  })
})

describe('findLastEntry', () => {
  it('peut exclure la séance en cours', () => {
    expect(findLastEntry(history, 'press')?.id).toBe('e1')
    expect(findLastEntry(history, 'press', 'old')).toBeNull()
  })
})

describe('édition des séries', () => {
  const entry = history[0].entries[0]

  it('ajoute une série en copiant la précédente', () => {
    expect(addSet(entry).sets.at(-1)).toEqual({ reps: 8, weightKg: 45, done: false })
  })

  it('retire et modifie une série sans muter l’original', () => {
    expect(removeSet(entry, 0).sets).toHaveLength(1)
    expect(updateSet(entry, 1, { weightKg: 50 }).sets[1].weightKg).toBe(50)
    expect(entry.sets[1].weightKg).toBe(45)
  })
})

describe('describePerformance', () => {
  it('résume séries et charges', () => {
    expect(describePerformance(history[0].entries[0])).toBe('10 × 40 kg, 8 × 45 kg')
  })

  it('résume le cardio en durée et distance', () => {
    const cardio = { ...history[0].entries[0], category: 'cardio' as const, sets: [], durationMinutes: 25, distanceKm: 4.5 }
    expect(describePerformance(cardio)).toBe('25 min · 4,5 km')
  })
})

describe('summarizeSession', () => {
  it('décrit la séance en une ligne', () => {
    expect(describeSessionSummary(summarizeSession(history[0]))).toBe('1 exercice · 2 séries · 760 kg soulevés')
  })

  it('compte séries et volume', () => {
    expect(summarizeSession(history[0])).toEqual({
      exerciseCount: 1,
      setCount: 2,
      completedSetCount: 2,
      volumeKg: 760,
      durationMinutes: 0,
    })
  })
})
