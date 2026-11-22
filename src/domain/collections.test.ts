import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { cloneData } from './collections'

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
