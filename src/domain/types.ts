export type CategoryId = 'warmup' | 'strength' | 'cardio' | 'stretching'

export type BrandId = 'technogym' | 'hammer-strength' | 'free-weights' | 'other'

export interface ExerciseTargets {
  sets: number
  reps: number
  weightKg: number
  restSeconds: number
  durationMinutes: number
}

export interface Exercise {
  id: string
  name: string
  category: CategoryId
  brand: BrandId | null
  machine: string
  muscles: string[]
  notes: string
  image: string | null
  defaults: ExerciseTargets
}

export interface RoutineItem {
  id: string
  exerciseId: string
  targets: ExerciseTargets
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

export interface SessionEntry {
  id: string
  exerciseId: string
  exerciseName: string
  category: CategoryId
  restSeconds: number
  sets: SetLog[]
  durationMinutes: number
  distanceKm: number
  notes: string
  done: boolean
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
