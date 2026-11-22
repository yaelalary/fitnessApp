import { useRouter } from 'vue-router'
import type { Routine, Session } from '@/domain/types'
import { createEmptySession, createSessionFromRoutine } from '@/domain/sessions'
import { saveSessionDraft } from '@/services/sessionDrafts'
import { useWorkoutStore } from '@/stores/workout'

export function useSessionLauncher() {
  const router = useRouter()
  const workout = useWorkoutStore()

  function open(session: Session) {
    const profile = workout.activeProfile
    if (!profile) return
    saveSessionDraft(profile.id, session)
    router.push({ name: 'session', params: { id: session.id } })
  }

  function startFromRoutine(routine: Routine) {
    open(createSessionFromRoutine(routine, workout.exercisesById, workout.sessions))
  }

  function startEmpty() {
    open(createEmptySession())
  }

  return { startFromRoutine, startEmpty }
}
