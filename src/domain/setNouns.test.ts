import { describe, expect, it } from 'vitest'
import { categoryOf } from './categories'
import { setLabels, setNounTitle } from './setNouns'
import { createExercise, describeTargets, validateExercise } from './exercises'
import { describePerformance } from './sessions'
import type { SessionEntry } from './types'

describe('vocabulaire des séries', () => {
  it('parle de maintiens, pas de séries, pour les étirements', () => {
    const stretching = categoryOf('stretching')
    expect(setNounTitle(stretching.setNoun, true)).toBe('Maintiens')
    expect(setLabels(stretching.setNoun, stretching.repsLabel, 2)).toEqual({
      done: 'Maintien 2 fait',
      reps: 'Durée (s) maintien 2',
      weight: 'charge maintien 2',
      remove: 'Supprimer le maintien 2',
    })
  })

  it('garde les séries pour la musculation', () => {
    const strength = categoryOf('strength')
    expect(setNounTitle(strength.setNoun)).toBe('Série')
    expect(setLabels(strength.setNoun, strength.repsLabel, 1).done).toBe('Série 1 faite')
  })

  it('demande au moins un maintien pour un étirement', () => {
    const exercise = { ...createExercise('stretching'), name: 'Ischios', defaults: { ...createExercise('stretching').defaults, sets: 0 } }
    expect(validateExercise(exercise).sets).toBe('Au moins un maintien.')
  })

  it('accepte un étirement sans durée de maintien', () => {
    const defaults = { ...createExercise('stretching').defaults, sets: 2, reps: 0 }
    const exercise = { ...createExercise('stretching'), name: 'Ischios', defaults }
    expect(validateExercise(exercise).reps).toBeUndefined()
    expect(describeTargets(defaults, 'stretching')).toBe('2 maintiens · récup 15 s')
  })

  it('exige toujours des répétitions en musculation', () => {
    const exercise = { ...createExercise('strength'), name: 'Presse', defaults: { ...createExercise('strength').defaults, reps: 0 } }
    expect(validateExercise(exercise).reps).toBe('Au moins une répétition.')
  })

  it('résume un étirement sans durée par son nombre de maintiens', () => {
    const entry = {
      category: 'stretching',
      sets: [
        { reps: 0, weightKg: 0, done: true },
        { reps: 0, weightKg: 0, done: true },
      ],
    } as SessionEntry
    expect(describePerformance(entry)).toBe('2 maintiens')
    expect(describePerformance({ ...entry, sets: [{ reps: 30, weightKg: 0, done: true }] })).toBe('30 s')
  })
})

describe('échauffement', () => {
  it('démarre en durée libre plutôt qu’avec une durée imposée', () => {
    const warmup = createExercise('warmup')
    expect(warmup.defaults.durationMinutes).toBe(0)
    expect(describeTargets(warmup.defaults, 'warmup')).toBe('Durée libre')
  })
})
