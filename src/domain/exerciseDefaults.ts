import type { Exercise, ExerciseTargets, SessionEntry } from './types'
import { categoryOf } from './categories'
import { CARDIO_SETTING_ORDER } from './cardioSettings'
import { createInterval, settingsUsedIn, targetIntervals, withTargetIntervals } from './intervals'
import { targetSets, withTargetSets } from './setTargets'
import { isSameData } from './collections'

export function targetsFromEntry(entry: SessionEntry, defaults: ExerciseTargets): ExerciseTargets {
  if (categoryOf(entry.category).tracking === 'duration') {
    const intervals = entry.intervals.map((interval) => createInterval(interval.durationMinutes, interval.values))
    return intervals.length > 0 ? withTargetIntervals(defaults, intervals) : { ...defaults, durationMinutes: entry.durationMinutes }
  }
  const sets = entry.sets.map((set) => ({ reps: set.reps, weightKg: set.weightKg }))
  const withRest = { ...defaults, restSeconds: entry.restSeconds }
  return sets.length > 0 ? withTargetSets(withRest, sets) : withRest
}

function targetsSignature(targets: ExerciseTargets, exercise: Exercise): unknown {
  if (categoryOf(exercise.category).tracking === 'duration') {
    return targetIntervals(targets).map((interval) => ({ durationMinutes: interval.durationMinutes, values: interval.values }))
  }
  return { sets: targetSets(targets), restSeconds: targets.restSeconds }
}

export function hasSameTargets(exercise: Exercise, targets: ExerciseTargets): boolean {
  return isSameData(targetsSignature(exercise.defaults, exercise), targetsSignature(targets, exercise))
}

export function applyTargetsToExercise(exercise: Exercise, targets: ExerciseTargets): Exercise {
  const used = targets.intervals ? settingsUsedIn(targets.intervals) : []
  const settings = CARDIO_SETTING_ORDER.filter((id) => exercise.settings.includes(id) || used.includes(id))
  return { ...exercise, settings, defaults: targets }
}
