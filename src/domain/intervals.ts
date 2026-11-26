import type { Exercise, ExerciseTargets, Interval, IntervalValues, SessionEntry } from './types'
import { CARDIO_SETTING_ORDER, type CardioSettingId } from './cardioSettings'
import { toSafeNumber } from './numbers'

export function createInterval(durationMinutes: number, values: IntervalValues = {}): Interval {
  return { durationMinutes, values: { ...values }, done: false }
}

export function totalDuration(intervals: readonly Interval[]): number {
  return intervals.reduce((sum, interval) => sum + interval.durationMinutes, 0)
}

export function appendInterval(intervals: readonly Interval[]): Interval[] {
  const last = intervals.at(-1)
  return [...intervals, last ? createInterval(last.durationMinutes, last.values) : createInterval(0)]
}

export function removeIntervalAt(intervals: readonly Interval[], index: number): Interval[] {
  return intervals.filter((_, position) => position !== index)
}

export function patchIntervalAt(intervals: readonly Interval[], index: number, patch: Partial<Interval>): Interval[] {
  return intervals.map((interval, position) => (position === index ? { ...interval, ...patch } : interval))
}

function valuesFor(settings: readonly CardioSettingId[], source: IntervalValues): IntervalValues {
  const values: IntervalValues = {}
  for (const id of CARDIO_SETTING_ORDER) if (settings.includes(id)) values[id] = source[id] ?? 0
  return values
}

export function applySettings(intervals: readonly Interval[], settings: readonly CardioSettingId[]): Interval[] {
  return intervals.map((interval) => ({ ...interval, values: valuesFor(settings, interval.values) }))
}

export function settingsUsedIn(intervals: readonly Interval[]): CardioSettingId[] {
  const keys = new Set(intervals.flatMap((interval) => Object.keys(interval.values)))
  return CARDIO_SETTING_ORDER.filter((id) => keys.has(id))
}

export function withIntervals(entry: SessionEntry, intervals: Interval[]): SessionEntry {
  return { ...entry, intervals, durationMinutes: totalDuration(intervals) }
}

export function addInterval(entry: SessionEntry): SessionEntry {
  return withIntervals(entry, appendInterval(entry.intervals))
}

export function removeInterval(entry: SessionEntry, index: number): SessionEntry {
  return withIntervals(entry, removeIntervalAt(entry.intervals, index))
}

export function updateInterval(entry: SessionEntry, index: number, patch: Partial<Interval>): SessionEntry {
  return withIntervals(entry, patchIntervalAt(entry.intervals, index, patch))
}

export function withSettings(entry: SessionEntry, settings: readonly CardioSettingId[]): SessionEntry {
  return withIntervals(entry, applySettings(entry.intervals, settings))
}

export function targetIntervals(targets: ExerciseTargets): Interval[] {
  const stored = targets.intervals ?? []
  return stored.length > 0 ? stored : [createInterval(targets.durationMinutes)]
}

export function withTargetIntervals(targets: ExerciseTargets, intervals: Interval[]): ExerciseTargets {
  return { ...targets, intervals, durationMinutes: totalDuration(intervals) }
}

export function startingIntervals(exercise: Exercise, previous: readonly Interval[], targets: ExerciseTargets): Interval[] {
  const source = previous.length > 0 ? previous : targetIntervals(targets)
  const base = source.map((interval) => createInterval(interval.durationMinutes, interval.values))
  const used = settingsUsedIn(source)
  return applySettings(
    base,
    CARDIO_SETTING_ORDER.filter((id) => exercise.settings.includes(id) || used.includes(id)),
  )
}

function normalizeValues(value: unknown): IntervalValues {
  const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  const values: IntervalValues = {}
  for (const id of CARDIO_SETTING_ORDER) {
    if (raw[id] !== undefined) values[id] = toSafeNumber(raw[id])
  }
  return values
}

export function normalizeInterval(value: unknown): Interval {
  const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  return { durationMinutes: toSafeNumber(raw.durationMinutes), values: normalizeValues(raw.values), done: raw.done === true }
}
