import { describe, expect, it } from 'vitest'
import { planImageChange, releaseImage, resolveImageSrc } from './images'
import {
  applyFileChanges,
  imagesAfterChanges,
  parseStorageFiles,
  profileFileChanges,
  profileFileName,
  README_FILE_NAME,
  snapshotFileNames,
  snapshotToFiles,
  withoutUnknownDeletions,
} from './storageFiles'
import { createProfile, normalizeProfile, validateProfileName } from './profiles'

describe('planImageChange', () => {
  it('ne change rien quand on garde l’image', () => {
    expect(planImageChange('gist:image-a.txt', { kind: 'keep' }, 'b')).toEqual({ imageRef: 'gist:image-a.txt', files: {} })
  })

  it('remplace une photo stockée et supprime l’ancienne', () => {
    expect(planImageChange('gist:image-a.txt', { kind: 'upload', dataUrl: 'data:x' }, 'b')).toEqual({
      imageRef: 'gist:image-b.txt',
      files: { 'image-a.txt': null, 'image-b.txt': 'data:x' },
    })
  })

  it('passe à une URL sans fichier à écrire', () => {
    expect(planImageChange(null, { kind: 'url', url: ' https://x.fr/a.jpg ' }, 'b')).toEqual({
      imageRef: 'https://x.fr/a.jpg',
      files: {},
    })
  })

  it('libère le fichier quand on retire l’image', () => {
    expect(planImageChange('gist:image-a.txt', { kind: 'none' }, 'b')).toEqual({ imageRef: null, files: { 'image-a.txt': null } })
    expect(releaseImage('https://x.fr/a.jpg')).toEqual({})
  })
})

describe('resolveImageSrc', () => {
  it('résout les fichiers stockés et les URL', () => {
    const images = { 'image-a.txt': 'data:image/jpeg;base64,AAA' }
    expect(resolveImageSrc('gist:image-a.txt', images)).toBe('data:image/jpeg;base64,AAA')
    expect(resolveImageSrc('https://x.fr/a.jpg', images)).toBe('https://x.fr/a.jpg')
    expect(resolveImageSrc('javascript:alert(1)', images)).toBeNull()
    expect(resolveImageSrc('gist:image-missing.txt', images)).toBeNull()
  })
})

describe('fichiers de stockage', () => {
  const alex = { ...createProfile('Alex'), id: 'alex' }
  const sam = { ...createProfile('Sam'), id: 'sam' }

  it('fait un aller-retour profils + images', () => {
    const files = snapshotToFiles({ profiles: [sam, alex], images: { 'image-a.txt': 'data:a' } })
    expect(files[README_FILE_NAME]).toBeDefined()
    const parsed = parseStorageFiles(files)
    expect(parsed.profiles.map((profile) => profile.id)).toEqual(['alex', 'sam'])
    expect(parsed.images).toEqual({ 'image-a.txt': 'data:a' })
  })

  it('ignore les fichiers illisibles', () => {
    const parsed = parseStorageFiles({ [profileFileName('x')]: '{pas du json', 'profile-y.json': '{"nope":1}' })
    expect(parsed.profiles).toEqual([])
  })

  it('ne demande pas la suppression de fichiers inexistants', () => {
    const existing = snapshotFileNames({ profiles: [alex], images: { 'image-a.txt': 'x' } })
    expect(withoutUnknownDeletions({ 'image-a.txt': null, 'image-z.txt': null, 'image-n.txt': 'y' }, existing)).toEqual({
      'image-a.txt': null,
      'image-n.txt': 'y',
    })
  })

  it('applique créations et suppressions', () => {
    const files = { a: '1', b: '2' }
    expect(applyFileChanges(files, { a: null, c: '3' })).toEqual({ b: '2', c: '3' })
    expect(imagesAfterChanges({ 'image-a.txt': 'x' }, { ...profileFileChanges(alex), 'image-a.txt': null, 'image-b.txt': 'y' })).toEqual({
      'image-b.txt': 'y',
    })
  })
})

describe('normalizeProfile', () => {
  it('complète les champs manquants d’un ancien format', () => {
    const profile = normalizeProfile({
      id: 'p',
      name: 'Alex',
      exercises: [{ id: 'e', name: 'Squat', category: 'inconnue', defaults: { sets: '4' } }],
      sessions: [{ id: 's', entries: [] }],
    })
    expect(profile?.exercises[0]).toMatchObject({ category: 'strength', brand: null, image: null, defaults: { sets: 4, reps: 0, weightKg: 0 } })
    expect(profile?.routines).toEqual([])
    expect(profile?.sessions).toEqual([])
  })

  it('garde l’état coché des exercices et le met à faux sur les anciennes séances', () => {
    const profile = normalizeProfile({
      id: 'p',
      name: 'Alex',
      sessions: [{ id: 's', date: '2026-11-20', entries: [{ id: 'a', category: 'cardio', done: true }, { id: 'b', category: 'cardio' }] }],
    })
    expect(profile?.sessions[0].entries.map((entry) => entry.done)).toEqual([true, false])
  })

  it('rejette un profil sans identifiant', () => {
    expect(normalizeProfile({ name: 'x' })).toBeNull()
  })
})

describe('validateProfileName', () => {
  it('refuse un nom vide ou déjà pris', () => {
    const others = [createProfile('Alex')]
    expect(validateProfileName('  ', others)).toBeDefined()
    expect(validateProfileName('alex', others)).toBeDefined()
    expect(validateProfileName('Sam', others)).toBeUndefined()
  })
})
