<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CategoryId, Exercise, ImageStore } from '@/domain/types'
import { describeTargets, filterExercises } from '@/domain/exercises'
import { exerciseImageSrc } from '@/domain/images'
import AppButton from '@/components/ui/AppButton.vue'
import PickButton from '@/components/ui/PickButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ExerciseFilters from './ExerciseFilters.vue'
import ExerciseSummary from './ExerciseSummary.vue'

const props = defineProps<{ exercises: Exercise[]; images: ImageStore }>()
const emit = defineEmits<{ pick: [exercise: Exercise]; create: [name: string] }>()

const category = ref<CategoryId | null>(null)
const query = ref('')

const rows = computed(() =>
  filterExercises(props.exercises, category.value, query.value).map((exercise) => ({
    exercise,
    imageSrc: exerciseImageSrc(exercise, props.images),
    detail: describeTargets(exercise.defaults, exercise.category),
  })),
)
const createLabel = computed(() => (query.value.trim() ? `Créer « ${query.value.trim()} »` : 'Nouvel exercice'))

function create() {
  emit('create', query.value.trim())
}
</script>

<template>
  <div class="stack">
    <ExerciseFilters v-model:category="category" v-model:query="query" />
    <AppButton icon="plus" block @click="create">{{ createLabel }}</AppButton>
    <EmptyState v-if="exercises.length === 0" title="Aucun exercice" message="Crée ton premier exercice avec le bouton ci-dessus." />
    <p v-else-if="rows.length === 0" class="muted">Aucun exercice ne correspond.</p>
    <ul v-else class="stack">
      <li v-for="row in rows" :key="row.exercise.id">
        <PickButton @pick="emit('pick', row.exercise)">
          <ExerciseSummary class="picked" :exercise="row.exercise" :image-src="row.imageSrc" :detail="row.detail" />
        </PickButton>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.picked {
  flex: 1;
}
</style>
