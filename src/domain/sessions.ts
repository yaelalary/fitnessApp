import type { Exercise, ExerciseTargets, Routine, Session, SessionEntry, SetLog } from './types'
import type { PerformanceSample } from './metrics'
import { METRICS } from './metrics'
import { createId } from './ids'
import { todayIso } from './dates'
import { categoryOf, type TrackingMode } from './categories'
import { countLabel, formatNumber } from './numbers'

export function sortSessionsDesc(sessions: readonly Session[]): Session[] {
  return [...sessions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}

export function findLastEntry(
  sessions: readonly Session[],
  exerciseId: string,
  excludeSessionId: string | null = null,
): SessionEntry | null {
  for (const session of sortSessionsDesc(sessions)) {
    if (session.id === excludeSessionId) continue
    const entry = session.entries.find((candidate) => candidate.exerciseId === exerciseId)
    if (entry) return entry
  }
  return null
}

function setsFromTargets(targets: ExerciseTargets): SetLog[] {
  return Array.from({ length: targets.sets }, () => ({ reps: targets.reps, weightKg: targets.weightKg, done: false }))
}

function setsFromPrevious(previous: SessionEntry, targets: ExerciseTargets): SetLog[] {
  const count = Math.max(targets.sets, previous.sets.length)
  return Array.from({ length: count }, (_, index) => {
    const source = previous.sets[Math.min(index, previous.sets.length - 1)]
    return { reps: source.reps, weightKg: source.weightKg, done: false }
  })
}

export function createEntry(exercise: Exercise, targets: ExerciseTargets, previous: SessionEntry | null): SessionEntry {
  const hasPreviousSets = previous !== null && previous.sets.length > 0
  return {
    id: createId(),
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    category: exercise.category,
    restSeconds: targets.restSeconds,
    sets: hasPreviousSets ? setsFromPrevious(previous, targets) : setsFromTargets(targets),
    durationMinutes: previous?.durationMinutes || targets.durationMinutes,
    distanceKm: previous?.distanceKm ?? 0,
    notes: '',
    done: false,
  }
}

export function createEmptySession(date: string = todayIso()): Session {
  return { id: createId(), date, routineId: null, title: 'Séance libre', notes: '', entries: [] }
}

export function createSessionFromRoutine(
  routine: Routine,
  exercisesById: ReadonlyMap<string, Exercise>,
  history: readonly Session[],
  date: string = todayIso(),
): Session {
  const entries = routine.items.flatMap((item) => {
    const exercise = exercisesById.get(item.exerciseId)
    if (!exercise) return []
    return [createEntry(exercise, item.targets, findLastEntry(history, exercise.id))]
  })
  return { id: createId(), date, routineId: routine.id, title: routine.name, notes: '', entries }
}

export function addSet(entry: SessionEntry): SessionEntry {
  const last = entry.sets.at(-1)
  const next: SetLog = last ? { reps: last.reps, weightKg: last.weightKg, done: false } : { reps: 10, weightKg: 0, done: false }
  return { ...entry, sets: [...entry.sets, next] }
}

export function removeSet(entry: SessionEntry, index: number): SessionEntry {
  return { ...entry, sets: entry.sets.filter((_, position) => position !== index) }
}

export function updateSet(entry: SessionEntry, index: number, patch: Partial<SetLog>): SessionEntry {
  return { ...entry, sets: entry.sets.map((set, position) => (position === index ? { ...set, ...patch } : set)) }
}

export function entryToSample(entry: SessionEntry): PerformanceSample {
  return { sets: entry.sets, durationMinutes: entry.durationMinutes, distanceKm: entry.distanceKm }
}

export function mergeSamples(samples: readonly PerformanceSample[]): PerformanceSample {
  return {
    sets: samples.flatMap((sample) => sample.sets),
    durationMinutes: samples.reduce((sum, sample) => sum + sample.durationMinutes, 0),
    distanceKm: samples.reduce((sum, sample) => sum + sample.distanceKm, 0),
  }
}

export interface SessionSummary {
  exerciseCount: number
  setCount: number
  completedSetCount: number
  volumeKg: number
  cardioMinutes: number
}

function cardioMinutesOf(session: Session): number {
  return session.entries
    .filter((entry) => entry.category === 'cardio')
    .reduce((sum, entry) => sum + entry.durationMinutes, 0)
}

export function summarizeSession(session: Session): SessionSummary {
  const sample = mergeSamples(session.entries.map(entryToSample))
  return {
    exerciseCount: session.entries.length,
    setCount: sample.sets.length,
    completedSetCount: sample.sets.filter((set) => set.done).length,
    volumeKg: METRICS.volume.compute(sample) ?? 0,
    cardioMinutes: cardioMinutesOf(session),
  }
}

interface CompletionRule {
  isPending: (entry: SessionEntry) => boolean
  isComplete: (entry: SessionEntry) => boolean
  complete: (entry: SessionEntry) => SessionEntry
}

const COMPLETION_RULES: Record<TrackingMode, CompletionRule> = {
  sets: {
    isPending: (entry) => entry.sets.some((set) => !set.done),
    isComplete: (entry) => entry.sets.length > 0 && entry.sets.every((set) => set.done),
    complete: (entry) => ({ ...entry, sets: entry.sets.map((set) => ({ ...set, done: true })) }),
  },
  duration: {
    isPending: (entry) => !entry.done,
    isComplete: (entry) => entry.done,
    complete: (entry) => ({ ...entry, done: true }),
  },
}

function completionRuleOf(entry: SessionEntry): CompletionRule {
  return COMPLETION_RULES[categoryOf(entry.category).tracking]
}

export function isEntryComplete(entry: SessionEntry): boolean {
  return completionRuleOf(entry).isComplete(entry)
}

export function completeAllEntries(session: Session): Session {
  return { ...session, entries: session.entries.map((entry) => completionRuleOf(entry).complete(entry)) }
}

export function hasPendingEntries(session: Session): boolean {
  return session.entries.some((entry) => completionRuleOf(entry).isPending(entry))
}

export function describePerformance(entry: SessionEntry): string {
  const config = categoryOf(entry.category)
  if (config.tracking === 'duration') {
    const parts = [entry.durationMinutes > 0 ? `${formatNumber(entry.durationMinutes)} min` : '']
    if (config.usesDistance && entry.distanceKm > 0) parts.push(`${formatNumber(entry.distanceKm)} km`)
    return parts.filter(Boolean).join(' · ')
  }
  const unit = config.repsUnit === 's' ? ' s' : ''
  return entry.sets
    .filter((set) => set.reps > 0)
    .map((set) =>
      config.usesWeight && set.weightKg > 0 ? `${set.reps} × ${formatNumber(set.weightKg)} kg` : `${set.reps}${unit}`,
    )
    .join(', ')
}

export function describeSessionSummary(summary: SessionSummary): string {
  const parts = [countLabel(summary.exerciseCount, 'exercice')]
  if (summary.setCount > 0) parts.push(countLabel(summary.setCount, 'série'))
  if (summary.volumeKg > 0) parts.push(`${formatNumber(summary.volumeKg)} kg soulevés`)
  if (summary.cardioMinutes > 0) parts.push(`${formatNumber(summary.cardioMinutes)} min de cardio`)
  return parts.join(' · ')
}

export function exerciseFromEntry(entry: SessionEntry): Exercise {
  return {
    id: entry.exerciseId,
    name: entry.exerciseName || 'Exercice supprimé',
    category: entry.category,
    brand: null,
    machine: '',
    muscles: [],
    notes: '',
    image: null,
    defaults: { sets: entry.sets.length, reps: 0, weightKg: 0, restSeconds: entry.restSeconds, durationMinutes: entry.durationMinutes },
  }
}
