import { describe, expect, it } from 'vitest'
import { BRAND_ORDER, findMachine, machineGroups, machineImageUrl, resolveMachineSelection } from './machines'
import { MACHINE_CATALOG, PREVIOUS_MACHINE_NAMES } from './machineCatalog'
import { exerciseImageSrc, previewImageSrc } from './images'
import { changeExerciseBrand, createExercise } from './exercises'

describe('catalogue des machines', () => {
  it('trouve une machine sans tenir compte de la casse ni des espaces', () => {
    expect(findMachine('hammer-strength', '  iso-lateral horizontal bench press ')?.name).toBe('Iso-Lateral Horizontal Bench Press')
  })

  it('retrouve une machine par son ancien nom', () => {
    expect(findMachine('hammer-strength', 'Hip Thrust')?.name).toBe('Glute Drive')
    expect(findMachine('technogym', 'Chest Press')?.name).toBe('Selection 900 Chest Press')
  })

  it('fait correspondre chaque ancien nom à une machine du catalogue', () => {
    for (const brand of BRAND_ORDER) {
      for (const [official, previous] of Object.entries(PREVIOUS_MACHINE_NAMES[brand] ?? {})) {
        expect(MACHINE_CATALOG[brand].some((machine) => machine.name === official), official).toBe(true)
        for (const name of previous) expect(findMachine(brand, name)?.name, name).toBe(official)
      }
    }
  })

  it('n’a pas deux machines du même nom dans une marque', () => {
    for (const brand of BRAND_ORDER) {
      const names = MACHINE_CATALOG[brand].map((machine) => machine.name.toLowerCase())
      expect(new Set(names).size).toBe(names.length)
    }
  })

  it('cherche dans toutes les marques quand aucune n’est choisie', () => {
    expect(findMachine(null, 'V-Squat')?.name).toBe('V-Squat')
    expect(findMachine('technogym', 'V-Squat')).toBeNull()
  })

  it('regroupe les machines par gamme, avec les noms officiels', () => {
    const groups = machineGroups('hammer-strength')
    const names = groups.flatMap((group) => group.names)
    expect(groups.map((group) => group.label)).toContain('Plate-Loaded')
    expect(names).toContain('Glute Drive')
    expect(names).not.toContain('Hip Thrust')
  })

  it('préfixe les gammes par la marque quand aucune marque n’est choisie', () => {
    expect(machineGroups(null).map((group) => group.label)).toContain('Technogym · Selection')
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

describe('choix de la machine', () => {
  it('reconnaît une machine du catalogue, y compris par son ancien nom', () => {
    expect(resolveMachineSelection('hammer-strength', 'hip thrust')).toEqual({ kind: 'catalog', name: 'Glute Drive' })
    expect(resolveMachineSelection('technogym', 'Leg Press')).toEqual({ kind: 'catalog', name: 'Selection 900 Leg Press' })
  })

  it('garde une machine hors catalogue comme saisie libre', () => {
    expect(resolveMachineSelection('technogym', 'Presse maison')).toEqual({ kind: 'custom', name: 'Presse maison' })
    expect(resolveMachineSelection('technogym', '  ')).toEqual({ kind: 'none' })
  })

  it('vide la machine quand elle appartient à une autre marque', () => {
    const exercise = { ...createExercise('strength'), brand: 'technogym' as const, machine: 'Selection 900 Pulldown' }
    expect(changeExerciseBrand(exercise, 'hammer-strength').machine).toBe('')
    expect(changeExerciseBrand(exercise, 'technogym').machine).toBe('Selection 900 Pulldown')
  })

  it('garde la machine quand la nouvelle marque en a une du même nom', () => {
    const exercise = { ...createExercise('strength'), brand: 'technogym' as const, machine: 'Leg Press' }
    expect(changeExerciseBrand(exercise, 'hammer-strength').machine).toBe('Leg Press')
  })

  it('garde une machine saisie librement en changeant de marque', () => {
    const exercise = { ...createExercise('strength'), brand: 'technogym' as const, machine: 'Presse maison' }
    expect(changeExerciseBrand(exercise, 'other')).toMatchObject({ brand: 'other', machine: 'Presse maison' })
  })
})
