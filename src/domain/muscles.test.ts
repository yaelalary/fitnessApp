import { describe, expect, it } from 'vitest'
import {
  MUSCLE_GROUPS,
  describeMuscles,
  muscleLabel,
  muscleOptionGroups,
  musclesFromLegacyText,
  normalizeMuscles,
} from './muscles'
import { createExercise } from './exercises'
import { createProfile } from './profiles'
import { parseStorageFiles, profileFileChanges, profileFileName } from './storageFiles'

describe('liste des muscles', () => {
  it('n’a pas deux fois le même identifiant ni le même libellé', () => {
    const options = MUSCLE_GROUPS.flatMap((group) => group.options)
    expect(new Set(options.map((option) => option.value)).size).toBe(options.length)
    expect(new Set(options.map((option) => option.label)).size).toBe(options.length)
  })

  it('n’utilise pas de virgule dans les libellés, réservée à l’ancien format', () => {
    const labels = MUSCLE_GROUPS.flatMap((group) => group.options.map((option) => option.label))
    expect(labels.filter((label) => label.includes(','))).toEqual([])
  })

  it('affiche les libellés et garde tel quel un muscle saisi à la main', () => {
    expect(muscleLabel('lats')).toBe('Grand dorsal')
    expect(muscleLabel('Dos')).toBe('Dos')
    expect(describeMuscles(['lats', 'biceps', 'Dos'])).toBe('Grand dorsal, Biceps, Dos')
  })
})

describe('reprise de l’ancien groupe musculaire', () => {
  it('rattache les anciens libellés aux nouveaux muscles, sans tenir compte des accents', () => {
    expect(musclesFromLegacyText('Pectoraux')).toEqual(['chest'])
    expect(musclesFromLegacyText('ischio-jambiers')).toEqual(['hamstrings'])
    expect(musclesFromLegacyText('Trapezes')).toEqual(['traps'])
  })

  it('garde un ancien groupe trop large ou un texte libre plutôt que de le perdre', () => {
    expect(musclesFromLegacyText('Épaules')).toEqual(['Épaules'])
    expect(musclesFromLegacyText('Dos')).toEqual(['Dos'])
    expect(musclesFromLegacyText('  ')).toEqual([])
  })

  it('lit une liste séparée par des virgules', () => {
    expect(musclesFromLegacyText('Grand dorsal, Biceps, Grand dorsal')).toEqual(['lats', 'biceps'])
  })

  it('préfère la nouvelle liste quand elle existe', () => {
    expect(normalizeMuscles(['lats', 'lats', ' ', 3], 'Pectoraux')).toEqual(['lats'])
    expect(normalizeMuscles(undefined, 'Pectoraux')).toEqual(['chest'])
    expect(normalizeMuscles(undefined, undefined)).toEqual([])
  })
})

describe('choix des muscles', () => {
  it('ajoute un groupe « Autres » pour les muscles hors liste déjà choisis', () => {
    expect(muscleOptionGroups(['lats'])).toHaveLength(MUSCLE_GROUPS.length)
    const groups = muscleOptionGroups(['lats', 'Dos'])
    expect(groups.at(-1)).toEqual({ label: 'Autres', options: [{ value: 'Dos', label: 'Dos' }] })
  })
})

describe('muscles dans le gist', () => {
  const exercise = { ...createExercise('strength'), id: 'e', name: 'Tirage', muscles: ['lats', 'biceps', 'Dos'] }
  const profile = { ...createProfile('Alex'), id: 'alex', exercises: [exercise] }
  const fileName = profileFileName('alex')

  it('fait l’aller-retour sans perte', () => {
    const files = profileFileChanges(profile) as Record<string, string>
    expect(parseStorageFiles(files).profiles[0].exercises[0].muscles).toEqual(['lats', 'biceps', 'Dos'])
  })

  it('écrit aussi l’ancien champ, lisible par une version précédente de l’app', () => {
    const saved = JSON.parse((profileFileChanges(profile) as Record<string, string>)[fileName])
    expect(saved.exercises[0].muscleGroup).toBe('Grand dorsal, Biceps, Dos')
  })

  it('retrouve les muscles si une ancienne version a réenregistré le profil sans la nouvelle liste', () => {
    const saved = JSON.parse((profileFileChanges(profile) as Record<string, string>)[fileName])
    delete saved.exercises[0].muscles
    const parsed = parseStorageFiles({ [fileName]: JSON.stringify(saved) })
    expect(parsed.profiles[0].exercises[0].muscles).toEqual(['lats', 'biceps', 'Dos'])
  })

  it('migre un exercice enregistré avec l’ancien format', () => {
    const legacy = { id: 'alex', name: 'Alex', exercises: [{ id: 'x', name: 'Pompes', muscleGroup: 'Pectoraux' }] }
    const parsed = parseStorageFiles({ [fileName]: JSON.stringify(legacy) })
    expect(parsed.profiles[0].exercises[0].muscles).toEqual(['chest'])
  })
})
