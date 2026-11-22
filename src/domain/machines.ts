import type { BrandId } from './types'

export interface BrandConfig {
  id: BrandId
  label: string
  machines: string[]
}

export const BRANDS: Record<BrandId, BrandConfig> = {
  technogym: {
    id: 'technogym',
    label: 'Technogym',
    machines: [
      'Chest Press',
      'Pectoral',
      'Shoulder Press',
      'Lat Machine',
      'Vertical Traction',
      'Low Row',
      'Upper Back',
      'Delts Machine',
      'Arm Curl',
      'Arm Extension',
      'Leg Press',
      'Leg Extension',
      'Leg Curl',
      'Prone Leg Curl',
      'Abductor',
      'Adductor',
      'Glute',
      'Multi Hip',
      'Abdominal Crunch',
      'Lower Back',
      'Rotary Torso',
      'Cable Station',
      'Run (tapis)',
      'Bike',
      'Recline',
      'Synchro (elliptique)',
      'Climb',
      'Skillrow',
    ],
  },
  'hammer-strength': {
    id: 'hammer-strength',
    label: 'Hammer Strength',
    machines: [
      'Iso-Lateral Bench Press',
      'Iso-Lateral Incline Press',
      'Iso-Lateral Decline Press',
      'Iso-Lateral Wide Chest',
      'Iso-Lateral Shoulder Press',
      'Iso-Lateral Front Lat Pulldown',
      'Iso-Lateral Row',
      'Iso-Lateral High Row',
      'Iso-Lateral Low Row',
      'Iso-Lateral Leg Press',
      'Iso-Lateral Leg Extension',
      'Iso-Lateral Kneeling Leg Curl',
      'Linear Leg Press',
      'Linear Hack Press',
      'V-Squat',
      'Belt Squat',
      'Seated Calf Raise',
      'Standing Calf Raise',
      'Hip Thrust',
      'Ground Base Squat Lunge',
      'Biceps Curl',
      'Seated Dip',
    ],
  },
  'free-weights': {
    id: 'free-weights',
    label: 'Poids libres',
    machines: ['Barre olympique', 'Haltères', 'Kettlebell', 'Smith machine', 'Banc', 'Barre de traction', 'Poids du corps'],
  },
  other: {
    id: 'other',
    label: 'Autre',
    machines: [],
  },
}

export const BRAND_ORDER: BrandId[] = ['technogym', 'hammer-strength', 'free-weights', 'other']

export function isBrandId(value: unknown): value is BrandId {
  return typeof value === 'string' && value in BRANDS
}

export function machineSuggestions(brand: BrandId | null): string[] {
  if (brand) return BRANDS[brand].machines
  return BRAND_ORDER.flatMap((id) => BRANDS[id].machines)
}

export const MUSCLE_GROUPS = [
  'Pectoraux',
  'Dos',
  'Épaules',
  'Biceps',
  'Triceps',
  'Abdominaux',
  'Lombaires',
  'Quadriceps',
  'Ischio-jambiers',
  'Fessiers',
  'Adducteurs',
  'Mollets',
  'Corps entier',
]
