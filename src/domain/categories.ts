import type { CategoryId, ExerciseTargets } from './types'
import type { MetricId } from './metrics'

export type TrackingMode = 'sets' | 'duration'

export interface CategoryConfig {
  id: CategoryId
  label: string
  pluralLabel: string
  tracking: TrackingMode
  repsLabel: string
  repsUnit: string
  usesWeight: boolean
  usesRest: boolean
  usesDistance: boolean
  usesMachine: boolean
  metrics: MetricId[]
  defaults: ExerciseTargets
}

export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  warmup: {
    id: 'warmup',
    label: 'Échauffement',
    pluralLabel: 'Échauffements',
    tracking: 'duration',
    repsLabel: 'Répétitions',
    repsUnit: 'reps',
    usesWeight: false,
    usesRest: false,
    usesDistance: false,
    usesMachine: true,
    metrics: ['duration'],
    defaults: { sets: 0, reps: 0, weightKg: 0, restSeconds: 0, durationMinutes: 10 },
  },
  strength: {
    id: 'strength',
    label: 'Musculation',
    pluralLabel: 'Musculation',
    tracking: 'sets',
    repsLabel: 'Répétitions',
    repsUnit: 'reps',
    usesWeight: true,
    usesRest: true,
    usesDistance: false,
    usesMachine: true,
    metrics: ['maxWeight', 'estimatedOneRepMax', 'volume', 'totalReps', 'bestSetReps'],
    defaults: { sets: 3, reps: 10, weightKg: 0, restSeconds: 90, durationMinutes: 0 },
  },
  cardio: {
    id: 'cardio',
    label: 'Cardio',
    pluralLabel: 'Cardio',
    tracking: 'duration',
    repsLabel: 'Répétitions',
    repsUnit: 'reps',
    usesWeight: false,
    usesRest: false,
    usesDistance: true,
    usesMachine: true,
    metrics: ['duration', 'distance', 'speed'],
    defaults: { sets: 0, reps: 0, weightKg: 0, restSeconds: 0, durationMinutes: 20 },
  },
  stretching: {
    id: 'stretching',
    label: 'Étirement',
    pluralLabel: 'Étirements',
    tracking: 'sets',
    repsLabel: 'Maintien (s)',
    repsUnit: 's',
    usesWeight: false,
    usesRest: true,
    usesDistance: false,
    usesMachine: false,
    metrics: ['totalHold'],
    defaults: { sets: 2, reps: 30, weightKg: 0, restSeconds: 15, durationMinutes: 0 },
  },
}

export const WEIGHT_STEP_KG = 2.5
export const REST_STEP_SECONDS = 15

export const CATEGORY_ORDER: CategoryId[] = ['warmup', 'strength', 'cardio', 'stretching']

export function categoryOf(id: CategoryId): CategoryConfig {
  return CATEGORIES[id]
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && Object.hasOwn(CATEGORIES, value)
}
