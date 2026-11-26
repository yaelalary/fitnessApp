import { describe, expect, it } from 'vitest'
import type { Exercise, SessionEntry } from './types'
import { addInterval, createInterval, removeInterval, settingsUsedIn, targetIntervals, updateInterval, withSettings, withTargetIntervals } from './intervals'
import { normalizeCardioSettings } from './cardioSettings'
import { createEntry, describePerformance, isEntryComplete } from './sessions'
import { changeExerciseSettings, createExercise, describeTargets } from './exercises'
import { normalizeProfile, normalizeSession } from './profiles'

const treadmill: Exercise = { ...createExercise('cardio'), id: 'tapis', name: 'Tapis', settings: ['speed', 'incline'] }

function entryWith(intervals = [createInterval(5, { speed: 8, incline: 1 }), createInterval(10, { speed: 11, incline: 3 })]): SessionEntry {
  return { ...createEntry(treadmill, treadmill.defaults, null), intervals, durationMinutes: 15 }
}

describe('paliers', () => {
  it('démarre avec un palier à la durée cible', () => {
    const entry = createEntry(treadmill, treadmill.defaults, null)
    expect(entry.intervals).toEqual([{ durationMinutes: 20, values: { speed: 0, incline: 0 }, done: false }])
    expect(entry.durationMinutes).toBe(20)
  })

  it('reprend les paliers de la dernière fois, décochés', () => {
    const previous = { ...entryWith(), intervals: entryWith().intervals.map((interval) => ({ ...interval, done: true })) }
    const entry = createEntry(treadmill, treadmill.defaults, previous)
    expect(entry.intervals.map((interval) => interval.values)).toEqual([{ speed: 8, incline: 1 }, { speed: 11, incline: 3 }])
    expect(entry.intervals.every((interval) => !interval.done)).toBe(true)
    expect(entry.durationMinutes).toBe(15)
  })

  it('n’ajoute pas de palier à un exercice de musculation', () => {
    const press = { ...createExercise('strength'), id: 'press' }
    expect(createEntry(press, press.defaults, null).intervals).toEqual([])
  })

  it('ajoute un palier en copiant le précédent et recalcule la durée totale', () => {
    const entry = addInterval(entryWith())
    expect(entry.intervals[2]).toEqual({ durationMinutes: 10, values: { speed: 11, incline: 3 }, done: false })
    expect(entry.durationMinutes).toBe(25)
  })

  it('modifie et retire un palier en gardant la durée totale juste', () => {
    expect(updateInterval(entryWith(), 0, { durationMinutes: 7.5 }).durationMinutes).toBe(17.5)
    expect(removeInterval(entryWith(), 0).durationMinutes).toBe(10)
  })

  it('est fait quand tous ses paliers sont cochés', () => {
    const entry = entryWith()
    expect(isEntryComplete(entry)).toBe(false)
    expect(isEntryComplete(updateInterval(updateInterval(entry, 0, { done: true }), 1, { done: true }))).toBe(true)
  })

  it('résume la durée totale et le nombre de paliers', () => {
    expect(describePerformance({ ...entryWith(), distanceKm: 2.5 })).toBe('15 min · 2,5 km · 2 paliers')
  })
})

describe('réglages des paliers', () => {
  it('ajoute les réglages de la fiche à ceux repris de la dernière fois', () => {
    const previous = entryWith([createInterval(5, { cadence: 160 })])
    const entry = createEntry(treadmill, treadmill.defaults, previous)
    expect(entry.intervals[0].values).toEqual({ speed: 0, incline: 0, cadence: 160 })
    expect(settingsUsedIn(entry.intervals)).toEqual(['speed', 'incline', 'cadence'])
  })

  it('ajoute un réglage à tous les paliers, à 0, sans toucher aux autres', () => {
    const entry = withSettings(entryWith(), ['speed', 'incline', 'level'])
    expect(entry.intervals.map((interval) => interval.values)).toEqual([
      { speed: 8, incline: 1, level: 0 },
      { speed: 11, incline: 3, level: 0 },
    ])
  })

  it('retire un réglage de tous les paliers', () => {
    const entry = withSettings(entryWith(), ['speed'])
    expect(entry.intervals.map((interval) => interval.values)).toEqual([{ speed: 8 }, { speed: 11 }])
    expect(entry.durationMinutes).toBe(15)
  })

  it('permet d’ajouter des réglages à un exercice qui n’en avait pas', () => {
    const bike = { ...createExercise('cardio'), id: 'velo' }
    const entry = createEntry(bike, bike.defaults, null)
    expect(settingsUsedIn(entry.intervals)).toEqual([])
    expect(settingsUsedIn(withSettings(entry, ['cadence']).intervals)).toEqual(['cadence'])
  })

  it('ne garde que les réglages connus, dans l’ordre', () => {
    expect(normalizeCardioSettings(['level', 'toString', 'speed'])).toEqual(['speed', 'level'])
    expect(normalizeCardioSettings('speed')).toEqual([])
  })
})

describe('paliers dans le gist', () => {
  it('relit les paliers et recalcule la durée totale', () => {
    const profile = normalizeProfile({
      id: 'p',
      name: 'Alex',
      exercises: [{ id: 'tapis', name: 'Tapis', category: 'cardio', settings: ['incline', 'speed'] }],
      sessions: [
        {
          id: 's',
          date: '2026-11-20',
          entries: [
            {
              id: 'e',
              category: 'cardio',
              durationMinutes: 99,
              intervals: [
                { durationMinutes: 5, values: { speed: 8, bogus: 3 }, done: true },
                { durationMinutes: 10, values: { speed: '11' } },
              ],
            },
          ],
        },
      ],
    })
    expect(profile?.exercises[0].settings).toEqual(['speed', 'incline'])
    const entry = profile?.sessions[0].entries[0]
    expect(entry?.intervals).toEqual([
      { durationMinutes: 5, values: { speed: 8 }, done: true },
      { durationMinutes: 10, values: { speed: 11 }, done: false },
    ])
    expect(entry?.durationMinutes).toBe(15)
  })
})

describe('brouillon de séance à l’ancien format', () => {
  it('reçoit ses paliers à la relecture', () => {
    const draft = normalizeSession({
      id: 's',
      date: '2026-11-25',
      entries: [{ id: 'e', category: 'cardio', durationMinutes: 12, done: false }],
    })
    expect(draft.entries[0].intervals).toEqual([{ durationMinutes: 12, values: {}, done: false }])
  })
})

describe('paliers par défaut de la fiche', () => {
  const program = withTargetIntervals(treadmill.defaults, [createInterval(5, { speed: 8, incline: 1 }), createInterval(10, { speed: 11, incline: 3 })])
  const withProgram: Exercise = { ...treadmill, defaults: program }

  it('part d’un palier unique à la durée de l’objectif quand la fiche n’en a pas', () => {
    expect(targetIntervals(treadmill.defaults)).toEqual([{ durationMinutes: 20, values: {}, done: false }])
  })

  it('garde la durée totale de l’objectif juste', () => {
    expect(program.durationMinutes).toBe(15)
    expect(describeTargets(program, 'cardio')).toBe('15 min · 2 paliers')
  })

  it('sert de départ à la première séance', () => {
    const entry = createEntry(withProgram, withProgram.defaults, null)
    expect(entry.intervals.map((interval) => interval.values)).toEqual([{ speed: 8, incline: 1 }, { speed: 11, incline: 3 }])
    expect(entry.durationMinutes).toBe(15)
  })

  it('laisse la dernière séance primer sur la fiche', () => {
    const previous = entryWith([createInterval(30, { speed: 12, incline: 0 })])
    expect(createEntry(withProgram, withProgram.defaults, previous).intervals).toEqual([
      { durationMinutes: 30, values: { speed: 12, incline: 0 }, done: false },
    ])
  })

  it('ajoute ou retire un réglage sur tous les paliers de la fiche', () => {
    const changed = changeExerciseSettings(withProgram, ['speed', 'level'])
    expect(changed.settings).toEqual(['speed', 'level'])
    expect(changed.defaults.intervals?.map((interval) => interval.values)).toEqual([
      { speed: 8, level: 0 },
      { speed: 11, level: 0 },
    ])
  })

  it('relit les paliers de la fiche depuis le gist', () => {
    const profile = normalizeProfile({
      id: 'p',
      name: 'Alex',
      exercises: [{ id: 'tapis', category: 'cardio', defaults: { durationMinutes: 1, intervals: [{ durationMinutes: 5, values: { speed: 8 } }] } }],
    })
    expect(profile?.exercises[0].defaults.intervals).toEqual([{ durationMinutes: 5, values: { speed: 8 }, done: false }])
    expect(profile?.exercises[0].defaults.durationMinutes).toBe(5)
  })
})
