<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryFromRoute, exerciseListRoute } from '@/router/exerciseRoutes'
import type { Exercise } from '@/domain/types'
import type { ImageInput } from '@/domain/images'
import { resolveImageSrc } from '@/domain/images'
import { createExercise } from '@/domain/exercises'
import { useWorkoutStore } from '@/stores/workout'
import { useAsyncAction } from '@/composables/useAsyncAction'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ExerciseForm from '@/components/exercises/ExerciseForm.vue'

const props = defineProps<{ id?: string }>()

const route = useRoute()
const router = useRouter()
const workout = useWorkoutStore()
const { busy, error, run } = useAsyncAction()

const listCategory = categoryFromRoute(route)
const listRoute = exerciseListRoute(listCategory)
const isNew = computed(() => props.id === undefined)
const exercise = computed<Exercise | null>(() =>
  props.id === undefined ? createExercise(listCategory ?? undefined) : (workout.exercisesById.get(props.id) ?? null),
)
const imageSrc = computed(() => resolveImageSrc(exercise.value?.image ?? null, workout.images))
const title = computed(() => (isNew.value ? 'Nouvel exercice' : (exercise.value?.name ?? 'Exercice')))

async function save(draft: Exercise, image: ImageInput) {
  const saved = await run(() => workout.saveExercise(draft, image))
  if (saved) router.push(listRoute)
}

async function remove() {
  if (!exercise.value || !window.confirm(`Supprimer « ${exercise.value.name} » ? Il sera retiré de tes parcours.`)) return
  const exerciseId = exercise.value.id
  await run(async () => {
    await workout.deleteExercise(exerciseId)
    await router.push(listRoute)
  })
}
</script>

<template>
  <div class="page">
    <PageHeader :title="title" :back-to="listRoute" />
    <EmptyState v-if="!exercise" title="Exercice introuvable" message="Il a peut-être été supprimé.">
      <AppButton :to="listRoute">Retour aux exercices</AppButton>
    </EmptyState>
    <ExerciseForm v-else :exercise="exercise" :image-src="imageSrc" :submitting="busy" :error="error" @submit="save">
      <template v-if="!isNew" #secondary-action>
        <AppButton variant="danger" icon="trash" :disabled="busy" @click="remove">Supprimer</AppButton>
      </template>
    </ExerciseForm>
  </div>
</template>
