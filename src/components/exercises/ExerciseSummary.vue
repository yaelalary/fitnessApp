<script setup lang="ts">
import { computed } from 'vue'
import type { Exercise } from '@/domain/types'
import { describeEquipment } from '@/domain/exercises'
import CategoryBadge from './CategoryBadge.vue'
import ExerciseThumb from './ExerciseThumb.vue'

const props = withDefaults(defineProps<{ exercise: Exercise; imageSrc: string | null; detail?: string }>(), { detail: '' })

const equipment = computed(() => describeEquipment(props.exercise))
</script>

<template>
  <div class="summary">
    <ExerciseThumb :src="imageSrc" :alt="exercise.machine || exercise.name" size="sm" />
    <div class="summary__text">
      <p class="summary__name truncate">{{ exercise.name }}</p>
      <p v-if="equipment" class="muted small truncate">{{ equipment }}</p>
      <div class="cluster">
        <CategoryBadge :category="exercise.category" />
        <span v-if="detail" class="muted small">{{ detail }}</span>
      </div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.summary__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.summary__name {
  font-weight: var(--weight-semibold);
}
</style>
