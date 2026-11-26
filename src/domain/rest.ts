import { countdownPhase, normalizeCountdownRun, startCountdown, type CountdownRun } from './countdown'

export interface RestTimer {
  run: CountdownRun
  sessionId: string
  entryId: string
  exerciseName: string
}

export interface RestStart {
  sessionId: string
  entryId: string
  exerciseName: string
  seconds: number
}

export interface RestNotification {
  title: string
  body: string
  tag: string
}

export function startRest(start: RestStart, now: number): RestTimer | null {
  if (start.seconds <= 0) return null
  const { sessionId, entryId, exerciseName } = start
  return { run: startCountdown(now, start.seconds * 1000), sessionId, entryId, exerciseName }
}

export function isRestRunning(rest: RestTimer | null, now: number): rest is RestTimer {
  return rest !== null && countdownPhase(rest.run, now) === 'running'
}

export function restBelongsTo(rest: RestTimer | null, sessionId: string, entryId?: string): boolean {
  if (rest === null || rest.sessionId !== sessionId) return false
  return entryId === undefined || rest.entryId === entryId
}

export function restOverNotification(rest: RestTimer): RestNotification {
  return {
    title: 'Récup terminée',
    body: rest.exerciseName ? `Tu peux reprendre : ${rest.exerciseName}.` : 'Tu peux reprendre.',
    tag: 'rest-over',
  }
}

function isText(value: unknown): value is string {
  return typeof value === 'string'
}

export function normalizeRestTimer(stored: unknown, now: number): RestTimer | null {
  if (typeof stored !== 'object' || stored === null) return null
  const { run, sessionId, entryId, exerciseName } = stored as Partial<Record<keyof RestTimer, unknown>>
  const countdown = normalizeCountdownRun(run)
  if (!countdown || !isText(sessionId) || !isText(entryId)) return null
  const rest = { run: countdown, sessionId, entryId, exerciseName: isText(exerciseName) ? exerciseName : '' }
  return isRestRunning(rest, now) ? rest : null
}
