<script setup lang="ts">
import type { Exercise, ExerciseTargets, RoutineItem } from '@/domain/types'
import ReorderControls from '@/components/ui/ReorderControls.vue'
import ExerciseSummary from '@/components/exercises/ExerciseSummary.vue'
import TargetsEditor from '@/components/exercises/TargetsEditor.vue'

defineProps<{ item: RoutineItem; exercise: Exercise; imageSrc: string | null; index: number; count: number }>()

defineEmits<{ 'update:targets': [targets: ExerciseTargets]; move: [offset: -1 | 1]; remove: [] }>()
</script>

<template>
  <article class="card stack">
    <ExerciseSummary :exercise="exercise" :image-src="imageSrc">
      <span class="numeric step">{{ index + 1 }}</span>
    </ExerciseSummary>
    <TargetsEditor :targets="item.targets" :category="exercise.category" @update:targets="$emit('update:targets', $event)" />
    <ReorderControls
      class="controls"
      :index="index"
      :count="count"
      :item-label="exercise.name"
      @move="$emit('move', $event)"
      @remove="$emit('remove')"
    />
  </article>
</template>

<style scoped>
.step {
  font-size: var(--text-2xl);
  color: var(--color-text-faint);
}

.controls {
  justify-content: flex-end;
}
</style>
