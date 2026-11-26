import { describe, expect, it } from 'vitest'
import type { Measure } from './types'
import {
  addMeasureEntry,
  availableSuggestions,
  createMeasure,
  latestValue,
  measurePoints,
  removeMeasureEntry,
  summarizeMeasure,
  validateMeasure,
} from './measures'
import { normalizeProfile } from './profiles'

function waistWith(...values: Array<[string, number]>): Measure {
  return values.reduce((measure, [date, value]) => addMeasureEntry(measure, date, value), createMeasure('Tour de taille', 'cm'))
}

describe('mesures personnalisées', () => {
  it('range les valeurs par date, quel que soit l’ordre de saisie', () => {
    const waist = waistWith(['2026-11-20', 82], ['2026-11-01', 85], ['2026-11-10', 84])
    expect(measurePoints(waist).map((point) => point.value)).toEqual([85, 84, 82])
    expect(latestValue(waist)).toBe(82)
  })

  it('remplace la valeur déjà saisie le même jour', () => {
    const waist = waistWith(['2026-11-20', 82], ['2026-11-20', 81.5])
    expect(measurePoints(waist).map((point) => point.value)).toEqual([81.5])
  })

  it('résume l’évolution depuis la première valeur', () => {
    const waist = waistWith(['2026-11-01', 85], ['2026-11-20', 82.4])
    expect(summarizeMeasure(waist)).toEqual({ first: 85, last: 82.4, change: -2.6, count: 2 })
    expect(summarizeMeasure(createMeasure('Poids', 'kg'))).toBeNull()
  })

  it('retire une valeur', () => {
    const waist = waistWith(['2026-11-01', 85], ['2026-11-20', 82])
    const [first] = waist.entries
    expect(removeMeasureEntry(waist, first.id).entries.map((entry) => entry.value)).toEqual([82])
  })

  it('exige un nom unique', () => {
    const waist = createMeasure('Tour de taille', 'cm')
    expect(validateMeasure(createMeasure('', 'cm'), []).name).toBe('Donne un nom à la mesure.')
    expect(validateMeasure(createMeasure('tour de TAILLE', 'cm'), [waist]).name).toBe('Cette mesure existe déjà.')
    expect(validateMeasure(createMeasure('Tour de bras', 'cm'), [waist]).name).toBeUndefined()
  })

  it('ne propose plus une suggestion déjà créée', () => {
    const names = availableSuggestions([createMeasure('Poids', 'kg')]).map((suggestion) => suggestion.name)
    expect(names).not.toContain('Poids')
    expect(names).toContain('Tour de taille')
  })

  it('relit les mesures du gist, et un ancien profil sans mesures', () => {
    const waist = waistWith(['2026-11-01', 85])
    const stored = JSON.parse(JSON.stringify({ id: 'p', name: 'Moi', exercises: [], routines: [], sessions: [], measures: [waist] }))
    expect(normalizeProfile(stored)?.measures).toEqual([waist])
    expect(normalizeProfile({ id: 'p', name: 'Moi' })?.measures).toEqual([])
  })
})
