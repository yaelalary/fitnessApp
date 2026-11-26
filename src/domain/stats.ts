import type { Exercise, Session } from './types'
import { METRICS, type MetricId } from './metrics'
import { entryToSample, mergeSamples, summarizeSession } from './sessions'
import { addDaysIso, daysBetween, startOfWeekIso } from './dates'
import { percentChange } from './numbers'

export interface ProgressPoint {
  id: string
  date: string
  value: number
}

export function buildProgression(sessions: readonly Session[], exerciseId: string, metricId: MetricId): ProgressPoint[] {
  const metric = METRICS[metricId]
  return [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((session) => {
      const entries = session.entries.filter((entry) => entry.exerciseId === exerciseId)
      if (entries.length === 0) return []
      const value = metric.compute(mergeSamples(entries.map(entryToSample)))
      return value === null ? [] : [{ id: session.id, date: session.date, value }]
    })
}

export interface ProgressionSummary {
  first: number
  last: number
  best: number
  changePercent: number | null
  count: number
}

export function summarizeProgression(points: readonly ProgressPoint[]): ProgressionSummary | null {
  if (points.length === 0) return null
  const first = points[0].value
  const last = points[points.length - 1].value
  return {
    first,
    last,
    best: Math.max(...points.map((point) => point.value)),
    changePercent: percentChange(first, last),
    count: points.length,
  }
}

export interface WeekCount {
  weekStart: string
  count: number
}

export function weeklySessionCounts(sessions: readonly Session[], weeks: number, today: string): WeekCount[] {
  const currentWeek = startOfWeekIso(today)
  const starts = Array.from({ length: weeks }, (_, index) => addDaysIso(currentWeek, -7 * (weeks - 1 - index)))
  const counts = new Map(starts.map((start) => [start, 0]))
  for (const session of sessions) {
    const week = startOfWeekIso(session.date)
    const current = counts.get(week)
    if (current !== undefined) counts.set(week, current + 1)
  }
  return starts.map((weekStart) => ({ weekStart, count: counts.get(weekStart) ?? 0 }))
}

export interface ActivitySummary {
  sessionCount: number
  volumeKg: number
  cardioMinutes: number
}

export function recentActivity(sessions: readonly Session[], today: string, days: number): ActivitySummary {
  const recent = sessions.filter((session) => {
    const age = daysBetween(session.date, today)
    return age >= 0 && age < days
  })
  return recent.reduce<ActivitySummary>(
    (summary, session) => {
      const sessionSummary = summarizeSession(session)
      return {
        sessionCount: summary.sessionCount + 1,
        volumeKg: summary.volumeKg + sessionSummary.volumeKg,
        cardioMinutes: summary.cardioMinutes + sessionSummary.cardioMinutes,
      }
    },
    { sessionCount: 0, volumeKg: 0, cardioMinutes: 0 },
  )
}

export function exercisesWithHistory(exercises: readonly Exercise[], sessions: readonly Session[]): Exercise[] {
  const tracked = new Set(sessions.flatMap((session) => session.entries.map((entry) => entry.exerciseId)))
  return exercises.filter((exercise) => tracked.has(exercise.id))
}
