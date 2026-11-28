import { describe, expect, it } from 'vitest'
import type { Session, SessionEntry } from './types'
import { FUN_FACT_KINDS, funFacts, factTotals, sessionsForPeriod } from './funFacts'
import { formatHoursAndMinutes } from './dates'

function entry(overrides: Partial<SessionEntry>): SessionEntry {
  return {
    id: 'e',
    exerciseId: 'x',
    exerciseName: 'x',
    category: 'strength',
    restSeconds: 60,
    sets: [],
    intervals: [],
    durationMinutes: 0,
    distanceKm: 0,
    notes: '',
    ...overrides,
  }
}

function session(entries: SessionEntry[], date = '2026-11-01', id = 's'): Session {
  return { id, date, routineId: null, title: 'S', notes: '', entries }
}

describe('sessionsForPeriod', () => {
  const sessions = [session([], '2026-09-01', 'old'), session([], '2026-11-20', 'recent'), session([], '2026-11-27', 'last')]

  it('garde toutes les séances depuis le début', () => {
    expect(sessionsForPeriod(sessions, 'all', '2026-11-28').map((item) => item.id)).toEqual(['old', 'recent', 'last'])
  })

  it('garde les séances des 30 derniers jours', () => {
    expect(sessionsForPeriod(sessions, 'recent', '2026-11-28').map((item) => item.id)).toEqual(['recent', 'last'])
  })

  it('garde seulement la séance la plus récente', () => {
    expect(sessionsForPeriod(sessions, 'last', '2026-11-28').map((item) => item.id)).toEqual(['last'])
    expect(sessionsForPeriod([], 'last', '2026-11-28')).toEqual([])
  })
})

describe('factTotals', () => {
  it('additionne le poids soulevé, le cardio et la distance de toutes les séances', () => {
    const totals = factTotals([
      session([entry({ sets: [{ reps: 10, weightKg: 50, done: true }] })]),
      session([entry({ category: 'cardio', durationMinutes: 30, distanceKm: 5.5 })]),
      session([entry({ sets: [{ reps: 5, weightKg: 100, done: true }] })]),
    ])
    expect(totals).toEqual({ volumeKg: 1000, cardioMinutes: 30, distanceKm: 5.5 })
  })
})

describe('funFacts', () => {
  it('compare au plus gros objet atteint', () => {
    const [fact] = funFacts({ volumeKg: 900, cardioMinutes: 0, distanceKm: 0 })
    expect(fact.message).toBe('Wow ! Tu as soulevé 900 kg : c’est le poids d’une voiture de Formule 1 !')
  })

  it('compte combien de fois l’objet tient dans le total', () => {
    const [fact] = funFacts({ volumeKg: 3_200, cardioMinutes: 0, distanceKm: 0 })
    expect(fact.message).toBe('Wow ! Tu as soulevé 3,2 t : c’est 2 fois le poids d’un hippopotame !')
  })

  it('donne une note par statistique qui a atteint un premier palier', () => {
    const facts = funFacts({ volumeKg: 2, cardioMinutes: 200, distanceKm: 45 })
    expect(facts.map((fact) => fact.id)).toEqual(['cardioMinutes', 'distanceKm'])
    expect(facts[0].message).toBe('3 h 20 de cardio au compteur : c’est la durée de la sortie de Neil Armstrong sur la Lune !')
    expect(facts[1].message).toBe('Tu as parcouru 45 km : c’est un marathon !')
  })

  it('ne dit rien sans séance', () => {
    expect(funFacts({ volumeKg: 0, cardioMinutes: 0, distanceKm: 0 })).toEqual([])
  })

  it('range les objets de comparaison du plus petit au plus grand', () => {
    for (const kind of FUN_FACT_KINDS) {
      const amounts = kind.references.map((reference) => reference.amount)
      expect(amounts).toEqual([...amounts].sort((a, b) => a - b))
    }
  })
})

describe('formatHoursAndMinutes', () => {
  it('passe en heures au-delà de 60 minutes', () => {
    expect(formatHoursAndMinutes(45)).toBe('45 min')
    expect(formatHoursAndMinutes(120)).toBe('2 h')
    expect(formatHoursAndMinutes(605)).toBe('10 h 05')
  })
})
