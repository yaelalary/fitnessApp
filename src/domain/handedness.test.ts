import { describe, expect, it } from 'vitest'
import { normalizeHandedness } from './handedness'

describe('normalizeHandedness', () => {
  it('garde un choix connu', () => {
    expect(normalizeHandedness('left')).toBe('left')
    expect(normalizeHandedness('right')).toBe('right')
  })

  it('revient au mode droitier pour une valeur absente ou inconnue', () => {
    expect(normalizeHandedness(undefined)).toBe('right')
    expect(normalizeHandedness('ambidextre')).toBe('right')
  })
})
