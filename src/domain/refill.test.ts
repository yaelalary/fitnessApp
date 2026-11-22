import { describe, expect, it } from 'vitest'
import {
  becameReadyBetween,
  cancelRefill,
  changeRefillDuration,
  createRefillTimer,
  normalizeRefillTimer,
  refillPhase,
  refillProgress,
  refillRemainingSeconds,
  startRefill,
} from './refill'

const MINUTE = 60_000
const T0 = 1_700_000_000_000

describe('minuteur de gourde', () => {
  it('dure 20 minutes par défaut et ne tourne pas', () => {
    const timer = createRefillTimer()
    expect(timer.durationMinutes).toBe(20)
    expect(refillPhase(timer, T0)).toBe('idle')
  })

  it('tourne pendant la durée choisie, puis indique que la gourde peut être remplie', () => {
    const timer = startRefill(changeRefillDuration(createRefillTimer(), 15), T0)
    expect(refillPhase(timer, T0 + 14 * MINUTE)).toBe('running')
    expect(refillRemainingSeconds(timer, T0 + 14 * MINUTE)).toBe(60)
    expect(refillPhase(timer, T0 + 15 * MINUTE)).toBe('ready')
    expect(refillRemainingSeconds(timer, T0 + 20 * MINUTE)).toBe(0)
  })

  it('calcule la progression entre le remplissage et la fin', () => {
    const timer = startRefill(createRefillTimer(), T0)
    expect(refillProgress(timer, T0 + 5 * MINUTE)).toBe(0.25)
    expect(refillProgress(timer, T0 + 60 * MINUTE)).toBe(1)
    expect(refillProgress(createRefillTimer(), T0)).toBe(0)
  })

  it('revient au repos une fois annulé, en gardant la durée', () => {
    const timer = cancelRefill(startRefill(changeRefillDuration(createRefillTimer(), 30), T0))
    expect(refillPhase(timer, T0)).toBe('idle')
    expect(timer.durationMinutes).toBe(30)
  })

  it('applique une nouvelle durée au prochain remplissage seulement', () => {
    const running = startRefill(createRefillTimer(), T0)
    const changed = changeRefillDuration(running, 45)
    expect(changed.run).toEqual(running.run)
    expect(startRefill(changed, T0).run?.endsAt).toBe(T0 + 45 * MINUTE)
  })

  it('borne et arrondit la durée', () => {
    expect(changeRefillDuration(createRefillTimer(), 0).durationMinutes).toBe(1)
    expect(changeRefillDuration(createRefillTimer(), 500).durationMinutes).toBe(180)
    expect(changeRefillDuration(createRefillTimer(), 12.6).durationMinutes).toBe(13)
    expect(changeRefillDuration(createRefillTimer(), Number.NaN).durationMinutes).toBe(20)
  })

  it('détecte la fin uniquement au moment où elle survient', () => {
    const timer = startRefill(createRefillTimer(), T0)
    const end = T0 + 20 * MINUTE
    expect(becameReadyBetween(timer, end - 1000, end)).toBe(true)
    expect(becameReadyBetween(timer, end - 2000, end - 1000)).toBe(false)
    expect(becameReadyBetween(timer, end, end + 1000)).toBe(false)
    expect(becameReadyBetween(createRefillTimer(), end - 1000, end)).toBe(false)
  })

  it('relit un état enregistré et écarte les valeurs invalides', () => {
    const run = { startedAt: T0, endsAt: T0 + 20 * MINUTE }
    expect(normalizeRefillTimer({ durationMinutes: 25, run })).toEqual({ durationMinutes: 25, run })
    expect(normalizeRefillTimer(null)).toEqual(createRefillTimer())
    expect(normalizeRefillTimer({ durationMinutes: '25', run: { startedAt: T0 } })).toEqual(createRefillTimer())
    expect(normalizeRefillTimer({ durationMinutes: 10, run: { startedAt: T0, endsAt: T0 } }).run).toBeNull()
  })
})
