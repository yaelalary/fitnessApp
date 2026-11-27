import { describe, expect, it } from 'vitest'
import { resolveSettings } from './settingsStorage'

describe('resolveSettings', () => {
  it('utilise le gist par défaut quand aucun n’est enregistré sur l’appareil', () => {
    expect(resolveSettings({}, 'abc')).toEqual({ gistId: 'abc', token: '', activeProfileId: null, handedness: 'right' })
    expect(resolveSettings({ gistId: '  ' }, 'abc').gistId).toBe('abc')
  })

  it('garde le gist et le jeton saisis sur l’appareil', () => {
    expect(resolveSettings({ gistId: 'perso', token: 't', activeProfileId: 'p', handedness: 'left' }, 'abc')).toEqual({
      gistId: 'perso',
      token: 't',
      activeProfileId: 'p',
      handedness: 'left',
    })
  })
})
