import { describe, expect, it } from 'vitest'
import { formatMass, formatSignedPercent } from './numbers'

describe('formatMass', () => {
  it('reste en kilos sous une tonne', () => {
    expect(formatMass(860.4)).toEqual({ value: '860', unit: 'kg' })
    expect(formatMass(0)).toEqual({ value: '0', unit: 'kg' })
  })

  it('passe en tonnes à partir de 1 000 kg', () => {
    expect(formatMass(1000)).toEqual({ value: '1', unit: 't' })
    expect(formatMass(13560)).toEqual({ value: '13,6', unit: 't' })
  })
})

describe('formatSignedPercent', () => {
  it('arrondit à l’unité et garde le signe', () => {
    expect(formatSignedPercent(46.3)).toBe('+46')
    expect(formatSignedPercent(-12.6)).toBe('-13')
    expect(formatSignedPercent(0.2)).toBe('0')
  })
})
