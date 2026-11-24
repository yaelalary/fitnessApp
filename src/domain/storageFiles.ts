import type { FileChanges, Profile, WorkoutSnapshot } from './types'
import { isImageFileName } from './images'
import { normalizeProfile, serializeProfile } from './profiles'

const PROFILE_FILE_PREFIX = 'profile-'
const PROFILE_FILE_SUFFIX = '.json'

export const README_FILE_NAME = 'carnet-muscu.md'
export const README_CONTENT =
  '# Carnet muscu\n\nDonnées de l’application Carnet muscu. Un fichier `profile-*.json` par profil, un fichier `image-*.txt` par photo de machine.\n'

export function profileFileName(profileId: string): string {
  return `${PROFILE_FILE_PREFIX}${profileId}${PROFILE_FILE_SUFFIX}`
}

function isProfileFileName(fileName: string): boolean {
  return fileName.startsWith(PROFILE_FILE_PREFIX) && fileName.endsWith(PROFILE_FILE_SUFFIX)
}

function parseProfile(content: string): Profile | null {
  try {
    return normalizeProfile(JSON.parse(content))
  } catch {
    return null
  }
}

export function parseStorageFiles(files: Readonly<Record<string, string>>): WorkoutSnapshot {
  const entries = Object.entries(files)
  const profiles = entries
    .filter(([name]) => isProfileFileName(name))
    .map(([, content]) => parseProfile(content))
    .filter((profile): profile is Profile => profile !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  const images = Object.fromEntries(entries.filter(([name]) => isImageFileName(name)))
  return { profiles, images }
}

export function profileFileChanges(profile: Profile): FileChanges {
  return { [profileFileName(profile.id)]: serializeProfile(profile) }
}

export function snapshotToFiles(snapshot: WorkoutSnapshot): Record<string, string> {
  const profileFiles = Object.fromEntries(
    snapshot.profiles.map((profile) => [profileFileName(profile.id), serializeProfile(profile)]),
  )
  return { [README_FILE_NAME]: README_CONTENT, ...profileFiles, ...snapshot.images }
}

export function applyFileChanges(files: Readonly<Record<string, string>>, changes: FileChanges): Record<string, string> {
  const next = { ...files }
  for (const [name, content] of Object.entries(changes)) {
    if (content === null) delete next[name]
    else next[name] = content
  }
  return next
}

export function withoutUnknownDeletions(changes: FileChanges, existingFiles: ReadonlySet<string>): FileChanges {
  return Object.fromEntries(
    Object.entries(changes).filter(([name, content]) => content !== null || existingFiles.has(name)),
  )
}

export function snapshotFileNames(snapshot: WorkoutSnapshot): Set<string> {
  return new Set([...snapshot.profiles.map((profile) => profileFileName(profile.id)), ...Object.keys(snapshot.images)])
}

export function imagesAfterChanges(images: Readonly<Record<string, string>>, changes: FileChanges): Record<string, string> {
  const imageChanges = Object.fromEntries(Object.entries(changes).filter(([name]) => isImageFileName(name)))
  return applyFileChanges(images, imageChanges)
}
