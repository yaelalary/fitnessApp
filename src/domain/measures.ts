import type { Measure, MeasureEntry } from './types'
import type { ProgressPoint } from './stats'
import { createId } from './ids'
import { requiredText, type ValidationErrors } from './validation'
import { searchableText } from './text'

export interface MeasureSuggestion {
  name: string
  unit: string
}

export const MEASURE_SUGGESTIONS: MeasureSuggestion[] = [
  { name: 'Poids', unit: 'kg' },
  { name: 'Tour de taille', unit: 'cm' },
  { name: 'Tour de hanches', unit: 'cm' },
  { name: 'Tour de poitrine', unit: 'cm' },
  { name: 'Tour de bras', unit: 'cm' },
  { name: 'Tour de cuisse', unit: 'cm' },
  { name: 'Masse grasse', unit: '%' },
]

export const MEASURE_VALUE = { step: 0.1, max: 1000 } as const

export type MeasureField = 'name'

export function createMeasure(name = '', unit = ''): Measure {
  return { id: createId(), name, unit, entries: [] }
}

function sameName(a: string, b: string): boolean {
  return searchableText(a) === searchableText(b)
}

export function validateMeasure(measure: Measure, others: readonly Measure[]): ValidationErrors<MeasureField> {
  const missing = requiredText(measure.name, 'Donne un nom à la mesure.')
  if (missing) return { name: missing }
  const taken = others.some((other) => other.id !== measure.id && sameName(other.name, measure.name))
  return { name: taken ? 'Cette mesure existe déjà.' : undefined }
}

export function availableSuggestions(measures: readonly Measure[]): MeasureSuggestion[] {
  return MEASURE_SUGGESTIONS.filter((suggestion) => !measures.some((measure) => sameName(measure.name, suggestion.name)))
}

function sortEntries(entries: readonly MeasureEntry[]): MeasureEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
}

export function addMeasureEntry(measure: Measure, date: string, value: number): Measure {
  const others = measure.entries.filter((entry) => entry.date !== date)
  return { ...measure, entries: sortEntries([...others, { id: createId(), date, value }]) }
}

export function removeMeasureEntry(measure: Measure, entryId: string): Measure {
  return { ...measure, entries: measure.entries.filter((entry) => entry.id !== entryId) }
}

export function latestValue(measure: Measure): number | null {
  return sortEntries(measure.entries).at(-1)?.value ?? null
}

export function measurePoints(measure: Measure): ProgressPoint[] {
  return sortEntries(measure.entries).map((entry) => ({ id: entry.id, date: entry.date, value: entry.value }))
}

export function describeMeasure(measure: Measure): string {
  return measure.unit ? `${measure.name} (${measure.unit})` : measure.name
}

export interface MeasureSummary {
  first: number
  last: number
  change: number
  count: number
}

export function summarizeMeasure(measure: Measure): MeasureSummary | null {
  const entries = sortEntries(measure.entries)
  const first = entries[0]
  const last = entries.at(-1)
  if (!first || !last) return null
  return { first: first.value, last: last.value, change: roundChange(last.value - first.value), count: entries.length }
}

function roundChange(value: number): number {
  return Math.round(value * 100) / 100
}
