import { describe, expect, it } from 'vitest'
import {
  automaticMovement,
  describeMovement,
  equipmentLabel,
  findMovement,
  movementImageUrls,
  movementOrigin,
  NO_MOVEMENT,
  resolveMovement,
  searchMovements,
  type Movement,
  type MovementSubject,
} from './movements'
import { GENERATED_MOVEMENTS } from './movementCatalog.generated'
import { createExercise } from './exercises'
import { normalizeProfile } from './profiles'

function names(movements: Movement[]): string[] {
  return movements.map((movement) => movement.name)
}

describe('base de mouvements', () => {
  it('a des identifiants uniques et deux images par mouvement', () => {
    const ids = GENERATED_MOVEMENTS.map((movement) => movement.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(GENERATED_MOVEMENTS.every((movement) => movement.images.length > 0)).toBe(true)
    expect(movementImageUrls(GENERATED_MOVEMENTS[0]).every((url) => url.startsWith('https://'))).toBe(true)
  })

  it('retrouve le mouvement d’une machine du catalogue à partir de son nom', () => {
    const results = names(searchMovements(GENERATED_MOVEMENTS, 'Pure Strength Linear Leg Press', null))
    expect(results.slice(0, 5)).toContain('Leg Press')
  })

  it('classe en premier les mouvements qui reprennent tous les mots cherchés', () => {
    const [first] = searchMovements(GENERATED_MOVEMENTS, 'seated cable rows', null)
    expect(first.name).toBe('Seated Cable Rows')
  })

  it('filtre par matériel', () => {
    const results = searchMovements(GENERATED_MOVEMENTS, 'curl', 'dumbbell')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((movement) => movement.equipment === 'dumbbell')).toBe(true)
  })

  it('ne trouve rien pour des mots sans rapport', () => {
    expect(searchMovements(GENERATED_MOVEMENTS, 'zzzz', null)).toEqual([])
  })

  it('décrit le matériel et les muscles en français', () => {
    const legPress = GENERATED_MOVEMENTS.find((movement) => movement.name === 'Leg Press')!
    expect(describeMovement(legPress)).toBe('Machine · quadriceps')
    expect(equipmentLabel('inconnu')).toBe('Autre')
  })

  it('retrouve le mouvement choisi par son identifiant', () => {
    const [first] = GENERATED_MOVEMENTS
    expect(findMovement(GENERATED_MOVEMENTS, first.id)).toBe(first)
    expect(findMovement(GENERATED_MOVEMENTS, null)).toBeNull()
  })
})

function subject(changes: Partial<MovementSubject>): MovementSubject {
  return { name: '', machine: '', category: 'strength', brand: null, movementId: null, ...changes }
}

function automaticName(changes: Partial<MovementSubject>): string | null {
  return automaticMovement(GENERATED_MOVEMENTS, subject(changes))?.name ?? null
}

describe('démonstration trouvée automatiquement', () => {
  it('part du nom de la machine du catalogue', () => {
    expect(automaticName({ machine: 'Pure Strength Linear Leg Press', brand: 'technogym' })).toBe('Leg Press')
    expect(automaticName({ machine: 'Selection 900 Leg Extension', brand: 'technogym' })).toBe('Leg Extensions')
    expect(automaticName({ machine: 'Selection 700 Vertical Traction', brand: 'technogym' })).toMatch(/Lat Pulldown/)
  })

  it('comprend les noms d’exercices courants en français', () => {
    expect(automaticName({ name: 'Presse à cuisses' })).toBe('Leg Press')
    expect(automaticName({ name: 'Gainage' })).toBe('Plank')
    expect(automaticName({ name: 'Tractions' })).toBe('Pullups')
    expect(automaticName({ name: 'Étirement quadriceps', category: 'stretching' })).toBe('Quad Stretch')
    expect(automaticName({ name: 'Tapis de course', category: 'cardio' })).toBe('Running, Treadmill')
  })

  it('ne confond pas un numéro de gamme avec un mouvement', () => {
    expect(automaticName({ machine: 'Selection 900 Pulley', brand: 'technogym' })).not.toMatch(/90\/90/)
  })

  it('ne propose rien plutôt qu’un mouvement sans rapport', () => {
    expect(automaticName({ machine: 'HD Elite Half Rack', brand: 'hammer-strength' })).toBeNull()
    expect(automaticName({ machine: 'Olympic Decline Bench', brand: 'technogym' })).toBeNull()
    expect(automaticName({ name: 'Mon exercice' })).toBeNull()
  })

  it('garde la démonstration choisie à la main, ou aucune si elle a été retirée', () => {
    const chosen = subject({ machine: 'Pure Strength Linear Leg Press', movementId: 'Plank' })
    expect(movementOrigin(chosen)).toBe('chosen')
    expect(resolveMovement(GENERATED_MOVEMENTS, chosen)?.name).toBe('Plank')
    const removed = subject({ machine: 'Pure Strength Linear Leg Press', movementId: NO_MOVEMENT })
    expect(movementOrigin(removed)).toBe('none')
    expect(resolveMovement(GENERATED_MOVEMENTS, removed)).toBeNull()
    expect(resolveMovement(GENERATED_MOVEMENTS, subject({ machine: 'Pure Strength Linear Leg Press' }))?.name).toBe('Leg Press')
  })
})

describe('démonstration d’un exercice', () => {
  it('est automatique par défaut, et relit le choix enregistré dans le gist', () => {
    const exercise = { ...createExercise('strength'), name: 'Presse', movementId: 'Leg_Press' }
    expect(createExercise('strength').movementId).toBeNull()
    const profile = normalizeProfile(JSON.parse(JSON.stringify({ id: 'p', name: 'Moi', exercises: [exercise] })))
    expect(profile?.exercises[0].movementId).toBe('Leg_Press')
    const legacy = normalizeProfile({ id: 'p', name: 'Moi', exercises: [{ id: 'e', name: 'Ancien' }] })
    expect(legacy?.exercises[0].movementId).toBeNull()
    const removed = normalizeProfile({ id: 'p', name: 'Moi', exercises: [{ id: 'e', name: 'Presse', movementId: NO_MOVEMENT }] })
    expect(removed?.exercises[0].movementId).toBe(NO_MOVEMENT)
  })
})
