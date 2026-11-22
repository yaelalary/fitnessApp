<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CategoryId, Exercise, ImageStore } from '@/domain/types'
import { describeTargets, filterExercises } from '@/domain/exercises'
import { resolveImageSrc } from '@/domain/images'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ExerciseFilters from './ExerciseFilters.vue'
import ExerciseSummary from './ExerciseSummary.vue'

const props = defineProps<{ exercises: Exercise[]; images: ImageStore }>()
defineEmits<{ pick: [exercise: Exercise] }>()

const category = ref<CategoryId | null>(null)
const query = ref('')

const rows = computed(() =>
  filterExercises(props.exercises, category.value, query.value).map((exercise) => ({
    exercise,
    imageSrc: resolveImageSrc(exercise.image, props.images),
    detail: describeTargets(exercise.defaults, exercise.category),
  })),
)
</script>

<template>
  <div class="stack">
    <ExerciseFilters v-model:category="category" v-model:query="query" />
    <EmptyState v-if="exercises.length === 0" title="Aucun exercice" message="Crée d’abord tes exercices dans l’onglet Exercices.">
      <AppButton :to="{ name: 'exercise-new' }" variant="primary" icon="plus">Nouvel exercice</AppButton>
    </EmptyState>
    <p v-else-if="rows.length === 0" class="muted">Aucun exercice ne correspond.</p>
    <ul v-else class="stack">
      <li v-for="row in rows" :key="row.exercise.id">
        <button type="button" class="pick" @click="$emit('pick', row.exercise)">
          <ExerciseSummary :exercise="row.exercise" :image-src="row.imageSrc" :detail="row.detail" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.pick {
  width: 100%;
  padding: var(--space-2);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
}

.pick:hover {
  border-color: var(--color-border-strong);
}
</style>
