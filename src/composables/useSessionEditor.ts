import { computed, ref, watch } from 'vue'
import type { Exercise, Session, SessionEntry } from '@/domain/types'
import { cloneData, findById, moveItem, removeById, upsertById } from '@/domain/collections'
import { createEntry, findLastEntry } from '@/domain/sessions'
import { clearSessionDraft, loadSessionDraft, saveSessionDraft } from '@/services/sessionDrafts'
import { useWorkoutStore } from '@/stores/workout'

export function useSessionEditor(sessionId: string) {
  const workout = useWorkoutStore()
  const profileId = workout.activeProfile?.id ?? ''

  const saved = computed(() => findById(workout.sessions, sessionId) ?? null)
  const initialDraft = loadSessionDraft(profileId, sessionId)
  const session = ref<Session | null>(initialDraft ?? (saved.value ? cloneData(saved.value) : null))
  const hasUnsavedChanges = ref(initialDraft !== null)

  watch(
    session,
    (current) => {
      if (!current) return
      saveSessionDraft(profileId, current)
      hasUnsavedChanges.value = true
    },
    { deep: true },
  )

  function update(changes: Partial<Session>) {
    if (session.value) session.value = { ...session.value, ...changes }
  }

  function updateEntry(entry: SessionEntry) {
    if (session.value) update({ entries: upsertById(session.value.entries, entry) })
  }

  function removeEntry(entryId: string) {
    if (session.value) update({ entries: removeById(session.value.entries, entryId) })
  }

  function moveEntry(fromIndex: number, toIndex: number) {
    if (session.value) update({ entries: moveItem(session.value.entries, fromIndex, toIndex) })
  }

  function addExercise(exercise: Exercise) {
    if (!session.value) return
    const previous = findLastEntry(workout.sessions, exercise.id, sessionId)
    update({ entries: [...session.value.entries, createEntry(exercise, exercise.defaults, previous)] })
  }

  function previousEntryFor(exerciseId: string): SessionEntry | null {
    return findLastEntry(workout.sessions, exerciseId, sessionId)
  }

  async function save() {
    if (!session.value) return
    await workout.saveSession(session.value)
    clearSessionDraft(profileId, sessionId)
    hasUnsavedChanges.value = false
  }

  function discard() {
    clearSessionDraft(profileId, sessionId)
    hasUnsavedChanges.value = false
  }

  async function remove() {
    if (saved.value) await workout.deleteSession(sessionId)
    discard()
  }

  return {
    session,
    saved,
    hasUnsavedChanges,
    update,
    updateEntry,
    removeEntry,
    moveEntry,
    addExercise,
    previousEntryFor,
    save,
    discard,
    remove,
  }
}
