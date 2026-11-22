import { clamp } from './numbers'

export interface RefillRun {
  startedAt: number
  endsAt: number
}

export interface RefillTimer {
  durationMinutes: number
  run: RefillRun | null
}

export type RefillPhase = 'idle' | 'running' | 'ready'

export const REFILL_DURATION = { defaultMinutes: 20, minMinutes: 1, maxMinutes: 180, stepMinutes: 5 } as const

const MINUTE_MS = 60_000

export function createRefillTimer(): RefillTimer {
  return { durationMinutes: REFILL_DURATION.defaultMinutes, run: null }
}

export function normalizeRefillDuration(minutes: number): number {
  if (!Number.isFinite(minutes)) return REFILL_DURATION.defaultMinutes
  return clamp(Math.round(minutes), REFILL_DURATION.minMinutes, REFILL_DURATION.maxMinutes)
}

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function normalizeRun(value: unknown): RefillRun | null {
  if (typeof value !== 'object' || value === null) return null
  const { startedAt, endsAt } = value as Partial<RefillRun>
  if (!isTimestamp(startedAt) || !isTimestamp(endsAt) || endsAt <= startedAt) return null
  return { startedAt, endsAt }
}

export function normalizeRefillTimer(stored: unknown): RefillTimer {
  if (typeof stored !== 'object' || stored === null) return createRefillTimer()
  const { durationMinutes, run } = stored as Partial<RefillTimer>
  return {
    durationMinutes: typeof durationMinutes === 'number' ? normalizeRefillDuration(durationMinutes) : REFILL_DURATION.defaultMinutes,
    run: normalizeRun(run),
  }
}

export function startRefill(timer: RefillTimer, now: number): RefillTimer {
  return { ...timer, run: { startedAt: now, endsAt: now + timer.durationMinutes * MINUTE_MS } }
}

export function cancelRefill(timer: RefillTimer): RefillTimer {
  return { ...timer, run: null }
}

export function changeRefillDuration(timer: RefillTimer, minutes: number): RefillTimer {
  return { ...timer, durationMinutes: normalizeRefillDuration(minutes) }
}

export function refillPhase(timer: RefillTimer, now: number): RefillPhase {
  if (!timer.run) return 'idle'
  return now < timer.run.endsAt ? 'running' : 'ready'
}

export function refillRemainingSeconds(timer: RefillTimer, now: number): number {
  if (!timer.run) return 0
  return Math.max(0, (timer.run.endsAt - now) / 1000)
}

export function refillProgress(timer: RefillTimer, now: number): number {
  if (!timer.run) return 0
  const { startedAt, endsAt } = timer.run
  return clamp((now - startedAt) / (endsAt - startedAt), 0, 1)
}

export function becameReadyBetween(timer: RefillTimer, previousNow: number, now: number): boolean {
  if (!timer.run) return false
  return previousNow < timer.run.endsAt && timer.run.endsAt <= now
}
