import type { CardioSettingId } from './cardioSettings'

export type CategoryId = 'warmup' | 'strength' | 'cardio' | 'stretching'

export type BrandId = 'technogym' | 'hammer-strength' | 'free-weights' | 'other'

export interface ExerciseTargets {
  sets: number
  reps: number
  weightKg: number
  restSeconds: number
  durationMinutes: number
  intervals?: Interval[]
  setTargets?: SetTarget[]
}

export interface SetTarget {
  reps: number
  weightKg: number
}

export interface Exercise {
  id: string
  name: string
  category: CategoryId
  brand: BrandId | null
  machine: string
  muscles: string[]
  settings: CardioSettingId[]
  notes: string
  image: string | null
  defaults: ExerciseTargets
}

export interface RoutineItem {
  id: string
  exerciseId: string
  targets: ExerciseTargets
  notes: string
}

export interface Routine {
  id: string
  name: string
  notes: string
  items: RoutineItem[]
}

export interface SetLog {
  reps: number
  weightKg: number
  done: boolean
}

export type IntervalValues = Partial<Record<CardioSettingId, number>>

export interface Interval {
  durationMinutes: number
  values: IntervalValues
  done: boolean
}

export interface SessionEntry {
  id: string
  exerciseId: string
  exerciseName: string
  category: CategoryId
  restSeconds: number
  sets: SetLog[]
  intervals: Interval[]
  durationMinutes: number
  distanceKm: number
  notes: string
}

export interface Session {
  id: string
  date: string
  routineId: string | null
  title: string
  notes: string
  entries: SessionEntry[]
}

export interface Profile {
  id: string
  name: string
  exercises: Exercise[]
  routines: Routine[]
  sessions: Session[]
  updatedAt: string
}

export type ImageStore = Record<string, string>

export interface WorkoutSnapshot {
  profiles: Profile[]
  images: ImageStore
}

export type FileChanges = Record<string, string | null>
