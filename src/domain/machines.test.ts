import { describe, expect, it } from 'vitest'
import { findMachine, machineImageUrl, machineSuggestions } from './machines'
import { MACHINE_CATALOG } from './machineCatalog'
import { exerciseImageSrc, previewImageSrc } from './images'
import { createExercise } from './exercises'

describe('catalogue des machines', () => {
  it('trouve une machine sans tenir compte de la casse ni des espaces', () => {
    expect(findMachine('technogym', '  chest press ')?.name).toBe('Chest Press')
  })

  it('retrouve une machine par son ancien nom', () => {
    expect(findMachine('hammer-strength', 'Hip Thrust')?.name).toBe('Glute Drive')
  })

  it('cherche dans toutes les marques quand aucune n’est choisie', () => {
    expect(findMachine(null, 'V-Squat')?.name).toBe('V-Squat')
    expect(findMachine('technogym', 'V-Squat')).toBeNull()
  })

  it('propose les noms officiels sans les alias', () => {
    const names = machineSuggestions('hammer-strength')
    expect(names).toContain('Glute Drive')
    expect(names).not.toContain('Hip Thrust')
  })

  it('n’a que des images en https', () => {
    const urls = Object.values(MACHINE_CATALOG).flatMap((machines) => machines.map((machine) => machine.imageUrl))
    expect(urls.filter((url) => url !== null).every((url) => url!.startsWith('https://'))).toBe(true)
  })
})

describe('image d’un exercice', () => {
  const exercise = { ...createExercise('strength'), brand: 'technogym' as const, machine: 'Leg Press' }
  const catalogUrl = machineImageUrl('technogym', 'Leg Press')

  it('montre la photo officielle quand l’exercice n’a pas de photo à lui', () => {
    expect(catalogUrl).not.toBeNull()
    expect(exerciseImageSrc(exercise, {})).toBe(catalogUrl)
  })

  it('donne la priorité à la photo de l’utilisateur', () => {
    const withPhoto = { ...exercise, image: 'gist:image-a.txt' }
    expect(exerciseImageSrc(withPhoto, { 'image-a.txt': 'data:image/jpeg;base64,AAA' })).toBe('data:image/jpeg;base64,AAA')
  })

  it('revient à la photo officielle quand on retire sa photo', () => {
    expect(previewImageSrc({ kind: 'none' }, 'data:mine', 'https://officiel')).toBe('https://officiel')
    expect(previewImageSrc({ kind: 'keep' }, null, 'https://officiel')).toBe('https://officiel')
    expect(previewImageSrc({ kind: 'keep' }, 'data:mine', 'https://officiel')).toBe('data:mine')
  })
})
