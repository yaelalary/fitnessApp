import type { ExerciseTargets, SetTarget } from './types'
import { toSafeNumber } from './numbers'

const NEW_SET: SetTarget = { reps: 10, weightKg: 0 }

function copySet(set: SetTarget): SetTarget {
  return { reps: set.reps, weightKg: set.weightKg }
}

export function targetSets(targets: ExerciseTargets): SetTarget[] {
  if (targets.setTargets && targets.setTargets.length > 0) return targets.setTargets.map(copySet)
  return Array.from({ length: targets.sets }, () => ({ reps: targets.reps, weightKg: targets.weightKg }))
}

export function withTargetSets(targets: ExerciseTargets, sets: readonly SetTarget[]): ExerciseTargets {
  const first = sets[0]
  return {
    ...targets,
    sets: sets.length,
    reps: first?.reps ?? 0,
    weightKg: first?.weightKg ?? 0,
    setTargets: sets.map(copySet),
  }
}

export function hasIdenticalSets(sets: readonly SetTarget[]): boolean {
  return sets.every((set) => set.reps === sets[0].reps && set.weightKg === sets[0].weightKg)
}

export function repeatSet(set: SetTarget | undefined, count: number): SetTarget[] {
  const model = set ?? NEW_SET
  return Array.from({ length: Math.max(1, count) }, () => copySet(model))
}

export function appendTargetSet(sets: readonly SetTarget[]): SetTarget[] {
  return [...sets.map(copySet), copySet(sets.at(-1) ?? NEW_SET)]
}

export function removeTargetSetAt(sets: readonly SetTarget[], index: number): SetTarget[] {
  return sets.filter((_, position) => position !== index).map(copySet)
}

export function patchTargetSetAt(sets: readonly SetTarget[], index: number, patch: Partial<SetTarget>): SetTarget[] {
  return sets.map((set, position) => (position === index ? { ...copySet(set), ...patch } : copySet(set)))
}

export function normalizeSetTarget(value: unknown): SetTarget {
  const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  return { reps: toSafeNumber(raw.reps), weightKg: toSafeNumber(raw.weightKg) }
}
