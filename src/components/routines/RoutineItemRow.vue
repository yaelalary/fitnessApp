<script setup lang="ts">
import type { Exercise, ExerciseTargets, RoutineItem } from '@/domain/types'
import DragHandle from '@/components/ui/DragHandle.vue'
import NoteField from '@/components/ui/NoteField.vue'
import RemoveItemButton from '@/components/ui/RemoveItemButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import ApplyToExerciseButton, { type ExerciseUpdateProps } from '@/components/exercises/ApplyToExerciseButton.vue'
import ExerciseSummary from '@/components/exercises/ExerciseSummary.vue'
import TargetsEditor from '@/components/exercises/TargetsEditor.vue'

defineProps<{ item: RoutineItem; exercise: Exercise; imageSrc: string | null; index: number; exerciseUpdate: ExerciseUpdateProps }>()

defineEmits<{
  'update:targets': [targets: ExerciseTargets]
  'update:notes': [notes: string]
  move: [offset: -1 | 1]
  remove: []
  'apply-to-exercise': []
}>()
</script>

<template>
  <article class="card stack">
    <ExerciseSummary :exercise="exercise" :image-src="imageSrc">
      <span class="numeric step">{{ index + 1 }}</span>
      <DragHandle :item-label="exercise.name" @move="$emit('move', $event)" />
    </ExerciseSummary>
    <TargetsEditor :targets="item.targets" :category="exercise.category" :settings="exercise.settings" @update:targets="$emit('update:targets', $event)" />
    <NoteField
      :model-value="item.notes"
      placeholder="Une consigne pour cet exercice…"
      @update:model-value="$emit('update:notes', $event)"
    />
    <ErrorMessage v-if="exerciseUpdate.error" :message="exerciseUpdate.error" />
    <RemoveItemButton @remove="$emit('remove')">
      <ApplyToExerciseButton :up-to-date="exerciseUpdate.upToDate" :busy="exerciseUpdate.busy" @apply="$emit('apply-to-exercise')" />
    </RemoveItemButton>
  </article>
</template>

<style scoped>
.step {
  font-size: var(--text-2xl);
  color: var(--color-text-faint);
}
</style>
