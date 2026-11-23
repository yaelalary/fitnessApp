import { describe, expect, it } from 'vitest'
import { isCategoryId } from './categories'

describe('isCategoryId', () => {
  it('reconnaît les types d’exercice', () => {
    expect(isCategoryId('warmup')).toBe(true)
    expect(isCategoryId('stretching')).toBe(true)
  })

  it('refuse les valeurs inconnues, y compris les propriétés héritées', () => {
    expect(isCategoryId('toString')).toBe(false)
    expect(isCategoryId('constructor')).toBe(false)
    expect(isCategoryId(['warmup'])).toBe(false)
    expect(isCategoryId(undefined)).toBe(false)
  })
})
