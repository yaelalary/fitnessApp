import { clamp } from './numbers'

export interface CountdownRun {
  startedAt: number
  endsAt: number
}

export type CountdownPhase = 'idle' | 'running' | 'ready'

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function startCountdown(now: number, durationMs: number): CountdownRun {
  return { startedAt: now, endsAt: now + durationMs }
}

export function normalizeCountdownRun(value: unknown): CountdownRun | null {
  if (typeof value !== 'object' || value === null) return null
  const { startedAt, endsAt } = value as Partial<CountdownRun>
  if (!isTimestamp(startedAt) || !isTimestamp(endsAt) || endsAt <= startedAt) return null
  return { startedAt, endsAt }
}

export function countdownPhase(run: CountdownRun | null, now: number): CountdownPhase {
  if (!run) return 'idle'
  return now < run.endsAt ? 'running' : 'ready'
}

export function countdownRemainingSeconds(run: CountdownRun | null, now: number): number {
  if (!run) return 0
  return Math.max(0, (run.endsAt - now) / 1000)
}

export function countdownProgress(run: CountdownRun | null, now: number): number {
  if (!run) return 0
  return clamp((now - run.startedAt) / (run.endsAt - run.startedAt), 0, 1)
}

export function countdownEndedBetween(run: CountdownRun | null, previousNow: number, now: number): boolean {
  if (!run) return false
  return previousNow < run.endsAt && run.endsAt <= now
}
