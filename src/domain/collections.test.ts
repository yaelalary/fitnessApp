import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { cloneData, moveItem } from './collections'

describe('moveItem', () => {
  it('déplace un élément vers le bas ou vers le haut', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('laisse la liste intacte pour un indice hors limites', () => {
    expect(moveItem(['a', 'b'], 0, 2)).toEqual(['a', 'b'])
    expect(moveItem(['a', 'b'], -1, 0)).toEqual(['a', 'b'])
    expect(moveItem(['a', 'b'], 2, 0)).toEqual(['a', 'b'])
  })
})

describe('cloneData', () => {
  it('copie un objet réactif du store, ce que structuredClone refuse', () => {
    const stored = reactive({ id: 'e', defaults: { sets: 3 }, tags: ['a'] })
    expect(() => structuredClone(stored)).toThrow()
    const copy = cloneData(stored)
    copy.defaults.sets = 5
    copy.tags.push('b')
    expect(copy).toEqual({ id: 'e', defaults: { sets: 5 }, tags: ['a', 'b'] })
    expect(stored.defaults.sets).toBe(3)
    expect(stored.tags).toEqual(['a'])
  })
})
