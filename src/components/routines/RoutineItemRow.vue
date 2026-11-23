<script setup lang="ts">
import type { Exercise, ExerciseTargets, RoutineItem } from '@/domain/types'
import DragHandle from '@/components/ui/DragHandle.vue'
import RemoveItemButton from '@/components/ui/RemoveItemButton.vue'
import ExerciseSummary from '@/components/exercises/ExerciseSummary.vue'
import TargetsEditor from '@/components/exercises/TargetsEditor.vue'

defineProps<{ item: RoutineItem; exercise: Exercise; imageSrc: string | null; index: number }>()

defineEmits<{ 'update:targets': [targets: ExerciseTargets]; move: [offset: -1 | 1]; remove: [] }>()
</script>

<template>
  <article class="card stack">
    <ExerciseSummary :exercise="exercise" :image-src="imageSrc">
      <span class="numeric step">{{ index + 1 }}</span>
      <DragHandle :item-label="exercise.name" @move="$emit('move', $event)" />
    </ExerciseSummary>
    <TargetsEditor :targets="item.targets" :category="exercise.category" @update:targets="$emit('update:targets', $event)" />
    <RemoveItemButton @remove="$emit('remove')" />
  </article>
</template>

<style scoped>
.step {
  font-size: var(--text-2xl);
  color: var(--color-text-faint);
}
</style>
