import { describe, expect, it } from 'vitest'
import type { Exercise } from './types'
import { applyTargetsToExercise, hasSameTargets, targetsFromEntry } from './exerciseDefaults'
import { createExercise } from './exercises'
import { createEntry, updateSet } from './sessions'
import { targetSets, withTargetSets } from './setTargets'
import { targetIntervals, updateInterval } from './intervals'

const press: Exercise = {
  ...createExercise('strength'),
  id: 'presse',
  name: 'Presse',
  defaults: { sets: 3, reps: 10, weightKg: 40, restSeconds: 90, durationMinutes: 0 },
}

describe('mettre à jour l’exercice depuis la séance', () => {
  it('reprend les répétitions, charges et récup réellement faites', () => {
    let entry = createEntry(press, press.defaults, null)
    entry = updateSet(entry, 1, { weightKg: 45 })
    entry = updateSet(entry, 2, { weightKg: 50, reps: 8 })
    entry = { ...entry, restSeconds: 120 }
    const targets = targetsFromEntry(entry, press.defaults)
    expect(targetSets(targets)).toEqual([
      { reps: 10, weightKg: 40 },
      { reps: 10, weightKg: 45 },
      { reps: 8, weightKg: 50 },
    ])
    expect(targets.restSeconds).toBe(120)
  })

  it('indique que l’exercice est à jour tant que la séance n’a rien changé', () => {
    const entry = createEntry(press, press.defaults, null)
    expect(hasSameTargets(press, targetsFromEntry(entry, press.defaults))).toBe(true)
    const heavier = updateSet(entry, 0, { weightKg: 42.5 })
    expect(hasSameTargets(press, targetsFromEntry(heavier, press.defaults))).toBe(false)
  })

  it('ignore les cases cochées, qui ne font pas partie de l’objectif', () => {
    const entry = updateSet(createEntry(press, press.defaults, null), 0, { done: true })
    expect(hasSameTargets(press, targetsFromEntry(entry, press.defaults))).toBe(true)
  })

  it('reprend les paliers du cardio et leurs réglages', () => {
    const treadmill: Exercise = { ...createExercise('cardio'), id: 'tapis', name: 'Tapis', settings: ['speed'] }
    let entry = createEntry(treadmill, treadmill.defaults, null)
    entry = updateInterval(entry, 0, { durationMinutes: 12, values: { speed: 10, incline: 2 }, done: true })
    const updated = applyTargetsToExercise(treadmill, targetsFromEntry(entry, treadmill.defaults))
    expect(targetIntervals(updated.defaults)).toEqual([{ durationMinutes: 12, values: { speed: 10, incline: 2 }, done: false }])
    expect(updated.defaults.durationMinutes).toBe(12)
    expect(updated.settings).toEqual(['speed', 'incline'])
  })
})

describe('mettre à jour l’exercice depuis le parcours', () => {
  it('compare l’objectif du parcours à celui de l’exercice', () => {
    expect(hasSameTargets(press, { ...press.defaults })).toBe(true)
    const changed = withTargetSets(press.defaults, [
      { reps: 10, weightKg: 40 },
      { reps: 10, weightKg: 50 },
    ])
    expect(hasSameTargets(press, changed)).toBe(false)
    expect(hasSameTargets(applyTargetsToExercise(press, changed), changed)).toBe(true)
  })
})
