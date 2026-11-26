import { normalizeRestTimer, type RestTimer } from '@/domain/rest'
import { readJson, removeKey, writeJson } from './browserStorage'

const REST_KEY = 'carnet-muscu:rest'

export function loadRestTimer(now: number): RestTimer | null {
  return normalizeRestTimer(readJson<unknown>(REST_KEY, null), now)
}

export function saveRestTimer(rest: RestTimer | null): void {
  if (rest) writeJson(REST_KEY, rest)
  else removeKey(REST_KEY)
}
