import { describe, expect, it } from 'vitest'
import type { Session, SessionEntry } from './types'
import { buildProgression, recentActivity, summarizeProgression, weeklySessionCounts } from './stats'
import { epleyOneRepMax, METRICS } from './metrics'

function entry(overrides: Partial<SessionEntry>): SessionEntry {
  return {
    id: 'e',
    exerciseId: 'press',
    exerciseName: 'Chest Press',
    category: 'strength',
    restSeconds: 90,
    sets: [],
    durationMinutes: 0,
    distanceKm: 0,
    notes: '',
    done: false,
    ...overrides,
  }
}

function session(id: string, date: string, entries: SessionEntry[]): Session {
  return { id, date, routineId: null, title: 'S', notes: '', entries }
}

const set = (reps: number, weightKg: number) => ({ reps, weightKg, done: true })

describe('metrics', () => {
  it('ignore les séries sans répétition pour la charge max', () => {
    const sample = { sets: [set(10, 40), set(0, 80)], durationMinutes: 0, distanceKm: 0 }
    expect(METRICS.maxWeight.compute(sample)).toBe(40)
  })

  it('calcule le volume', () => {
    const sample = { sets: [set(10, 40), set(8, 45)], durationMinutes: 0, distanceKm: 0 }
    expect(METRICS.volume.compute(sample)).toBe(760)
  })

  it('retourne null quand il n’y a rien à mesurer', () => {
    expect(METRICS.maxWeight.compute({ sets: [], durationMinutes: 0, distanceKm: 0 })).toBeNull()
  })

  it('estime le 1RM avec Epley', () => {
    expect(epleyOneRepMax(100, 1)).toBe(100)
    expect(epleyOneRepMax(60, 10)).toBe(80)
    expect(epleyOneRepMax(0, 10)).toBe(0)
  })

  it('calcule la vitesse en km/h', () => {
    expect(METRICS.speed.compute({ sets: [], durationMinutes: 30, distanceKm: 5 })).toBe(10)
  })
})

describe('buildProgression', () => {
  it('trie par date et fusionne les entrées d’une même séance', () => {
    const sessions = [
      session('b', '2026-03-10', [entry({ sets: [set(10, 50)] })]),
      session('a', '2026-03-01', [entry({ sets: [set(10, 40)] }), entry({ sets: [set(5, 45)] })]),
      session('c', '2026-03-05', [entry({ exerciseId: 'other', sets: [set(10, 99)] })]),
    ]
    expect(buildProgression(sessions, 'press', 'maxWeight')).toEqual([
      { sessionId: 'a', date: '2026-03-01', value: 45 },
      { sessionId: 'b', date: '2026-03-10', value: 50 },
    ])
  })
})

describe('summarizeProgression', () => {
  it('donne premier, dernier, meilleur et évolution', () => {
    const summary = summarizeProgression([
      { sessionId: 'a', date: '2026-01-01', value: 40 },
      { sessionId: 'b', date: '2026-01-08', value: 55 },
      { sessionId: 'c', date: '2026-01-15', value: 50 },
    ])
    expect(summary).toEqual({ first: 40, last: 50, best: 55, changePercent: 25, count: 3 })
  })

  it('retourne null sans données', () => {
    expect(summarizeProgression([])).toBeNull()
  })
})

describe('weeklySessionCounts', () => {
  it('compte les séances par semaine commençant le lundi', () => {
    const sessions = [
      session('a', '2026-11-16', []),
      session('b', '2026-11-22', []),
      session('c', '2026-11-12', []),
      session('d', '2026-01-01', []),
    ]
    expect(weeklySessionCounts(sessions, 2, '2026-11-22')).toEqual([
      { weekStart: '2026-11-09', count: 1 },
      { weekStart: '2026-11-16', count: 2 },
    ])
  })
})

describe('recentActivity', () => {
  it('ne garde que les séances de la période', () => {
    const sessions = [
      session('a', '2026-11-20', [entry({ sets: [set(10, 10)] }), entry({ category: 'cardio', durationMinutes: 20 })]),
      session('b', '2026-09-01', [entry({ sets: [set(10, 100)] })]),
      session('c', '2026-11-25', [entry({ sets: [set(10, 100)] })]),
    ]
    expect(recentActivity(sessions, '2026-11-22', 30)).toEqual({ sessionCount: 1, volumeKg: 100, cardioMinutes: 20 })
  })
})
