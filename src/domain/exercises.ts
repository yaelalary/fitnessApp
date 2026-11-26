import type { BrandId, CategoryId, Exercise, ExerciseTargets, SetTarget } from './types'
import { CATEGORIES, categoryOf, formatReps, type CategoryConfig } from './categories'
import { hasIdenticalSets, targetSets } from './setTargets'
import { BRANDS, findMachine, type CatalogEntry } from './machines'
import { createId } from './ids'
import { describeMuscles } from './muscles'
import { searchableText } from './text'
import { formatDuration, formatRest } from './dates'
import { countLabel, formatNumber } from './numbers'
import { applySettings, targetIntervals, withTargetIntervals } from './intervals'
import type { CardioSettingId } from './cardioSettings'
import { nonNegative, requiredText, type ValidationErrors } from './validation'

export type ExerciseField = 'name' | 'sets' | 'reps' | 'weightKg' | 'restSeconds' | 'durationMinutes'

export function createExercise(category: CategoryId = 'strength'): Exercise {
  return {
    id: createId(),
    name: '',
    category,
    brand: null,
    machine: '',
    muscles: [],
    settings: [],
    notes: '',
    image: null,
    defaults: { ...CATEGORIES[category].defaults },
  }
}

export function changeExerciseSettings(exercise: Exercise, settings: CardioSettingId[]): Exercise {
  return { ...exercise, settings, defaults: withTargetIntervals(exercise.defaults, applySettings(targetIntervals(exercise.defaults), settings)) }
}

export function changeExerciseCategory(exercise: Exercise, category: CategoryId): Exercise {
  if (exercise.category === category) return exercise
  return { ...exercise, category, defaults: { ...CATEGORIES[category].defaults } }
}

export function changeExerciseBrand(exercise: Exercise, brand: BrandId | null): Exercise {
  const belongsToAnotherBrand = findMachine(null, exercise.machine) !== null && findMachine(brand, exercise.machine) === null
  return { ...exercise, brand, machine: belongsToAnotherBrand ? '' : exercise.machine }
}

export function selectCatalogMachine(exercise: Exercise, entry: CatalogEntry): Exercise {
  return { ...exercise, brand: entry.brand, machine: entry.name }
}

export function validateExercise(exercise: Exercise): ValidationErrors<ExerciseField> {
  const config = categoryOf(exercise.category)
  const errors: ValidationErrors<ExerciseField> = {
    name: requiredText(exercise.name, "Donne un nom à l'exercice."),
  }
  if (config.tracking === 'sets') {
    const sets = targetSets(exercise.defaults)
    errors.sets = sets.length < 1 ? config.setNoun.atLeastOne : undefined
    errors.reps = !config.repsOptional && sets.some((set) => set.reps < 1) ? 'Au moins une répétition.' : undefined
    errors.weightKg = sets.some((set) => set.weightKg < 0) ? 'La charge ne peut pas être négative.' : undefined
    errors.restSeconds = nonNegative(exercise.defaults.restSeconds, 'La récupération ne peut pas être négative.')
  } else {
    errors.durationMinutes = nonNegative(exercise.defaults.durationMinutes, 'La durée ne peut pas être négative.')
  }
  return errors
}

export function describeTargets(targets: ExerciseTargets, category: CategoryId): string {
  const config = categoryOf(category)
  if (config.tracking === 'duration') {
    const steps = targets.intervals?.length ?? 0
    const duration = formatDuration(targets.durationMinutes) || 'Durée libre'
    return steps > 1 ? `${duration} · ${countLabel(steps, 'palier')}` : duration
  }
  const parts = [describeTargetSets(targetSets(targets), config)]
  if (config.usesRest && targets.restSeconds > 0) parts.push(`récup ${formatRest(targets.restSeconds)}`)
  return parts.join(' · ')
}

function describeSet(set: SetTarget, config: CategoryConfig): string {
  const reps = set.reps > 0 ? formatReps(config, set.reps) : ''
  if (!config.usesWeight || set.weightKg <= 0) return reps
  return reps ? `${reps} × ${formatNumber(set.weightKg)} kg` : `${formatNumber(set.weightKg)} kg`
}

function describeTargetSets(sets: readonly SetTarget[], config: CategoryConfig): string {
  const noun = countLabel(sets.length, config.setNoun.singular, config.setNoun.plural)
  if (sets.length === 0) return noun
  if (!hasIdenticalSets(sets)) return sets.map((set) => describeSet(set, config)).join(', ')
  const [first] = sets
  if (first.reps <= 0) return [noun, config.usesWeight && first.weightKg > 0 ? `${formatNumber(first.weightKg)} kg` : ''].filter(Boolean).join(' · ')
  const count = `${sets.length} × ${formatReps(config, first.reps)}`
  return config.usesWeight && first.weightKg > 0 ? `${count} · ${formatNumber(first.weightKg)} kg` : count
}

export function describeEquipment(exercise: Exercise): string {
  const parts = [exercise.brand ? BRANDS[exercise.brand].label : '', exercise.machine, describeMuscles(exercise.muscles)]
  return parts.filter(Boolean).join(' · ')
}

export function sortExercises(exercises: readonly Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export function filterExercises(exercises: readonly Exercise[], category: CategoryId | null, query: string): Exercise[] {
  const needle = searchableText(query)
  return sortExercises(exercises).filter((exercise) => {
    if (category && exercise.category !== category) return false
    if (!needle) return true
    const haystack = searchableText(`${exercise.name} ${exercise.machine} ${describeMuscles(exercise.muscles)}`)
    return haystack.includes(needle)
  })
}
