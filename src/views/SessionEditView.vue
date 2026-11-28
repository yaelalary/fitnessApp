<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Exercise, SessionEntry } from '@/domain/types'
import { hasSameTargets, targetsFromEntry } from '@/domain/exerciseDefaults'
import { exerciseFromEntry, hasPendingEntries } from '@/domain/sessions'
import { exercisesMissingFromRoutine, routineItemNote } from '@/domain/routines'
import { findById } from '@/domain/collections'
import { exerciseImageSrc } from '@/domain/images'
import { formatLongDate } from '@/domain/dates'
import { useWorkoutStore } from '@/stores/workout'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useSessionEditor } from '@/composables/useSessionEditor'
import { useConfirm } from '@/composables/useConfirm'
import { useExerciseDefaultsUpdate } from '@/composables/useExerciseDefaultsUpdate'
import AppButton from '@/components/ui/AppButton.vue'
import ConfirmActionDialog from '@/components/ui/ConfirmActionDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import AddExerciseDialog from '@/components/exercises/AddExerciseDialog.vue'
import SessionEntryCard from '@/components/sessions/SessionEntryCard.vue'
import SortableList from '@/components/ui/SortableList.vue'
import RoutineUpdatePrompt from '@/components/sessions/RoutineUpdatePrompt.vue'

const props = defineProps<{ id: string }>()

const router = useRouter()
const workout = useWorkoutStore()
const editor = useSessionEditor(props.id)
const { session, saved, hasUnsavedChanges } = editor
const { busy, error, run } = useAsyncAction()
const pickerOpen = ref(false)
const confirm = useConfirm()
const exerciseDefaults = useExerciseDefaultsUpdate()
const routineUpdate = useAsyncAction()

const routine = computed(() => {
  const routineId = session.value?.routineId
  return routineId ? (findById(workout.routines, routineId) ?? null) : null
})
const missingFromRoutine = computed(() =>
  routine.value && session.value ? exercisesMissingFromRoutine(routine.value, session.value, workout.exercisesById) : [],
)
const missingNames = computed(() => missingFromRoutine.value.map((exercise) => exercise.name))
const showsRoutineUpdate = computed(() => missingFromRoutine.value.length > 0)

function updateRoutine() {
  const current = session.value
  if (current) void routineUpdate.run(() => workout.addSessionExercisesToItsRoutine(current))
}

function exerciseUpdateFor(entry: SessionEntry) {
  const exercise = workout.exercisesById.get(entry.exerciseId)
  if (!exercise) return null
  const upToDate = hasSameTargets(exercise, targetsFromEntry(entry, exercise.defaults))
  return { upToDate, ...exerciseDefaults.stateOf(entry.id) }
}

function applyToExercise(entry: SessionEntry) {
  const exercise = workout.exercisesById.get(entry.exerciseId)
  if (exercise) void exerciseDefaults.apply(entry.id, exercise.id, targetsFromEntry(entry, exercise.defaults))
}

const subtitle = computed(() => (session.value ? formatLongDate(session.value.date) : ''))
const rows = computed(() =>
  (session.value?.entries ?? []).map((entry, index) => {
    const exercise = workout.exercisesById.get(entry.exerciseId) ?? exerciseFromEntry(entry)
    return {
      entry,
      index,
      exercise,
      imageSrc: exerciseImageSrc(exercise, workout.images),
      previous: editor.previousEntryFor(entry.exerciseId),
      routineNote: routineItemNote(routine.value, entry.exerciseId),
      exerciseUpdate: exerciseUpdateFor(entry),
    }
  }),
)
type Row = (typeof rows.value)[number]
const rowKey = (row: Row) => row.entry.id

function moveBy(row: Row, offset: -1 | 1) {
  editor.moveEntry(row.index, row.index + offset)
}
const canCompleteAll = computed(() => (session.value ? hasPendingEntries(session.value) : false))
const discardLabel = computed(() => (saved.value ? 'Annuler les modifications' : 'Abandonner'))
const canDiscard = computed(() => hasUnsavedChanges.value)
const saveLabel = computed(() => (saved.value ? 'Enregistrer' : 'Terminer la séance'))

function fieldValue(event: Event): string {
  return (event.target as HTMLInputElement | HTMLTextAreaElement).value
}

function setTitle(event: Event) {
  editor.update({ title: fieldValue(event) })
}

function setDate(event: Event) {
  const date = fieldValue(event)
  if (date) editor.update({ date })
}

function setNotes(event: Event) {
  editor.update({ notes: fieldValue(event) })
}

function addExercise(exercise: Exercise) {
  editor.addExercise(exercise)
  pickerOpen.value = false
}

async function save() {
  await run(async () => {
    await editor.save()
    await router.push({ name: 'sessions' })
  })
}

async function discard() {
  const confirmed = await confirm.ask({
    title: saved.value ? 'Annuler les modifications ?' : 'Abandonner la séance ?',
    message: 'Les modifications non enregistrées de cette séance seront perdues.',
    confirmLabel: saved.value ? 'Effacer' : 'Abandonner',
    cancelLabel: 'Continuer',
    destructive: true,
  })
  if (!confirmed) return
  editor.discard()
  await router.push({ name: saved.value ? 'sessions' : 'home' })
}

async function remove() {
  const confirmed = await confirm.ask({
    title: 'Supprimer la séance ?',
    message: 'Elle disparaîtra de ton historique et de tes statistiques.',
    confirmLabel: 'Supprimer',
    destructive: true,
  })
  if (!confirmed) return
  await run(async () => {
    await editor.remove()
    await router.push({ name: 'sessions' })
  })
}
</script>

<template>
  <div class="page">
    <EmptyState v-if="!session" icon="history" title="Séance introuvable" message="Elle a peut-être été supprimée.">
      <AppButton :to="{ name: 'sessions' }">Retour à l’historique</AppButton>
    </EmptyState>

    <template v-else>
      <PageHeader :title="session.title" :subtitle="subtitle" :back-to="{ name: 'sessions' }">
        <template v-if="saved" #actions>
          <AppButton variant="ghost" icon="trash" icon-only label="Supprimer la séance" :disabled="busy" @click="remove" />
        </template>
      </PageHeader>

      <div class="grid-2">
        <FormField v-slot="field" label="Titre">
          <input :id="field.id" type="text" :value="session.title" @change="setTitle" />
        </FormField>
        <FormField v-slot="field" label="Date">
          <input :id="field.id" type="date" required :value="session.date" @change="setDate" />
        </FormField>
      </div>

      <EmptyState v-if="rows.length === 0" title="Séance vide" message="Ajoute les exercices au fur et à mesure." />

      <AppButton v-if="canCompleteAll" icon="check" block @click="editor.completeAll">Tout cocher</AppButton>

      <SortableList :items="rows" :item-key="rowKey" @move="editor.moveEntry">
        <template #default="{ item: row }">
          <SessionEntryCard
            :session-id="id"
            :entry="row.entry"
            :exercise="row.exercise"
            :image-src="row.imageSrc"
            :previous="row.previous"
            :routine-note="row.routineNote"
            :exercise-update="row.exerciseUpdate"
            @update="editor.updateEntry"
            @move="moveBy(row, $event)"
            @remove="editor.removeEntry(row.entry.id)"
            @apply-to-exercise="applyToExercise(row.entry)"
          />
        </template>
      </SortableList>

      <AppButton icon="plus" block @click="pickerOpen = true">Ajouter un exercice</AppButton>

      <RoutineUpdatePrompt
        v-if="showsRoutineUpdate && routine"
        :routine-name="routine.name"
        :missing-names="missingNames"
        :busy="routineUpdate.busy.value"
        :error="routineUpdate.error.value"
        @apply="updateRoutine"
      />

      <FormField v-slot="field" label="Notes de séance">
        <textarea
          :id="field.id"
          :value="session.notes"
          placeholder="Forme du jour, sensations…"
          @change="setNotes"
        />
      </FormField>

      <ErrorMessage v-if="error" :message="error" />

      <div class="sticky-actions">
        <AppButton v-if="canDiscard" variant="ghost" :disabled="busy" @click="discard">{{ discardLabel }}</AppButton>
        <AppButton variant="primary" icon="check" :loading="busy" @click="save">{{ saveLabel }}</AppButton>
      </div>
    </template>

    <AddExerciseDialog
      :open="pickerOpen"
      :exercises="workout.exercises"
      :images="workout.images"
      @pick="addExercise"
      @close="pickerOpen = false"
    />

    <ConfirmActionDialog :request="confirm.request.value" @respond="confirm.respond" />
  </div>
</template>
