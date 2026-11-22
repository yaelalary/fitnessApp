import { normalizeRefillTimer, type RefillTimer } from '@/domain/refill'
import { readJson, writeJson } from './browserStorage'

const REFILL_KEY = 'carnet-muscu:refill'

export function loadRefillTimer(): RefillTimer {
  return normalizeRefillTimer(readJson<unknown>(REFILL_KEY, null))
}

export function saveRefillTimer(timer: RefillTimer): void {
  writeJson(REFILL_KEY, timer)
}
