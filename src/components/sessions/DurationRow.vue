<script setup lang="ts">
import type { SessionEntry } from '@/domain/types'
import type { CategoryConfig } from '@/domain/categories'
import DurationInput from '@/components/ui/DurationInput.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'
import CheckableRow from './CheckableRow.vue'

const DISTANCE_STEP_KM = 0.1

defineProps<{ entry: SessionEntry; config: CategoryConfig }>()
defineEmits<{ update: [patch: Partial<SessionEntry>] }>()
</script>

<template>
  <CheckableRow :done="entry.done" label="Exercice fait" @update:done="$emit('update', { done: $event })">
    <DurationInput
      compact
      label="la durée"
      :model-value="entry.durationMinutes"
      @update:model-value="$emit('update', { durationMinutes: $event })"
    />
    <NumberStepper
      v-if="config.usesDistance"
      compact
      label="la distance"
      unit="km"
      :step="DISTANCE_STEP_KM"
      :max="200"
      :model-value="entry.distanceKm"
      @update:model-value="$emit('update', { distanceKm: $event })"
    />
  </CheckableRow>
</template>
