import { searchableText } from './text'

export interface MuscleOption {
  value: string
  label: string
}

export interface MuscleGroup {
  label: string
  options: MuscleOption[]
}

export const MUSCLE_GROUPS: readonly MuscleGroup[] = [
  {
    label: 'Pectoraux',
    options: [
      { value: 'chest-upper', label: 'Haut des pectoraux' },
      { value: 'chest', label: 'Pectoraux' },
      { value: 'chest-lower', label: 'Bas des pectoraux' },
    ],
  },
  {
    label: 'Dos',
    options: [
      { value: 'lats', label: 'Grand dorsal' },
      { value: 'upper-back', label: 'Milieu du dos' },
      { value: 'traps', label: 'Trapèzes' },
      { value: 'lower-back', label: 'Lombaires' },
    ],
  },
  {
    label: 'Épaules',
    options: [
      { value: 'front-delts', label: 'Deltoïdes antérieurs' },
      { value: 'side-delts', label: 'Deltoïdes latéraux' },
      { value: 'rear-delts', label: 'Deltoïdes postérieurs' },
      { value: 'rotator-cuff', label: 'Coiffe des rotateurs' },
    ],
  },
  {
    label: 'Bras',
    options: [
      { value: 'biceps', label: 'Biceps' },
      { value: 'triceps', label: 'Triceps' },
      { value: 'forearms', label: 'Avant-bras' },
    ],
  },
  {
    label: 'Tronc',
    options: [
      { value: 'abs', label: 'Abdominaux' },
      { value: 'obliques', label: 'Obliques' },
    ],
  },
  {
    label: 'Jambes',
    options: [
      { value: 'quads', label: 'Quadriceps' },
      { value: 'hamstrings', label: 'Ischio-jambiers' },
      { value: 'glutes', label: 'Fessiers' },
      { value: 'abductors', label: 'Abducteurs' },
      { value: 'adductors', label: 'Adducteurs' },
      { value: 'calves', label: 'Mollets' },
    ],
  },
  {
    label: 'Général',
    options: [{ value: 'full-body', label: 'Corps entier' }],
  },
]

const OTHER_GROUP_LABEL = 'Autres'
const LEGACY_SEPARATOR = ','
const LABEL_SEPARATOR = ', '

const MUSCLE_OPTIONS = MUSCLE_GROUPS.flatMap((group) => group.options)
const LABEL_BY_VALUE = new Map(MUSCLE_OPTIONS.map((option) => [option.value, option.label]))
const VALUE_BY_LABEL = new Map(MUSCLE_OPTIONS.map((option) => [searchableText(option.label), option.value]))

export function isKnownMuscle(value: string): boolean {
  return LABEL_BY_VALUE.has(value)
}

export function muscleLabel(value: string): string {
  return LABEL_BY_VALUE.get(value) ?? value
}

export function describeMuscles(muscles: readonly string[]): string {
  return muscles.map(muscleLabel).join(LABEL_SEPARATOR)
}

function muscleFromText(text: string): string {
  return VALUE_BY_LABEL.get(searchableText(text)) ?? text.trim()
}

function uniqueNonEmpty(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value !== ''))]
}

export function musclesFromLegacyText(text: string): string[] {
  return uniqueNonEmpty(text.split(LEGACY_SEPARATOR).map(muscleFromText))
}

export function normalizeMuscles(muscles: unknown, legacyText: unknown): string[] {
  if (Array.isArray(muscles)) {
    return uniqueNonEmpty(muscles.filter((value): value is string => typeof value === 'string').map((value) => value.trim()))
  }
  return typeof legacyText === 'string' ? musclesFromLegacyText(legacyText) : []
}

export function muscleOptionGroups(selected: readonly string[]): MuscleGroup[] {
  const others = selected.filter((value) => !isKnownMuscle(value))
  if (others.length === 0) return [...MUSCLE_GROUPS]
  return [...MUSCLE_GROUPS, { label: OTHER_GROUP_LABEL, options: others.map((value) => ({ value, label: value })) }]
}
