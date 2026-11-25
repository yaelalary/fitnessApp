<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryFromRoute, exerciseListRoute } from '@/router/exerciseRoutes'
import { resolveImageSrc } from '@/domain/images'
import { createExercise } from '@/domain/exercises'
import { useWorkoutStore } from '@/stores/workout'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useExerciseEditor } from '@/composables/useExerciseEditor'
import { useLeaveGuard } from '@/composables/useLeaveGuard'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import UnsavedChangesDialog from '@/components/ui/UnsavedChangesDialog.vue'
import ExerciseForm from '@/components/exercises/ExerciseForm.vue'

const props = defineProps<{ id?: string }>()

const route = useRoute()
const router = useRouter()
const workout = useWorkoutStore()
const { busy, error, run } = useAsyncAction()

const listCategory = categoryFromRoute(route)
const listRoute = exerciseListRoute(listCategory)
const isNew = props.id === undefined
const existing = props.id === undefined ? null : (workout.exercisesById.get(props.id) ?? null)
const notFound = !isNew && existing === null
const editor = useExerciseEditor(existing ?? createExercise(listCategory ?? undefined))
const { draft, image, errors } = editor

const imageSrc = computed(() => resolveImageSrc(existing?.image ?? null, workout.images))
const title = computed(() => (isNew ? 'Nouvel exercice' : (existing?.name ?? 'Exercice')))

async function persist(): Promise<boolean> {
  return (await run(() => editor.save())) === true
}

const leaveGuard = useLeaveGuard({ isDirty: () => editor.isDirty.value, save: persist })

async function save() {
  if (!(await persist())) return
  leaveGuard.allowLeave()
  await router.push(listRoute)
}

async function remove() {
  if (!existing || !window.confirm(`Supprimer « ${existing.name} » ? Il sera retiré de tes parcours.`)) return
  await run(async () => {
    await workout.deleteExercise(existing.id)
    leaveGuard.allowLeave()
    await router.push(listRoute)
  })
}
</script>

<template>
  <div class="page">
    <PageHeader :title="title" :back-to="listRoute" />
    <EmptyState v-if="notFound" title="Exercice introuvable" message="Il a peut-être été supprimé.">
      <AppButton :to="listRoute">Retour aux exercices</AppButton>
    </EmptyState>
    <ExerciseForm
      v-else
      v-model:draft="draft"
      v-model:image="image"
      :errors="errors"
      :image-src="imageSrc"
      :submitting="busy"
      :error="error"
      @submit="save"
    >
      <template v-if="!isNew" #secondary-action>
        <AppButton variant="danger" icon="trash" :disabled="busy" @click="remove">Supprimer</AppButton>
      </template>
    </ExerciseForm>

    <UnsavedChangesDialog
      :open="leaveGuard.open.value"
      :can-save="leaveGuard.canSave"
      :saving="leaveGuard.saving.value"
      @choose="leaveGuard.choose"
    />
  </div>
</template>
