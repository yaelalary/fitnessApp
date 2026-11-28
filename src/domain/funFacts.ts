import type { Session } from './types'
import { sortSessionsDesc, summarizeSession } from './sessions'
import { RECENT_DAYS, sessionsWithinDays } from './stats'
import { formatMass, formatNumber, formatWithUnit } from './numbers'
import { formatHoursAndMinutes } from './dates'

export type FactPeriod = 'all' | 'recent' | 'last'

export const FACT_PERIODS: Record<FactPeriod, { label: string; select: (sessions: readonly Session[], today: string) => Session[] }> = {
  all: { label: 'Total', select: (sessions) => [...sessions] },
  recent: { label: `${RECENT_DAYS} jours`, select: (sessions, today) => sessionsWithinDays(sessions, today, RECENT_DAYS) },
  last: { label: 'Dernière séance', select: (sessions) => sortSessionsDesc(sessions).slice(0, 1) },
}

export const FACT_PERIOD_ORDER: FactPeriod[] = ['all', 'recent', 'last']

export function sessionsForPeriod(sessions: readonly Session[], period: FactPeriod, today: string): Session[] {
  return FACT_PERIODS[period].select(sessions, today)
}

export interface FactTotals {
  volumeKg: number
  cardioMinutes: number
  distanceKm: number
}

export function factTotals(sessions: readonly Session[]): FactTotals {
  return sessions.reduce<FactTotals>(
    (totals, session) => {
      const summary = summarizeSession(session)
      const distanceKm = session.entries.reduce((sum, entry) => sum + entry.distanceKm, 0)
      return {
        volumeKg: totals.volumeKg + summary.volumeKg,
        cardioMinutes: totals.cardioMinutes + summary.cardioMinutes,
        distanceKm: totals.distanceKm + distanceKm,
      }
    },
    { volumeKg: 0, cardioMinutes: 0, distanceKm: 0 },
  )
}

interface Reference {
  amount: number
  one: string
  many: string
}

interface FunFactKind {
  id: keyof FactTotals
  icon: 'dumbbell' | 'timer' | 'route'
  format: (total: number) => string
  sentence: (total: string, comparison: string) => string
  references: Reference[]
}

function formatMassText(kg: number): string {
  const { value, unit } = formatMass(kg)
  return `${value} ${unit}`
}

export const FUN_FACT_KINDS: FunFactKind[] = [
  {
    id: 'volumeKg',
    icon: 'dumbbell',
    format: formatMassText,
    sentence: (total, comparison) => `Wow ! Tu as soulevé ${total} : c’est ${comparison} !`,
    references: [
      { amount: 4, one: 'le poids d’un chat', many: 'fois le poids d’un chat' },
      { amount: 70, one: 'le poids d’une machine à laver', many: 'fois le poids d’une machine à laver' },
      { amount: 250, one: 'le poids d’un piano droit', many: 'fois le poids d’un piano droit' },
      { amount: 600, one: 'le poids d’une vache', many: 'fois le poids d’une vache' },
      { amount: 800, one: 'le poids d’une voiture de Formule 1', many: 'fois le poids d’une voiture de Formule 1' },
      { amount: 1_500, one: 'le poids d’un hippopotame', many: 'fois le poids d’un hippopotame' },
      { amount: 6_000, one: 'le poids d’un éléphant d’Afrique', many: 'fois le poids d’un éléphant d’Afrique' },
      { amount: 8_000, one: 'le poids d’un tyrannosaure', many: 'fois le poids d’un tyrannosaure' },
      { amount: 12_000, one: 'le poids d’un bus', many: 'fois le poids d’un bus' },
      { amount: 30_000, one: 'le poids d’une baleine à bosse', many: 'fois le poids d’une baleine à bosse' },
      { amount: 150_000, one: 'le poids d’une baleine bleue', many: 'fois le poids d’une baleine bleue' },
      { amount: 400_000, one: 'le poids d’un Airbus A380 au décollage', many: 'fois le poids d’un Airbus A380 au décollage' },
      { amount: 7_300_000, one: 'le poids de la tour Eiffel', many: 'fois le poids de la tour Eiffel' },
    ],
  },
  {
    id: 'cardioMinutes',
    icon: 'timer',
    format: formatHoursAndMinutes,
    sentence: (total, comparison) => `${total} de cardio au compteur : c’est ${comparison} !`,
    references: [
      { amount: 8, one: 'le temps que met la lumière du Soleil pour arriver jusqu’à nous', many: 'fois le trajet de la lumière du Soleil jusqu’à nous' },
      { amount: 90, one: 'un match de foot entier', many: 'matchs de foot entiers' },
      { amount: 121, one: 'le temps du record du monde du marathon', many: 'fois le record du monde du marathon' },
      { amount: 152, one: 'la durée de la sortie de Neil Armstrong sur la Lune', many: 'fois la sortie de Neil Armstrong sur la Lune' },
      { amount: 1_440, one: 'les 24 Heures du Mans', many: 'fois les 24 Heures du Mans' },
      { amount: 4_560, one: 'le voyage d’Apollo 11 de la Terre à la Lune', many: 'fois le voyage d’Apollo 11 jusqu’à la Lune' },
      { amount: 115_200, one: 'le tour du monde en 80 jours', many: 'tours du monde en 80 jours' },
    ],
  },
  {
    id: 'distanceKm',
    icon: 'route',
    format: (km) => formatWithUnit(Math.round(km), 'km'),
    sentence: (total, comparison) => `Tu as parcouru ${total} : c’est ${comparison} !`,
    references: [
      { amount: 2, one: 'la longueur des Champs-Élysées', many: 'fois la longueur des Champs-Élysées' },
      { amount: 21, one: 'un semi-marathon', many: 'semi-marathons' },
      { amount: 42, one: 'un marathon', many: 'marathons' },
      { amount: 465, one: 'la route de Paris à Lyon', many: 'fois la route de Paris à Lyon' },
      { amount: 3_400, one: 'la longueur du Tour de France', many: 'fois la longueur du Tour de France' },
      { amount: 40_075, one: 'le tour de la Terre', many: 'fois le tour de la Terre' },
    ],
  },
]

export interface FunFact {
  id: string
  icon: FunFactKind['icon']
  message: string
}

function comparisonFor(total: number, references: readonly Reference[]): string | null {
  const reference = references.filter((candidate) => candidate.amount <= total).at(-1)
  if (!reference) return null
  const count = Math.floor(total / reference.amount)
  return count === 1 ? reference.one : `${formatNumber(count)} ${reference.many}`
}

export function funFacts(totals: FactTotals): FunFact[] {
  return FUN_FACT_KINDS.flatMap((kind) => {
    const total = totals[kind.id]
    const comparison = comparisonFor(total, kind.references)
    if (!comparison) return []
    return [{ id: kind.id, icon: kind.icon, message: kind.sentence(kind.format(total), comparison) }]
  })
}
