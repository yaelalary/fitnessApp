import type { SetLog } from './types'
import { roundTo } from './numbers'

export type MetricId =
  | 'maxWeight'
  | 'estimatedOneRepMax'
  | 'volume'
  | 'totalReps'
  | 'bestSetReps'
  | 'totalHold'
  | 'duration'
  | 'distance'
  | 'speed'

export interface PerformanceSample {
  sets: SetLog[]
  durationMinutes: number
  distanceKm: number
}

export interface MetricDefinition {
  id: MetricId
  label: string
  unit: string
  compute: (sample: PerformanceSample) => number | null
}

function workingSets(sample: PerformanceSample): SetLog[] {
  return sample.sets.filter((set) => set.reps > 0)
}

function maxOrNull(values: number[]): number | null {
  const positive = values.filter((value) => value > 0)
  return positive.length > 0 ? Math.max(...positive) : null
}

function sumOrNull(values: number[]): number | null {
  const total = values.reduce((sum, value) => sum + value, 0)
  return total > 0 ? total : null
}

export function epleyOneRepMax(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30)
}

export const METRICS: Record<MetricId, MetricDefinition> = {
  maxWeight: {
    id: 'maxWeight',
    label: 'Charge max',
    unit: 'kg',
    compute: (sample) => maxOrNull(workingSets(sample).map((set) => set.weightKg)),
  },
  estimatedOneRepMax: {
    id: 'estimatedOneRepMax',
    label: '1RM estimé',
    unit: 'kg',
    compute: (sample) => {
      const best = maxOrNull(workingSets(sample).map((set) => epleyOneRepMax(set.weightKg, set.reps)))
      return best === null ? null : roundTo(best, 1)
    },
  },
  volume: {
    id: 'volume',
    label: 'Volume',
    unit: 'kg',
    compute: (sample) => sumOrNull(workingSets(sample).map((set) => set.reps * set.weightKg)),
  },
  totalReps: {
    id: 'totalReps',
    label: 'Répétitions totales',
    unit: 'reps',
    compute: (sample) => sumOrNull(workingSets(sample).map((set) => set.reps)),
  },
  bestSetReps: {
    id: 'bestSetReps',
    label: 'Meilleure série (reps)',
    unit: 'reps',
    compute: (sample) => maxOrNull(workingSets(sample).map((set) => set.reps)),
  },
  totalHold: {
    id: 'totalHold',
    label: 'Temps de maintien total',
    unit: 's',
    compute: (sample) => sumOrNull(workingSets(sample).map((set) => set.reps)),
  },
  duration: {
    id: 'duration',
    label: 'Durée',
    unit: 'min',
    compute: (sample) => (sample.durationMinutes > 0 ? sample.durationMinutes : null),
  },
  distance: {
    id: 'distance',
    label: 'Distance',
    unit: 'km',
    compute: (sample) => (sample.distanceKm > 0 ? sample.distanceKm : null),
  },
  speed: {
    id: 'speed',
    label: 'Vitesse moyenne',
    unit: 'km/h',
    compute: (sample) =>
      sample.distanceKm > 0 && sample.durationMinutes > 0
        ? roundTo(sample.distanceKm / (sample.durationMinutes / 60), 1)
        : null,
  },
}
