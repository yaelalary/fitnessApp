import { describe, expect, it } from 'vitest'
import { changeExerciseCategory, createExercise, describeTargets, filterExercises, validateExercise } from './exercises'
import { moveItem, upsertById } from './collections'
import { formatDuration, formatRest, joinMinutes, splitMinutes, startOfWeekIso } from './dates'
import { validateRoutine, removeExerciseFromRoutines, createRoutine } from './routines'
import { hasErrors } from './validation'

describe('validateExercise', () => {
  it('exige un nom et des séries pour la musculation', () => {
    const exercise = { ...createExercise('strength'), defaults: { sets: 0, reps: 10, weightKg: 0, restSeconds: 60, durationMinutes: 0 } }
    const errors = validateExercise(exercise)
    expect(errors.name).toBeDefined()
    expect(errors.sets).toBeDefined()
  })

  it('refuse une charge négative', () => {
    const exercise = { ...createExercise('strength'), name: 'Presse', defaults: { sets: 3, reps: 10, weightKg: -5, restSeconds: 60, durationMinutes: 0 } }
    expect(validateExercise(exercise).weightKg).toBeDefined()
  })

  it('ne demande pas de séries pour le cardio', () => {
    const exercise = { ...createExercise('cardio'), name: 'Tapis' }
    expect(hasErrors(validateExercise(exercise))).toBe(false)
  })
})

describe('changeExerciseCategory', () => {
  it('applique les valeurs par défaut de la nouvelle catégorie', () => {
    const exercise = changeExerciseCategory(createExercise('strength'), 'cardio')
    expect(exercise.defaults.durationMinutes).toBe(20)
  })
})

describe('describeTargets', () => {
  it('décrit séries et récupération', () => {
    expect(describeTargets({ sets: 3, reps: 10, weightKg: 0, restSeconds: 90, durationMinutes: 0 }, 'strength')).toBe('3 × 10 · récup 1 min 30')
    expect(describeTargets({ sets: 4, reps: 8, weightKg: 42.5, restSeconds: 120, durationMinutes: 0 }, 'strength')).toBe(
      '4 × 8 · 42,5 kg · récup 2 min',
    )
    expect(describeTargets({ sets: 2, reps: 30, weightKg: 0, restSeconds: 0, durationMinutes: 0 }, 'stretching')).toBe('2 × 30 s')
    expect(describeTargets({ sets: 0, reps: 0, weightKg: 0, restSeconds: 0, durationMinutes: 20 }, 'cardio')).toBe('20 min')
  })
})

describe('filterExercises', () => {
  it('filtre par catégorie et texte, trié par nom', () => {
    const list = [
      { ...createExercise('strength'), name: 'Leg press', machine: 'Linear Leg Press' },
      { ...createExercise('strength'), name: 'Développé', muscles: ['chest-upper'] },
      { ...createExercise('cardio'), name: 'Vélo' },
    ]
    expect(filterExercises(list, 'strength', '').map((item) => item.name)).toEqual(['Développé', 'Leg press'])
    expect(filterExercises(list, null, 'pecto').map((item) => item.name)).toEqual(['Développé'])
    expect(filterExercises(list, null, 'developpe').map((item) => item.name)).toEqual(['Développé'])
  })
})

describe('routines', () => {
  it('exige un nom et un exercice', () => {
    const errors = validateRoutine(createRoutine())
    expect(errors.name).toBeDefined()
    expect(errors.items).toBeDefined()
  })

  it('retire un exercice supprimé des parcours', () => {
    const routine = { ...createRoutine(), items: [{ id: 'i', exerciseId: 'x', targets: createExercise().defaults, notes: '' }] }
    expect(removeExerciseFromRoutines([routine], 'x')[0].items).toEqual([])
  })
})

describe('collections', () => {
  it('déplace un élément', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b'])
  })

  it('insère ou remplace', () => {
    expect(upsertById([{ id: 'a', v: 1 }], { id: 'a', v: 2 })).toEqual([{ id: 'a', v: 2 }])
    expect(upsertById([{ id: 'a', v: 1 }], { id: 'b', v: 2 })).toHaveLength(2)
  })
})

describe('dates', () => {
  it('formate la récupération', () => {
    expect(formatRest(45)).toBe('45 s')
    expect(formatRest(120)).toBe('2 min')
    expect(formatRest(0)).toBe('Aucune')
  })

  it('trouve le lundi de la semaine', () => {
    expect(startOfWeekIso('2026-11-22')).toBe('2026-11-16')
    expect(startOfWeekIso('2026-11-16')).toBe('2026-11-16')
  })
})

describe('durées en minutes et secondes', () => {
  it('découpe et recompose une durée sans perte', () => {
    expect(splitMinutes(0.5)).toEqual({ minutes: 0, seconds: 30 })
    expect(splitMinutes(20)).toEqual({ minutes: 20, seconds: 0 })
    expect(splitMinutes(1.75)).toEqual({ minutes: 1, seconds: 45 })
    expect(joinMinutes({ minutes: 1, seconds: 45 })).toBe(1.75)
    expect(splitMinutes(joinMinutes({ minutes: 2, seconds: 10 }))).toEqual({ minutes: 2, seconds: 10 })
  })

  it('ignore une durée négative', () => {
    expect(splitMinutes(-3)).toEqual({ minutes: 0, seconds: 0 })
  })

  it('affiche les secondes quand il y en a', () => {
    expect(formatDuration(0.5)).toBe('30 s')
    expect(formatDuration(1.5)).toBe('1 min 30')
    expect(formatDuration(20)).toBe('20 min')
    expect(formatDuration(0)).toBe('')
    expect(describeTargets({ sets: 0, reps: 0, weightKg: 0, restSeconds: 0, durationMinutes: 0.5 }, 'warmup')).toBe('30 s')
    expect(describeTargets({ sets: 0, reps: 0, weightKg: 0, restSeconds: 0, durationMinutes: 0 }, 'warmup')).toBe('Durée libre')
  })
})
