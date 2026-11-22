import type { BrandId } from './types'
import { MACHINE_CATALOG, type MachineModel } from './machineCatalog'

export type { MachineModel }

export interface BrandConfig {
  id: BrandId
  label: string
  machines: MachineModel[]
}

export const BRANDS: Record<BrandId, BrandConfig> = {
  technogym: { id: 'technogym', label: 'Technogym', machines: MACHINE_CATALOG.technogym },
  'hammer-strength': { id: 'hammer-strength', label: 'Hammer Strength', machines: MACHINE_CATALOG['hammer-strength'] },
  'free-weights': { id: 'free-weights', label: 'Poids libres', machines: MACHINE_CATALOG['free-weights'] },
  other: { id: 'other', label: 'Autre', machines: MACHINE_CATALOG.other },
}

export const BRAND_ORDER: BrandId[] = ['technogym', 'hammer-strength', 'free-weights', 'other']

export function isBrandId(value: unknown): value is BrandId {
  return typeof value === 'string' && value in BRANDS
}

function machinesOf(brand: BrandId | null): MachineModel[] {
  return brand ? BRANDS[brand].machines : BRAND_ORDER.flatMap((id) => BRANDS[id].machines)
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('fr')
}

export function machineSuggestions(brand: BrandId | null): string[] {
  return machinesOf(brand).map((machine) => machine.name)
}

export function findMachine(brand: BrandId | null, name: string): MachineModel | null {
  const wanted = normalizeName(name)
  if (!wanted) return null
  return (
    machinesOf(brand).find((machine) =>
      [machine.name, ...(machine.aliases ?? [])].some((candidate) => normalizeName(candidate) === wanted),
    ) ?? null
  )
}

export function machineImageUrl(brand: BrandId | null, name: string): string | null {
  return findMachine(brand, name)?.imageUrl ?? null
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
