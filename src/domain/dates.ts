const DAY_MS = 24 * 60 * 60 * 1000

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now)
}

export function startOfWeekIso(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  const mondayOffset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - mondayOffset)
  return toIsoDate(date)
}

export function addDaysIso(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime()) / DAY_MS)
}

const longDateFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const shortDateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const timeOfDayFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

export function formatTimeOfDay(timestamp: number): string {
  return timeOfDayFormat.format(new Date(timestamp))
}

export function formatLongDate(isoDate: string): string {
  return longDateFormat.format(parseIsoDate(isoDate))
}

export function formatShortDate(isoDate: string): string {
  return shortDateFormat.format(parseIsoDate(isoDate))
}

export function formatRest(seconds: number): string {
  if (seconds <= 0) return 'Aucune'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (minutes === 0) return `${rest} s`
  if (rest === 0) return `${minutes} min`
  return `${minutes} min ${String(rest).padStart(2, '0')}`
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
