<script setup lang="ts">
import { computed } from 'vue'
import type { SetTarget } from '@/domain/types'
import { WEIGHT_STEP_KG, type CategoryConfig } from '@/domain/categories'
import { setLabels } from '@/domain/setNouns'
import NumberStepper from '@/components/ui/NumberStepper.vue'

const props = withDefaults(defineProps<{ set: SetTarget; number: number; config: CategoryConfig; requireReps?: boolean }>(), {
  requireReps: false,
})
const emit = defineEmits<{ update: [patch: Partial<SetTarget>] }>()

const labels = computed(() => setLabels(props.config.setNoun, props.config.repsLabel, props.number))
const minReps = computed(() => (props.requireReps && !props.config.repsOptional ? 1 : 0))
</script>

<template>
  <div class="set-fields">
    <NumberStepper
      compact
      :label="labels.reps"
      :unit="config.repsUnit"
      :min="minReps"
      :max="600"
      :model-value="set.reps"
      @update:model-value="emit('update', { reps: $event })"
    />
    <NumberStepper
      v-if="config.usesWeight"
      compact
      :label="labels.weight"
      unit="kg"
      :step="WEIGHT_STEP_KG"
      :max="1000"
      :model-value="set.weightKg"
      @update:model-value="emit('update', { weightKg: $event })"
    />
  </div>
</template>

<style scoped>
.set-fields {
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.set-fields > * {
  flex: 1;
  min-width: 0;
}
</style>
