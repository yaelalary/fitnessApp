import type { BrandId } from './types'
import { GENERATED_MACHINES } from './machineCatalog.generated'

export interface GeneratedMachine {
  name: string
  line: string
  imageUrl: string | null
}

export interface MachineModel extends GeneratedMachine {
  aliases: string[]
}

const PREVIOUS_NAMES: Partial<Record<BrandId, Record<string, string[]>>> = {
  technogym: {
    'Selection 900 Chest Press': ['Chest Press'],
    'Selection 900 Pectoral': ['Pectoral'],
    'Selection 900 Shoulder Press': ['Shoulder Press'],
    'Selection 900 Lat Machine': ['Lat Machine'],
    'Selection 900 Vertical Traction': ['Vertical Traction'],
    'Selection 900 Low Row': ['Low Row'],
    'Selection 900 Upper Back': ['Upper Back'],
    'Selection 900 Delts Machine': ['Delts Machine'],
    'Selection 900 Arm Curl': ['Arm Curl'],
    'Selection 900 Arm Extension': ['Arm Extension'],
    'Selection 900 Leg Press': ['Leg Press'],
    'Selection 900 Leg Extension': ['Leg Extension'],
    'Selection 900 Leg Curl': ['Leg Curl'],
    'Selection 900 Prone Leg Curl': ['Prone Leg Curl'],
    'Selection 900 Abductor': ['Abductor'],
    'Selection 900 Adductor': ['Adductor'],
    'Selection 900 Glute Press': ['Glute', 'Glute Press'],
    'Selection 900 Multi Hip': ['Multi Hip'],
    'Selection 900 Abdominal Crunch': ['Abdominal Crunch'],
    'Selection 900 Lower Back': ['Lower Back'],
    'Selection 900 Rotary Torso': ['Rotary Torso'],
    'Cable Station 4': ['Cable Station'],
    'Excite+ Run': ['Run (tapis)'],
    'Excite+ Bike': ['Bike'],
    'Excite+ Recline': ['Recline'],
    'Excite+ Synchro': ['Synchro (elliptique)'],
    'Excite+ Climb': ['Climb'],
  },
  'hammer-strength': {
    'Iso-Lateral Decline Chest Press': ['Iso-Lateral Decline Press'],
    'Hack Squat': ['Linear Hack Press'],
    'Select Standing Calf': ['Standing Calf Raise'],
    'Glute Drive': ['Hip Thrust'],
    'Seated Biceps': ['Biceps Curl'],
    'Squat Lunge': ['Ground Base Squat Lunge'],
  },
}

const FREE_WEIGHTS_LINE = 'Poids libres'
const FREE_WEIGHTS = ['Barre olympique', 'Haltères', 'Kettlebell', 'Smith machine', 'Banc', 'Barre de traction', 'Poids du corps']

function withPreviousNames(brand: BrandId, machines: GeneratedMachine[]): MachineModel[] {
  const previous = PREVIOUS_NAMES[brand] ?? {}
  return machines.map((machine) => ({ ...machine, aliases: previous[machine.name] ?? [] }))
}

export const MACHINE_CATALOG: Record<BrandId, MachineModel[]> = {
  technogym: withPreviousNames('technogym', GENERATED_MACHINES.technogym),
  'hammer-strength': withPreviousNames('hammer-strength', GENERATED_MACHINES['hammer-strength']),
  'free-weights': FREE_WEIGHTS.map((name) => ({ name, line: FREE_WEIGHTS_LINE, imageUrl: null, aliases: [] })),
  other: [],
}

export const PREVIOUS_MACHINE_NAMES = PREVIOUS_NAMES
