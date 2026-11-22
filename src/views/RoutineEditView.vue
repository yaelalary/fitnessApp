<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Exercise, ExerciseTargets, Routine } from '@/domain/types'
import { createRoutine, createRoutineItem, validateRoutine, type RoutineField } from '@/domain/routines'
import { cloneData, findById, moveItem, removeById } from '@/domain/collections'
import { exerciseImageSrc } from '@/domain/images'
import { hasErrors, type ValidationErrors } from '@/domain/validation'
import { useWorkoutStore } from '@/stores/workout'
import { useAsyncAction } from '@/composables/useAsyncAction'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ExercisePicker from '@/components/exercises/ExercisePicker.vue'
import RoutineItemRow from '@/components/routines/RoutineItemRow.vue'

const props = defineProps<{ id?: string }>()

const router = useRouter()
const workout = useWorkoutStore()
const { busy, error, run } = useAsyncAction()

const existing = props.id === undefined ? null : (findById(workout.routines, props.id) ?? null)
const notFound = props.id !== undefined && existing === null
const draft = ref<Routine>(existing ? cloneData(existing) : createRoutine())
const errors = ref<ValidationErrors<RoutineField>>({})
const pickerOpen = ref(false)

const title = computed(() => (existing ? existing.name : 'Nouveau parcours'))
const rows = computed(() =>
  draft.value.items.flatMap((item, index) => {
    const exercise = workout.exercisesById.get(item.exerciseId)
    if (!exercise) return []
    return [{ item, index, exercise, imageSrc: exerciseImageSrc(exercise, workout.images) }]
  }),
)

function addExercise(exercise: Exercise) {
  draft.value.items = [...draft.value.items, createRoutineItem(exercise)]
  errors.value.items = undefined
  pickerOpen.value = false
}

function updateTargets(itemId: string, targets: ExerciseTargets) {
  draft.value.items = draft.value.items.map((item) => (item.id === itemId ? { ...item, targets } : item))
}

function move(index: number, offset: -1 | 1) {
  draft.value.items = moveItem(draft.value.items, index, index + offset)
}

function removeItem(itemId: string) {
  draft.value.items = removeById(draft.value.items, itemId)
}

async function save() {
  errors.value = validateRoutine(draft.value)
  if (hasErrors(errors.value)) return
  await run(async () => {
    await workout.saveRoutine(draft.value)
    await router.push({ name: 'routines' })
  })
}

async function remove() {
  if (!existing || !window.confirm(`Supprimer le parcours « ${existing.name} » ? Tes séances passées sont conservées.`)) return
  await run(async () => {
    await workout.deleteRoutine(existing.id)
    await router.push({ name: 'routines' })
  })
}
</script>

<template>
  <div class="page">
    <PageHeader :title="title" :back-to="{ name: 'routines' }" />

    <EmptyState v-if="notFound" icon="route" title="Parcours introuvable" message="Il a peut-être été supprimé.">
      <AppButton :to="{ name: 'routines' }">Retour aux parcours</AppButton>
    </EmptyState>

    <form v-else class="stack-lg" novalidate @submit.prevent="save">
      <FormField v-slot="field" label="Nom du parcours" :error="errors.name">
        <input
          :id="field.id"
          v-model="draft.name"
          type="text"
          placeholder="Haut du corps, Jambes, Full body…"
          :aria-describedby="field.describedBy"
          :aria-invalid="field.invalid"
        />
      </FormField>

      <section class="stack">
        <h2 class="section-title">Exercices</h2>
        <EmptyState v-if="rows.length === 0" title="Parcours vide" message="Ajoute les exercices dans l’ordre où tu les fais." />
        <RoutineItemRow
          v-for="row in rows"
          :key="row.item.id"
          :item="row.item"
          :exercise="row.exercise"
          :image-src="row.imageSrc"
          :index="row.index"
          :count="draft.items.length"
          @update:targets="updateTargets(row.item.id, $event)"
          @move="move(row.index, $event)"
          @remove="removeItem(row.item.id)"
        />
        <ErrorMessage v-if="errors.items" :message="errors.items" />
        <AppButton icon="plus" block @click="pickerOpen = true">Ajouter un exercice</AppButton>
      </section>

      <FormField v-slot="field" label="Notes">
        <textarea :id="field.id" v-model="draft.notes" />
      </FormField>

      <ErrorMessage v-if="error" :message="error" />

      <div class="sticky-actions">
        <AppButton v-if="existing" variant="danger" icon="trash" :disabled="busy" @click="remove">Supprimer</AppButton>
        <AppButton type="submit" variant="primary" icon="check" :loading="busy">Enregistrer</AppButton>
      </div>
    </form>

    <AppDialog :open="pickerOpen" title="Ajouter un exercice" @close="pickerOpen = false">
      <ExercisePicker :exercises="workout.exercises" :images="workout.images" @pick="addExercise" />
    </AppDialog>
  </div>
</template>
