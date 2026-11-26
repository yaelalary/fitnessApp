import { describe, expect, it } from 'vitest'
import type { Exercise, Routine, Session } from './types'
import { addSet, completeAllEntries, createSessionFromRoutine, describePerformance, describeSessionSummary, findLastEntry, hasPendingEntries, isEntryComplete, removeSet, summarizeSession, updateSet } from './sessions'
import { createExercise } from './exercises'
import { routineItemNote } from './routines'

function exercise(id: string, overrides: Partial<Exercise> = {}): Exercise {
  return { ...createExercise('strength'), id, name: id, ...overrides }
}

const press = exercise('press', { defaults: { sets: 3, reps: 10, weightKg: 0, restSeconds: 90, durationMinutes: 0 } })
const bike = exercise('bike', { category: 'cardio', defaults: { sets: 0, reps: 0, weightKg: 0, restSeconds: 0, durationMinutes: 15 } })
const exercisesById = new Map([press, bike].map((item) => [item.id, item]))

const routine: Routine = {
  id: 'r1',
  name: 'Haut du corps',
  notes: '',
  items: [
    { id: 'i1', exerciseId: 'bike', targets: bike.defaults, notes: '' },
    { id: 'i2', exerciseId: 'press', targets: { sets: 4, reps: 8, weightKg: 0, restSeconds: 120, durationMinutes: 0 }, notes: 'Siège cran 4' },
    { id: 'i3', exerciseId: 'deleted', targets: press.defaults, notes: '' },
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
        intervals: [],
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

describe('charge par défaut', () => {
  it('pré-remplit les séries avec la charge de l’exercice quand il n’y a pas d’historique', () => {
    const heavy = { ...press, defaults: { ...press.defaults, weightKg: 50 } }
    const single: Routine = { ...routine, items: [{ id: 'i', exerciseId: 'press', targets: heavy.defaults, notes: '' }] }
    const session = createSessionFromRoutine(single, new Map([['press', heavy]]), [], '2026-11-22')
    expect(session.entries[0].sets.map((set) => set.weightKg)).toEqual([50, 50, 50])
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

describe('tout cocher', () => {
  const session = createSessionFromRoutine(routine, exercisesById, history, '2026-11-22')

  it('signale les séries restant à cocher', () => {
    expect(hasPendingEntries(session)).toBe(true)
  })

  it('coche toutes les séries sans modifier charges ni répétitions', () => {
    const completed = completeAllEntries(session)
    expect(hasPendingEntries(completed)).toBe(false)
    expect(completed.entries[1].sets).toEqual(session.entries[1].sets.map((set) => ({ ...set, done: true })))
    expect(completed.entries[0].durationMinutes).toBe(15)
  })

  it('ne mute pas la séance d’origine', () => {
    completeAllEntries(session)
    expect(session.entries[1].sets.every((set) => !set.done)).toBe(true)
  })

  it('compte le cardio comme à cocher tant qu’il n’est pas fait', () => {
    const cardio = session.entries[0]
    expect(isEntryComplete(cardio)).toBe(false)
    expect(hasPendingEntries({ ...session, entries: [cardio] })).toBe(true)
    expect(isEntryComplete({ ...cardio, intervals: cardio.intervals.map((interval) => ({ ...interval, done: true })) })).toBe(true)
  })

  it('coche aussi le cardio', () => {
    const completed = completeAllEntries(session)
    expect(completed.entries[0].intervals.every((interval) => interval.done)).toBe(true)
    expect(isEntryComplete(completed.entries[0])).toBe(true)
  })

  it('ne signale rien pour un exercice de musculation sans séries', () => {
    const empty = { ...session.entries[1], sets: [] }
    expect(hasPendingEntries({ ...session, entries: [empty] })).toBe(false)
    expect(isEntryComplete(empty)).toBe(false)
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
      cardioMinutes: 0,
    })
  })

  it('n’affiche que le temps de cardio, sans compter l’échauffement', () => {
    const base = history[0].entries[0]
    const session: Session = {
      ...history[0],
      entries: [
        { ...base, id: 'w', category: 'warmup', sets: [], durationMinutes: 10 },
        base,
        { ...base, id: 'c', category: 'cardio', sets: [], durationMinutes: 25 },
        { ...base, id: 'c2', category: 'cardio', sets: [], durationMinutes: 0.5 },
      ],
    }
    expect(summarizeSession(session).cardioMinutes).toBe(25.5)
    expect(describeSessionSummary(summarizeSession(session))).toBe('4 exercices · 2 séries · 760 kg soulevés · 25 min 30 de cardio')
  })
})

describe('routineItemNote', () => {
  it('retrouve la consigne du parcours pour un exercice', () => {
    expect(routineItemNote(routine, 'press')).toBe('Siège cran 4')
    expect(routineItemNote(routine, 'bike')).toBe('')
    expect(routineItemNote(routine, 'inconnu')).toBe('')
    expect(routineItemNote(null, 'press')).toBe('')
  })
})
