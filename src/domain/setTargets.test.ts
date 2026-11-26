import { describe, expect, it } from 'vitest'
import type { ExerciseTargets } from './types'
import { appendTargetSet, hasIdenticalSets, patchTargetSetAt, removeTargetSetAt, repeatSet, targetSets, withTargetSets } from './setTargets'
import { createExercise, describeTargets, validateExercise } from './exercises'
import { createEntry } from './sessions'
import { normalizeProfile } from './profiles'

const legacy: ExerciseTargets = { sets: 3, reps: 10, weightKg: 40, restSeconds: 90, durationMinutes: 0 }

describe('séries de l’objectif', () => {
  it('lit un ancien objectif comme des séries identiques', () => {
    const sets = targetSets(legacy)
    expect(sets).toEqual([
      { reps: 10, weightKg: 40 },
      { reps: 10, weightKg: 40 },
      { reps: 10, weightKg: 40 },
    ])
    expect(hasIdenticalSets(sets)).toBe(true)
  })

  it('garde une charge différente par série', () => {
    const targets = withTargetSets(legacy, [
      { reps: 12, weightKg: 20 },
      { reps: 10, weightKg: 25 },
      { reps: 8, weightKg: 30 },
    ])
    expect(targetSets(targets).map((set) => set.weightKg)).toEqual([20, 25, 30])
    expect(hasIdenticalSets(targetSets(targets))).toBe(false)
    expect(describeTargets(targets, 'strength')).toBe('12 × 20 kg, 10 × 25 kg, 8 × 30 kg · récup 1 min 30')
  })

  it('reste lisible par les anciennes versions de l’app', () => {
    const targets = withTargetSets(legacy, [
      { reps: 12, weightKg: 20 },
      { reps: 8, weightKg: 30 },
    ])
    expect(targets).toMatchObject({ sets: 2, reps: 12, weightKg: 20 })
  })

  it('répète une série le nombre de fois demandé', () => {
    expect(repeatSet({ reps: 8, weightKg: 50 }, 4)).toHaveLength(4)
    expect(repeatSet({ reps: 8, weightKg: 50 }, 0)).toHaveLength(1)
    expect(describeTargets(withTargetSets(legacy, repeatSet({ reps: 8, weightKg: 50 }, 4)), 'strength')).toBe('4 × 8 · 50 kg · récup 1 min 30')
  })

  it('ajoute, modifie et retire une série sans muter la liste', () => {
    const sets = targetSets(legacy)
    const added = appendTargetSet(sets)
    expect(added).toHaveLength(4)
    expect(added[3]).toEqual({ reps: 10, weightKg: 40 })
    expect(patchTargetSetAt(sets, 1, { weightKg: 45 })[1]).toEqual({ reps: 10, weightKg: 45 })
    expect(removeTargetSetAt(sets, 0)).toHaveLength(2)
    expect(sets[1].weightKg).toBe(40)
  })

  it('démarre la séance avec les charges de chaque série', () => {
    const exercise = { ...createExercise('strength'), id: 'presse', name: 'Presse' }
    const targets = withTargetSets(legacy, [
      { reps: 12, weightKg: 20 },
      { reps: 10, weightKg: 25 },
    ])
    expect(createEntry(exercise, targets, null).sets).toEqual([
      { reps: 12, weightKg: 20, done: false },
      { reps: 10, weightKg: 25, done: false },
    ])
  })

  it('refuse une série sans répétition en musculation', () => {
    const defaults = withTargetSets(legacy, [
      { reps: 10, weightKg: 20 },
      { reps: 0, weightKg: 20 },
    ])
    const exercise = { ...createExercise('strength'), name: 'Presse', defaults }
    expect(validateExercise(exercise).reps).toBe('Au moins une répétition.')
  })

  it('relit les séries enregistrées dans le gist', () => {
    const defaults = withTargetSets(legacy, [
      { reps: 12, weightKg: 20 },
      { reps: 8, weightKg: 30 },
    ])
    const exercise = { ...createExercise('strength'), id: 'presse', name: 'Presse', defaults }
    const profile = normalizeProfile(JSON.parse(JSON.stringify({ id: 'p', name: 'Moi', exercises: [exercise], routines: [], sessions: [] })))
    expect(targetSets(profile?.exercises[0].defaults ?? legacy)).toEqual(defaults.setTargets)
  })
})
