import type { BrandId, CategoryId, Exercise, ExerciseTargets } from './types'
import { CATEGORIES, categoryOf } from './categories'
import { BRANDS, findMachine, type CatalogEntry } from './machines'
import { createId } from './ids'
import { describeMuscles } from './muscles'
import { searchableText } from './text'
import { formatDuration, formatRest } from './dates'
import { formatNumber } from './numbers'
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
    notes: '',
    image: null,
    defaults: { ...CATEGORIES[category].defaults },
  }
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
    errors.sets = exercise.defaults.sets < 1 ? 'Au moins une série.' : undefined
    errors.reps = exercise.defaults.reps < 1 ? 'Au moins une répétition.' : undefined
    errors.weightKg = nonNegative(exercise.defaults.weightKg, 'La charge ne peut pas être négative.')
    errors.restSeconds = nonNegative(exercise.defaults.restSeconds, 'La récupération ne peut pas être négative.')
  } else {
    errors.durationMinutes = nonNegative(exercise.defaults.durationMinutes, 'La durée ne peut pas être négative.')
  }
  return errors
}

export function describeTargets(targets: ExerciseTargets, category: CategoryId): string {
  const config = categoryOf(category)
  if (config.tracking === 'duration') {
    return formatDuration(targets.durationMinutes) || 'Durée libre'
  }
  const parts = [`${targets.sets} × ${targets.reps}${config.repsUnit === 's' ? ' s' : ''}`]
  if (config.usesWeight && targets.weightKg > 0) parts.push(`${formatNumber(targets.weightKg)} kg`)
  if (config.usesRest && targets.restSeconds > 0) parts.push(`récup ${formatRest(targets.restSeconds)}`)
  return parts.join(' · ')
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
