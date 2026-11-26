import { clamp } from './numbers'
import {
  countdownEndedBetween,
  countdownPhase,
  countdownProgress,
  countdownRemainingSeconds,
  normalizeCountdownRun,
  startCountdown,
  type CountdownPhase,
  type CountdownRun,
} from './countdown'

export type RefillRun = CountdownRun

export interface RefillTimer {
  durationMinutes: number
  run: RefillRun | null
}

export type RefillPhase = CountdownPhase

export const REFILL_DURATION = { defaultMinutes: 20, minMinutes: 1, maxMinutes: 180, stepMinutes: 5 } as const

const MINUTE_MS = 60_000

export function createRefillTimer(): RefillTimer {
  return { durationMinutes: REFILL_DURATION.defaultMinutes, run: null }
}

export function normalizeRefillDuration(minutes: number): number {
  if (!Number.isFinite(minutes)) return REFILL_DURATION.defaultMinutes
  return clamp(Math.round(minutes), REFILL_DURATION.minMinutes, REFILL_DURATION.maxMinutes)
}

export function normalizeRefillTimer(stored: unknown): RefillTimer {
  if (typeof stored !== 'object' || stored === null) return createRefillTimer()
  const { durationMinutes, run } = stored as Partial<RefillTimer>
  return {
    durationMinutes: typeof durationMinutes === 'number' ? normalizeRefillDuration(durationMinutes) : REFILL_DURATION.defaultMinutes,
    run: normalizeCountdownRun(run),
  }
}

export function startRefill(timer: RefillTimer, now: number): RefillTimer {
  return { ...timer, run: startCountdown(now, timer.durationMinutes * MINUTE_MS) }
}

export function cancelRefill(timer: RefillTimer): RefillTimer {
  return { ...timer, run: null }
}

export function changeRefillDuration(timer: RefillTimer, minutes: number): RefillTimer {
  return { ...timer, durationMinutes: normalizeRefillDuration(minutes) }
}

export function refillPhase(timer: RefillTimer, now: number): RefillPhase {
  return countdownPhase(timer.run, now)
}

export function refillRemainingSeconds(timer: RefillTimer, now: number): number {
  return countdownRemainingSeconds(timer.run, now)
}

export function refillProgress(timer: RefillTimer, now: number): number {
  return countdownProgress(timer.run, now)
}

export function becameReadyBetween(timer: RefillTimer, previousNow: number, now: number): boolean {
  return countdownEndedBetween(timer.run, previousNow, now)
}
