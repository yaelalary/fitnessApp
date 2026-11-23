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
  return typeof value === 'string' && Object.hasOwn(BRANDS, value)
}

function machinesOf(brand: BrandId | null): MachineModel[] {
  return brand ? BRANDS[brand].machines : BRAND_ORDER.flatMap((id) => BRANDS[id].machines)
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('fr')
}

export function findMachine(brand: BrandId | null, name: string): MachineModel | null {
  const wanted = normalizeName(name)
  if (!wanted) return null
  return (
    machinesOf(brand).find((machine) =>
      [machine.name, ...machine.aliases].some((candidate) => normalizeName(candidate) === wanted),
    ) ?? null
  )
}

export function machineImageUrl(brand: BrandId | null, name: string): string | null {
  return findMachine(brand, name)?.imageUrl ?? null
}

export interface CatalogEntry {
  brand: BrandId
  name: string
  line: string
  imageUrl: string | null
}

export interface CatalogFilter {
  brand: BrandId | null
  line: string | null
  query: string
}

export const CATALOG_ENTRIES: CatalogEntry[] = BRAND_ORDER.flatMap((brand) =>
  BRANDS[brand].machines.map(({ name, line, imageUrl }) => ({ brand, name, line, imageUrl })),
)

export const CATALOG_BRANDS: BrandId[] = BRAND_ORDER.filter((brand) => BRANDS[brand].machines.length > 0)

export function catalogLines(brand: BrandId | null): string[] {
  if (!brand) return []
  return [...new Set(BRANDS[brand].machines.map((machine) => machine.line))]
}

function searchable(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr')
}

export function filterCatalog(entries: readonly CatalogEntry[], filter: CatalogFilter): CatalogEntry[] {
  const words = searchable(filter.query).split(/\s+/).filter(Boolean)
  return entries.filter((entry) => {
    if (filter.brand && entry.brand !== filter.brand) return false
    if (filter.line && entry.line !== filter.line) return false
    const haystack = searchable(`${entry.name} ${entry.line} ${BRANDS[entry.brand].label}`)
    return words.every((word) => haystack.includes(word))
  })
}

export function findCatalogEntry(brand: BrandId | null, name: string): CatalogEntry | null {
  const brands = brand ? [brand] : BRAND_ORDER
  for (const brandId of brands) {
    const machine = findMachine(brandId, name)
    if (machine) return { brand: brandId, name: machine.name, line: machine.line, imageUrl: machine.imageUrl }
  }
  return null
}

const RESIZE_PARAMS = ['sw', 'width']

export function machineThumbnailUrl(imageUrl: string | null, width: number): string | null {
  if (!imageUrl) return null
  try {
    const url = new URL(imageUrl)
    const param = RESIZE_PARAMS.find((name) => url.searchParams.has(name))
    if (!param) return imageUrl
    url.searchParams.set(param, String(width))
    return url.toString()
  } catch {
    return imageUrl
  }
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
