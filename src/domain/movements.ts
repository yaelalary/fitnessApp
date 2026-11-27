import type { BrandId, CategoryId } from './types'
import { searchableText } from './text'

export interface Movement {
  id: string
  name: string
  category: string
  equipment: string
  muscles: string[]
  instructions: string[]
  images: string[]
}

export const MOVEMENT_IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
export const MOVEMENT_SOURCE_URL = 'https://github.com/yuhonas/free-exercise-db'

export const MOVEMENT_EQUIPMENT: Record<string, string> = {
  barbell: 'Barre',
  dumbbell: 'Haltères',
  cable: 'Poulie',
  machine: 'Machine',
  'body only': 'Poids du corps',
  kettlebells: 'Kettlebell',
  bands: 'Élastique',
  'medicine ball': 'Médecine-ball',
  'exercise ball': 'Swiss ball',
  'foam roll': 'Rouleau',
  'e-z curl bar': 'Barre EZ',
  other: 'Autre',
}

export const MOVEMENT_MUSCLES: Record<string, string> = {
  abdominals: 'abdominaux',
  abductors: 'abducteurs',
  adductors: 'adducteurs',
  biceps: 'biceps',
  calves: 'mollets',
  chest: 'pectoraux',
  forearms: 'avant-bras',
  glutes: 'fessiers',
  hamstrings: 'ischio-jambiers',
  lats: 'grand dorsal',
  'lower back': 'lombaires',
  'middle back': 'milieu du dos',
  neck: 'cou',
  quadriceps: 'quadriceps',
  shoulders: 'épaules',
  traps: 'trapèzes',
  triceps: 'triceps',
}

const IGNORED_WORDS = new Set(['the', 'a', 'with', 'and', 'on', 'of', 'to', 'de', 'du', 'la', 'le', 'les', 'des', 'en', 'au', 'aux'])
const RESULT_LIMIT = 60

export function movementImageUrls(movement: Movement): string[] {
  return movement.images.map((path) => `${MOVEMENT_IMAGE_BASE}${path}`)
}

export function equipmentLabel(equipment: string): string {
  return MOVEMENT_EQUIPMENT[equipment] ?? MOVEMENT_EQUIPMENT.other
}

export function describeMovement(movement: Movement): string {
  const muscles = movement.muscles.map((muscle) => MOVEMENT_MUSCLES[muscle] ?? muscle).join(', ')
  return [equipmentLabel(movement.equipment), muscles].filter(Boolean).join(' · ')
}

function words(text: string): string[] {
  return searchableText(text)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !IGNORED_WORDS.has(word))
}

function score(movement: Movement, queryWords: readonly string[]): number {
  const nameWords = words(movement.name)
  const matched = queryWords.filter((word) => nameWords.some((candidate) => candidate.startsWith(word)))
  if (matched.length === 0) return 0
  const coverage = matched.length / nameWords.length
  return matched.length * 10 + coverage
}

export function searchMovements(movements: readonly Movement[], query: string, equipment: string | null): Movement[] {
  const filtered = equipment ? movements.filter((movement) => movement.equipment === equipment) : movements
  const queryWords = words(query)
  if (queryWords.length === 0) return filtered.slice(0, RESULT_LIMIT)
  return filtered
    .map((movement) => ({ movement, score: score(movement, queryWords) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.movement.name.localeCompare(b.movement.name, 'en'))
    .slice(0, RESULT_LIMIT)
    .map((result) => result.movement)
}

export const NO_MOVEMENT = 'none'

export interface MovementSubject {
  name: string
  machine: string
  category: CategoryId
  brand: BrandId | null
  movementId: string | null
}

export type MovementOrigin = 'chosen' | 'automatic' | 'none'

const SEARCH_TERMS: Array<[string, string]> = [
  ['iso lateral', ''],
  ['pectoral', 'butterfly'],
  ['delts machine', 'lateral raise'],
  ['skillrow', 'rowing stationary'],
  ['skillmill', 'running treadmill'],
  ['run', 'running treadmill'],
  ['arm extension', 'triceps extension'],
  ['arm curl', 'bicep curl'],
  ['vertical traction', 'lat pulldown'],
  ['low row', 'seated cable rows'],
  ['glute drive', 'hip thrust'],
  ['lower back', 'hyperextensions'],
  ['multi hip', 'hip extension'],
  ['etirement quadriceps', 'quad stretch'],
  ['souleve de terre', 'deadlift'],
  ['developpe couche', 'bench press'],
  ['developpe incline', 'incline bench press'],
  ['developpe militaire', 'military press'],
  ['developpe epaules', 'shoulder press'],
  ['developpe', 'press'],
  ['couche', 'bench'],
  ['tirage vertical', 'lat pulldown'],
  ['tirage horizontal', 'seated row'],
  ['tirage poitrine', 'lat pulldown'],
  ['tirage', 'row'],
  ['rowing', 'row'],
  ['rameur', 'rowing stationary'],
  ['presse a cuisses', 'leg press'],
  ['presse', 'press'],
  ['extension des jambes', 'leg extensions'],
  ['flexion des jambes', 'leg curl'],
  ['mollets', 'calf raise'],
  ['fentes', 'lunge'],
  ['pompes', 'pushups'],
  ['tractions', 'pullups'],
  ['gainage', 'plank'],
  ['abdos', 'crunch'],
  ['elevations laterales', 'lateral raise'],
  ['elevation laterale', 'lateral raise'],
  ['oiseau', 'reverse flyes'],
  ['ecarte', 'flyes'],
  ['papillon', 'butterfly'],
  ['epaules', 'shoulder press'],
  ['pectoraux', 'chest press'],
  ['ischio', 'hamstring'],
  ['fessiers', 'glute'],
  ['adducteurs', 'adductor'],
  ['abducteurs', 'abductor'],
  ['halteres', 'dumbbell'],
  ['haltere', 'dumbbell'],
  ['barre', 'barbell'],
  ['poulie', 'cable'],
  ['velo elliptique', 'elliptical trainer'],
  ['elliptique', 'elliptical trainer'],
  ['velo', 'bicycling stationary'],
  ['tapis de course', 'running treadmill'],
  ['tapis', 'treadmill'],
  ['course', 'running'],
  ['marche', 'walking'],
  ['etirement', 'stretch'],
]

const CATEGORY_MATCHES: Record<CategoryId, string[]> = {
  warmup: ['cardio', 'stretching', 'strength'],
  strength: ['strength', 'powerlifting', 'olympic weightlifting'],
  cardio: ['cardio'],
  stretching: ['stretching'],
}

const BRAND_EQUIPMENT: Partial<Record<BrandId, string[]>> = {
  technogym: ['machine', 'cable'],
  'hammer-strength': ['machine'],
}

const MIN_AUTOMATIC_COVERAGE = 0.5

function translateTerms(text: string): string {
  let translated = ` ${searchableText(text).replace(/[^a-z0-9]+/g, ' ')} `
  for (const [term, replacement] of SEARCH_TERMS) translated = translated.replaceAll(` ${term} `, ` ${replacement} `)
  return translated
}

const NUMBER = /^\d+$/

const GENERIC_WORDS = new Set([
  'adjustable', 'arm', 'back', 'bench', 'cable', 'combo', 'decline', 'elite', 'front', 'high', 'incline', 'lever', 'lower',
  'machine', 'multi', 'olympic', 'one', 'power', 'pro', 'rack', 'rear', 'seated', 'select', 'single', 'standing', 'station',
  'upper', 'vertical', 'lying',
])

function subjectWords(subject: MovementSubject): string[] {
  return [...new Set([...words(translateTerms(subject.machine)), ...words(translateTerms(subject.name))])].filter((word) => !NUMBER.test(word))
}

interface Candidate {
  movement: Movement
  matched: number
  specific: boolean
  coverage: number
  bonus: number
}

const MAX_SUFFIX_LENGTH = 2

function sameWord(nameWord: string, queryWord: string): boolean {
  const [shorter, longer] = nameWord.length <= queryWord.length ? [nameWord, queryWord] : [queryWord, nameWord]
  return longer.startsWith(shorter) && longer.length - shorter.length <= MAX_SUFFIX_LENGTH
}

function rankCandidate(movement: Movement, queryWords: readonly string[], subject: MovementSubject): Candidate {
  const nameWords = words(movement.name)
  const matchedWords = queryWords.filter((query) => nameWords.some((word) => sameWord(word, query)))
  const matched = matchedWords.length
  const specific = matchedWords.some((word) => !GENERIC_WORDS.has(word))
  const coveredNameWords = nameWords.filter((word) => queryWords.some((query) => sameWord(word, query))).length
  const categoryBonus = CATEGORY_MATCHES[subject.category].includes(movement.category) ? 1 : 0
  const equipmentBonus = subject.brand && BRAND_EQUIPMENT[subject.brand]?.includes(movement.equipment) ? 1 : 0
  const coverage = nameWords.length > 0 ? coveredNameWords / nameWords.length : 0
  return { movement, matched, specific, coverage, bonus: categoryBonus + equipmentBonus }
}

function compareCandidates(a: Candidate, b: Candidate): number {
  return b.matched - a.matched || b.coverage - a.coverage || b.bonus - a.bonus || a.movement.name.length - b.movement.name.length
}

export function automaticMovement(movements: readonly Movement[], subject: MovementSubject): Movement | null {
  const queryWords = subjectWords(subject)
  if (queryWords.length === 0) return null
  const [best] = movements
    .map((movement) => rankCandidate(movement, queryWords, subject))
    .filter((candidate) => candidate.specific && candidate.coverage >= MIN_AUTOMATIC_COVERAGE)
    .sort(compareCandidates)
  return best?.movement ?? null
}

export function movementOrigin(subject: MovementSubject): MovementOrigin {
  if (subject.movementId === NO_MOVEMENT) return 'none'
  return subject.movementId ? 'chosen' : 'automatic'
}

export function resolveMovement(movements: readonly Movement[], subject: MovementSubject): Movement | null {
  const origin = movementOrigin(subject)
  if (origin === 'none') return null
  if (origin === 'chosen') return findMovement(movements, subject.movementId)
  return automaticMovement(movements, subject)
}

export function movementSearchQuery(subject: MovementSubject): string {
  return subjectWords(subject).join(' ')
}

export function findMovement(movements: readonly Movement[], id: string | null): Movement | null {
  if (!id) return null
  return movements.find((movement) => movement.id === id) ?? null
}

export function movementEquipmentOptions(movements: readonly Movement[]): string[] {
  const present = new Set(movements.map((movement) => movement.equipment))
  return Object.keys(MOVEMENT_EQUIPMENT).filter((equipment) => present.has(equipment))
}
