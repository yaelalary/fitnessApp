<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Exercise } from '@/domain/types'
import { exerciseFromEntry } from '@/domain/sessions'
import { resolveImageSrc } from '@/domain/images'
import { formatLongDate } from '@/domain/dates'
import { useWorkoutStore } from '@/stores/workout'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useSessionEditor } from '@/composables/useSessionEditor'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ExercisePicker from '@/components/exercises/ExercisePicker.vue'
import SessionEntryCard from '@/components/sessions/SessionEntryCard.vue'

const props = defineProps<{ id: string }>()

const router = useRouter()
const workout = useWorkoutStore()
const editor = useSessionEditor(props.id)
const { session, saved, hasUnsavedChanges } = editor
const { busy, error, run } = useAsyncAction()
const pickerOpen = ref(false)

const subtitle = computed(() => (session.value ? formatLongDate(session.value.date) : ''))
const rows = computed(() =>
  (session.value?.entries ?? []).map((entry, index) => {
    const exercise = workout.exercisesById.get(entry.exerciseId) ?? exerciseFromEntry(entry)
    return {
      entry,
      index,
      exercise,
      imageSrc: resolveImageSrc(exercise.image, workout.images),
      previous: editor.previousEntryFor(entry.exerciseId),
    }
  }),
)
const entryCount = computed(() => rows.value.length)
const discardLabel = computed(() => (saved.value ? 'Annuler les modifications' : 'Abandonner'))
const canDiscard = computed(() => hasUnsavedChanges.value)

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
  if (!window.confirm('Les modifications non enregistrées de cette séance seront perdues.')) return
  editor.discard()
  await router.push({ name: saved.value ? 'sessions' : 'home' })
}

async function remove() {
  if (!window.confirm('Supprimer définitivement cette séance ?')) return
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

      <SessionEntryCard
        v-for="row in rows"
        :key="row.entry.id"
        :entry="row.entry"
        :exercise="row.exercise"
        :image-src="row.imageSrc"
        :previous="row.previous"
        :index="row.index"
        :count="entryCount"
        @update="editor.updateEntry"
        @move="editor.moveEntry(row.index, $event)"
        @remove="editor.removeEntry(row.entry.id)"
      />

      <AppButton icon="plus" block @click="pickerOpen = true">Ajouter un exercice</AppButton>

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
        <AppButton variant="primary" icon="check" :loading="busy" @click="save">Enregistrer</AppButton>
      </div>
    </template>

    <AppDialog :open="pickerOpen" title="Ajouter un exercice" @close="pickerOpen = false">
      <ExercisePicker :exercises="workout.exercises" :images="workout.images" @pick="addExercise" />
    </AppDialog>
  </div>
</template>
