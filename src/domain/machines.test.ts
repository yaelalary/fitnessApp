import { describe, expect, it } from 'vitest'
import {
  BRAND_ORDER,
  CATALOG_BRANDS,
  CATALOG_ENTRIES,
  catalogLines,
  filterCatalog,
  findCatalogEntry,
  findMachine,
  isBrandId,
  machineImageUrl,
  machineThumbnailUrl,
} from './machines'
import { MACHINE_CATALOG, PREVIOUS_MACHINE_NAMES } from './machineCatalog'
import { exerciseImageSrc, previewImageSrc } from './images'
import { changeExerciseBrand, createExercise, selectCatalogMachine } from './exercises'

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

describe('galerie des machines', () => {
  const all = { brand: null, line: null, query: '' }

  it('liste toutes les machines du catalogue avec leur marque', () => {
    expect(CATALOG_ENTRIES.length).toBe(BRAND_ORDER.reduce((sum, brand) => sum + MACHINE_CATALOG[brand].length, 0))
    expect(CATALOG_BRANDS).toEqual(['technogym', 'hammer-strength', 'free-weights'])
  })

  it('filtre par marque puis par gamme', () => {
    const hammer = filterCatalog(CATALOG_ENTRIES, { ...all, brand: 'hammer-strength' })
    expect(hammer.every((entry) => entry.brand === 'hammer-strength')).toBe(true)
    const benches = filterCatalog(CATALOG_ENTRIES, { ...all, brand: 'hammer-strength', line: 'Bancs' })
    expect(benches.length).toBeGreaterThan(0)
    expect(benches.every((entry) => entry.line === 'Bancs')).toBe(true)
  })

  it('cherche chaque mot dans le nom, la gamme et la marque, sans tenir compte des accents', () => {
    const names = filterCatalog(CATALOG_ENTRIES, { ...all, query: 'hammer  horizontal BENCH' }).map((entry) => entry.name)
    expect(names).toContain('Iso-Lateral Horizontal Bench Press')
    expect(names.every((name) => /horizontal/i.test(name))).toBe(true)
    expect(filterCatalog(CATALOG_ENTRIES, { ...all, query: 'halteres' }).map((entry) => entry.name)).toEqual(['Haltères'])
    expect(filterCatalog(CATALOG_ENTRIES, { ...all, query: 'zzz' })).toEqual([])
  })

  it('donne les gammes d’une marque, sans doublon', () => {
    const lines = catalogLines('hammer-strength')
    expect(lines).toContain('Plate-Loaded')
    expect(new Set(lines).size).toBe(lines.length)
    expect(catalogLines(null)).toEqual([])
  })

  it('retrouve l’entrée d’une machine enregistrée, y compris par son ancien nom et sans marque', () => {
    expect(findCatalogEntry('technogym', 'Leg Press')).toMatchObject({ brand: 'technogym', name: 'Selection 900 Leg Press' })
    expect(findCatalogEntry(null, 'Glute Drive')).toMatchObject({ brand: 'hammer-strength', line: 'Plate-Loaded' })
    expect(findCatalogEntry('technogym', 'Presse maison')).toBeNull()
  })

  it('demande une vignette plus petite aux deux fabricants', () => {
    expect(machineThumbnailUrl('https://webapi-prod.technogym.com/a.jpg?sw=800', 320)).toBe('https://webapi-prod.technogym.com/a.jpg?sw=320')
    expect(machineThumbnailUrl('https://www.lifefitness.com/a.png?width=800', 320)).toBe('https://www.lifefitness.com/a.png?width=320')
    expect(machineThumbnailUrl('https://ailleurs.example/a.png', 320)).toBe('https://ailleurs.example/a.png')
    expect(machineThumbnailUrl(null, 320)).toBeNull()
  })

  it('remplit la marque et la machine en choisissant dans la galerie', () => {
    const entry = findCatalogEntry(null, 'Glute Drive')!
    expect(selectCatalogMachine(createExercise('strength'), entry)).toMatchObject({ brand: 'hammer-strength', machine: 'Glute Drive' })
  })
})

describe('isBrandId', () => {
  it('refuse les propriétés héritées', () => {
    expect(isBrandId('technogym')).toBe(true)
    expect(isBrandId('toString')).toBe(false)
    expect(isBrandId('constructor')).toBe(false)
  })
})