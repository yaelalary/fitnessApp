import type {
  Exercise,
  ExerciseTargets,
  Profile,
  Routine,
  RoutineItem,
  Session,
  SessionEntry,
  SetLog,
} from './types'
import { isBrandId } from './machines'
import { isCategoryId } from './categories'
import { createId } from './ids'
import { toSafeNumber } from './numbers'
import { requiredText } from './validation'

type Raw = Record<string, unknown>

function asRecord(value: unknown): Raw {
  return typeof value === 'object' && value !== null ? (value as Raw) : {}
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function normalizeTargets(value: unknown): ExerciseTargets {
  const raw = asRecord(value)
  return {
    sets: toSafeNumber(raw.sets),
    reps: toSafeNumber(raw.reps),
    weightKg: toSafeNumber(raw.weightKg),
    restSeconds: toSafeNumber(raw.restSeconds),
    durationMinutes: toSafeNumber(raw.durationMinutes),
  }
}

function normalizeExercise(value: unknown): Exercise {
  const raw = asRecord(value)
  return {
    id: asString(raw.id, createId()),
    name: asString(raw.name),
    category: isCategoryId(raw.category) ? raw.category : 'strength',
    brand: isBrandId(raw.brand) ? raw.brand : null,
    machine: asString(raw.machine),
    muscleGroup: asString(raw.muscleGroup),
    notes: asString(raw.notes),
    image: typeof raw.image === 'string' ? raw.image : null,
    defaults: normalizeTargets(raw.defaults),
  }
}

function normalizeRoutineItem(value: unknown): RoutineItem {
  const raw = asRecord(value)
  return { id: asString(raw.id, createId()), exerciseId: asString(raw.exerciseId), targets: normalizeTargets(raw.targets) }
}

function normalizeRoutine(value: unknown): Routine {
  const raw = asRecord(value)
  return {
    id: asString(raw.id, createId()),
    name: asString(raw.name),
    notes: asString(raw.notes),
    items: asArray(raw.items).map(normalizeRoutineItem),
  }
}

function normalizeSet(value: unknown): SetLog {
  const raw = asRecord(value)
  return { reps: toSafeNumber(raw.reps), weightKg: toSafeNumber(raw.weightKg), done: raw.done === true }
}

function normalizeEntry(value: unknown): SessionEntry {
  const raw = asRecord(value)
  return {
    id: asString(raw.id, createId()),
    exerciseId: asString(raw.exerciseId),
    exerciseName: asString(raw.exerciseName),
    category: isCategoryId(raw.category) ? raw.category : 'strength',
    restSeconds: toSafeNumber(raw.restSeconds),
    sets: asArray(raw.sets).map(normalizeSet),
    durationMinutes: toSafeNumber(raw.durationMinutes),
    distanceKm: toSafeNumber(raw.distanceKm),
    notes: asString(raw.notes),
    done: raw.done === true,
  }
}

function normalizeSession(value: unknown): Session {
  const raw = asRecord(value)
  return {
    id: asString(raw.id, createId()),
    date: asString(raw.date),
    routineId: typeof raw.routineId === 'string' ? raw.routineId : null,
    title: asString(raw.title, 'Séance'),
    notes: asString(raw.notes),
    entries: asArray(raw.entries).map(normalizeEntry),
  }
}

export function normalizeProfile(value: unknown): Profile | null {
  const raw = asRecord(value)
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null
  return {
    id: raw.id,
    name: raw.name,
    exercises: asArray(raw.exercises).map(normalizeExercise),
    routines: asArray(raw.routines).map(normalizeRoutine),
    sessions: asArray(raw.sessions).map(normalizeSession).filter((session) => session.date !== ''),
    updatedAt: asString(raw.updatedAt),
  }
}

export function createProfile(name: string, now: Date = new Date()): Profile {
  return { id: createId(), name: name.trim(), exercises: [], routines: [], sessions: [], updatedAt: now.toISOString() }
}

export function touchProfile(profile: Profile, now: Date = new Date()): Profile {
  return { ...profile, updatedAt: now.toISOString() }
}

export function validateProfileName(name: string, others: readonly Profile[]): string | undefined {
  const missing = requiredText(name, 'Donne un prénom au profil.')
  if (missing) return missing
  const taken = others.some((profile) => profile.name.trim().toLocaleLowerCase('fr') === name.trim().toLocaleLowerCase('fr'))
  return taken ? 'Ce prénom est déjà utilisé.' : undefined
}
