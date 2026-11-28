import { describe, expect, it } from 'vitest'
import { focusedEntryId, sessionEntryRoute } from './sessionLinks'

describe('sessionEntryRoute', () => {
  it('désigne l’exercice à afficher dans la séance', () => {
    const route = sessionEntryRoute('s1', 'e2')
    expect(route).toEqual({ name: 'session', params: { id: 's1' }, query: { exercice: 'e2' } })
  })

  it('ouvre simplement la séance sans exercice', () => {
    expect(sessionEntryRoute('s1', null)).toEqual({ name: 'session', params: { id: 's1' }, query: {} })
  })
})

describe('focusedEntryId', () => {
  it('lit l’exercice demandé dans l’adresse', () => {
    expect(focusedEntryId({ exercice: 'e2' })).toBe('e2')
  })

  it('ignore une valeur absente, vide ou multiple', () => {
    expect(focusedEntryId({})).toBeNull()
    expect(focusedEntryId({ exercice: '' })).toBeNull()
    expect(focusedEntryId({ exercice: ['a', 'b'] })).toBeNull()
  })
})
