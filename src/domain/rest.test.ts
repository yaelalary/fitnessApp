import { describe, expect, it } from 'vitest'
import { isRestRunning, normalizeRestTimer, restBelongsTo, restOverNotification, startRest } from './rest'

const T0 = 1_700_000_000_000
const request = { sessionId: 's1', entryId: 'e1', exerciseName: 'Presse', seconds: 90 }

describe('minuteur de récup', () => {
  it('tourne pendant la récup demandée puis s’arrête', () => {
    const rest = startRest(request, T0)
    expect(isRestRunning(rest, T0 + 89_000)).toBe(true)
    expect(isRestRunning(rest, T0 + 90_000)).toBe(false)
  })

  it('ne démarre pas sans durée de récup', () => {
    expect(startRest({ ...request, seconds: 0 }, T0)).toBeNull()
  })

  it('se retrouve après avoir quitté la page tant qu’il n’est pas fini', () => {
    const stored = JSON.parse(JSON.stringify(startRest(request, T0)))
    expect(normalizeRestTimer(stored, T0 + 30_000)).toEqual(startRest(request, T0))
    expect(normalizeRestTimer(stored, T0 + 120_000)).toBeNull()
  })

  it('ignore une sauvegarde abîmée', () => {
    expect(normalizeRestTimer(null, T0)).toBeNull()
    expect(normalizeRestTimer({ sessionId: 's1', entryId: 'e1', run: { startedAt: T0, endsAt: T0 } }, T0)).toBeNull()
    expect(normalizeRestTimer({ run: { startedAt: T0, endsAt: T0 + 1000 } }, T0)).toBeNull()
  })

  it('appartient à la séance et à l’exercice qui l’ont lancé', () => {
    const rest = startRest(request, T0)
    expect(restBelongsTo(rest, 's1')).toBe(true)
    expect(restBelongsTo(rest, 's1', 'e1')).toBe(true)
    expect(restBelongsTo(rest, 's1', 'e2')).toBe(false)
    expect(restBelongsTo(rest, 's2')).toBe(false)
  })

  it('annonce la fin de la récup avec l’exercice', () => {
    const rest = startRest(request, T0)!
    expect(restOverNotification(rest)).toEqual({ title: 'Récup terminée', body: 'Tu peux reprendre : Presse.', tag: 'rest-over' })
  })
})
