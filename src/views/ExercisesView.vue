<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CategoryId } from '@/domain/types'
import { categoryFromRoute, editExerciseRoute, exerciseListRoute, newExerciseRoute } from '@/router/exerciseRoutes'
import { describeTargets, filterExercises } from '@/domain/exercises'
import { exerciseImageSrc } from '@/domain/images'
import { useWorkoutStore } from '@/stores/workout'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ExerciseFilters from '@/components/exercises/ExerciseFilters.vue'
import ExerciseSummary from '@/components/exercises/ExerciseSummary.vue'

const route = useRoute()
const router = useRouter()
const workout = useWorkoutStore()
const query = ref('')

const category = computed<CategoryId | null>({
  get: () => categoryFromRoute(route),
  set: (value) => void router.replace(exerciseListRoute(value)),
})
const newRoute = computed(() => newExerciseRoute(category.value))

const rows = computed(() =>
  filterExercises(workout.exercises, category.value, query.value).map((exercise) => ({
    exercise,
    to: editExerciseRoute(exercise.id, category.value),
    imageSrc: exerciseImageSrc(exercise, workout.images),
    detail: describeTargets(exercise.defaults, exercise.category),
  })),
)
</script>

<template>
  <div class="page">
    <PageHeader title="Exercices" subtitle="Ta bibliothèque">
      <template #actions>
        <AppButton :to="newRoute" variant="primary" icon="plus">Nouveau</AppButton>
      </template>
    </PageHeader>

    <EmptyState
      v-if="workout.exercises.length === 0"
      title="Aucun exercice"
      message="Ajoute tes machines Technogym, Hammer Strength, tes échauffements, étirements et ton cardio."
    >
      <AppButton :to="newRoute" variant="primary" icon="plus">Créer un exercice</AppButton>
    </EmptyState>

    <template v-else>
      <ExerciseFilters v-model:category="category" v-model:query="query" />
      <p v-if="rows.length === 0" class="muted">Aucun exercice ne correspond.</p>
      <ul class="stack">
        <li v-for="row in rows" :key="row.exercise.id">
          <RouterLink :to="row.to" class="card card-link">
            <ExerciseSummary :exercise="row.exercise" :image-src="row.imageSrc" :detail="row.detail" />
          </RouterLink>
        </li>
      </ul>
    </template>
  </div>
</template>
