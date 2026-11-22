import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Exercise, FileChanges, ImageStore, Profile, Routine, Session, WorkoutSnapshot } from '@/domain/types'
import { findById, indexById, removeById, upsertById } from '@/domain/collections'
import { sortExercises } from '@/domain/exercises'
import { removeExerciseFromRoutines } from '@/domain/routines'
import { sortSessionsDesc } from '@/domain/sessions'
import { createProfile, touchProfile } from '@/domain/profiles'
import { planImageChange, releaseImage, storedFileOf, type ImageInput } from '@/domain/images'
import { createId } from '@/domain/ids'
import {
  imagesAfterChanges,
  parseStorageFiles,
  profileFileChanges,
  profileFileName,
  snapshotFileNames,
  snapshotToFiles,
  withoutUnknownDeletions,
} from '@/domain/storageFiles'
import { createGistFileStore, createLocalFileStore, type FileStore } from '@/services/fileStores'
import { createGist } from '@/services/gistApi'
import { useSettingsStore } from './settings'

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

const GIST_DESCRIPTION = 'Carnet muscu — données'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.'
}

export const useWorkoutStore = defineStore('workout', () => {
  const settings = useSettingsStore()
  const profiles = ref<Profile[]>([])
  const images = ref<ImageStore>({})
  const status = ref<LoadStatus>('idle')
  const loadError = ref<string | null>(null)

  const activeProfile = computed(() => findById(profiles.value, settings.activeProfileId ?? '') ?? null)
  const exercises = computed(() => sortExercises(activeProfile.value?.exercises ?? []))
  const exercisesById = computed(() => indexById(exercises.value))
  const routines = computed(() =>
    [...(activeProfile.value?.routines ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  )
  const sessions = computed(() => sortSessionsDesc(activeProfile.value?.sessions ?? []))
  const storageKind = computed<FileStore['kind']>(() => (settings.isGistConnected ? 'gist' : 'local'))

  function fileStore(): FileStore {
    return settings.isGistConnected ? createGistFileStore(settings.gistId, settings.token) : createLocalFileStore()
  }

  function applySnapshot(snapshot: WorkoutSnapshot) {
    profiles.value = snapshot.profiles
    images.value = snapshot.images
    status.value = 'ready'
    loadError.value = null
  }

  async function load() {
    status.value = 'loading'
    loadError.value = null
    try {
      applySnapshot(parseStorageFiles(await fileStore().readAll()))
    } catch (error) {
      loadError.value = errorMessage(error)
      status.value = 'error'
    }
  }

  async function commit(nextProfiles: Profile[], changes: FileChanges) {
    const existing = snapshotFileNames({ profiles: profiles.value, images: images.value })
    const safeChanges = withoutUnknownDeletions(changes, existing)
    await fileStore().write(safeChanges)
    profiles.value = nextProfiles
    images.value = imagesAfterChanges(images.value, safeChanges)
  }

  function requireActiveProfile(): Profile {
    if (!activeProfile.value) throw new Error('Choisis d’abord un profil.')
    return activeProfile.value
  }

  async function updateActiveProfile(update: (profile: Profile) => Profile, extraChanges: FileChanges = {}) {
    const next = touchProfile(update(requireActiveProfile()))
    await commit(upsertById(profiles.value, next), { ...extraChanges, ...profileFileChanges(next) })
  }

  async function saveExercise(exercise: Exercise, imageInput: ImageInput): Promise<Exercise> {
    const previous = findById(requireActiveProfile().exercises, exercise.id)
    const plan = planImageChange(previous?.image ?? null, imageInput, createId())
    const saved: Exercise = { ...exercise, name: exercise.name.trim(), image: plan.imageRef }
    await updateActiveProfile((profile) => ({ ...profile, exercises: upsertById(profile.exercises, saved) }), plan.files)
    return saved
  }

  async function deleteExercise(exerciseId: string) {
    const exercise = findById(requireActiveProfile().exercises, exerciseId)
    await updateActiveProfile(
      (profile) => ({
        ...profile,
        exercises: removeById(profile.exercises, exerciseId),
        routines: removeExerciseFromRoutines(profile.routines, exerciseId),
      }),
      releaseImage(exercise?.image ?? null),
    )
  }

  async function saveRoutine(routine: Routine) {
    const saved = { ...routine, name: routine.name.trim() }
    await updateActiveProfile((profile) => ({ ...profile, routines: upsertById(profile.routines, saved) }))
  }

  async function deleteRoutine(routineId: string) {
    await updateActiveProfile((profile) => ({ ...profile, routines: removeById(profile.routines, routineId) }))
  }

  async function saveSession(session: Session) {
    await updateActiveProfile((profile) => ({ ...profile, sessions: upsertById(profile.sessions, session) }))
  }

  async function deleteSession(sessionId: string) {
    await updateActiveProfile((profile) => ({ ...profile, sessions: removeById(profile.sessions, sessionId) }))
  }

  async function addProfile(name: string): Promise<Profile> {
    const profile = createProfile(name)
    await commit([...profiles.value, profile], profileFileChanges(profile))
    settings.setActiveProfile(profile.id)
    return profile
  }

  async function renameProfile(profileId: string, name: string) {
    const profile = findById(profiles.value, profileId)
    if (!profile) return
    const renamed = touchProfile({ ...profile, name: name.trim() })
    await commit(upsertById(profiles.value, renamed), profileFileChanges(renamed))
  }

  async function deleteProfile(profileId: string) {
    const profile = findById(profiles.value, profileId)
    if (!profile) return
    const imageDeletions = profile.exercises
      .map((exercise) => storedFileOf(exercise.image))
      .filter((fileName): fileName is string => fileName !== null)
      .map((fileName) => [fileName, null] as const)
    await commit(removeById(profiles.value, profileId), {
      [profileFileName(profileId)]: null,
      ...Object.fromEntries(imageDeletions),
    })
    if (settings.activeProfileId === profileId) settings.setActiveProfile(null)
  }

  async function connectGist(gistId: string, token: string) {
    const snapshot = parseStorageFiles(await createGistFileStore(gistId.trim(), token.trim()).readAll())
    settings.setConnection(gistId, token)
    applySnapshot(snapshot)
  }

  async function createGistFromCurrentData(token: string) {
    const files = snapshotToFiles({ profiles: profiles.value, images: images.value })
    const gistId = await createGist(token.trim(), GIST_DESCRIPTION, files)
    settings.setConnection(gistId, token)
    await load()
  }

  async function disconnectGist() {
    settings.clearConnection()
    await load()
  }

  return {
    profiles,
    images,
    status,
    loadError,
    activeProfile,
    exercises,
    exercisesById,
    routines,
    sessions,
    storageKind,
    load,
    saveExercise,
    deleteExercise,
    saveRoutine,
    deleteRoutine,
    saveSession,
    deleteSession,
    addProfile,
    renameProfile,
    deleteProfile,
    connectGist,
    createGistFromCurrentData,
    disconnectGist,
  }
})
