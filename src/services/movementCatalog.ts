import type { Movement } from '@/domain/movements'

let pending: Promise<Movement[]> | null = null

export function loadMovements(): Promise<Movement[]> {
  pending ??= import('@/domain/movementCatalog.generated').then((module) => module.GENERATED_MOVEMENTS)
  pending.catch(() => {
    pending = null
  })
  return pending
}
