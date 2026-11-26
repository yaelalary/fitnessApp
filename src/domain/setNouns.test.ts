import { describe, expect, it } from 'vitest'
import { categoryOf } from './categories'
import { setLabels, setNounTitle } from './setNouns'
import { createExercise, validateExercise } from './exercises'

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
})
