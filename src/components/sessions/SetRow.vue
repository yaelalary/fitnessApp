<script setup lang="ts">
import type { SetLog } from '@/domain/types'
import { WEIGHT_STEP_KG, type CategoryConfig } from '@/domain/categories'
import AppButton from '@/components/ui/AppButton.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'

defineProps<{ set: SetLog; index: number; config: CategoryConfig }>()
defineEmits<{ update: [patch: Partial<SetLog>]; remove: [] }>()
</script>

<template>
  <li class="set" :class="{ 'set--done': set.done }">
    <input
      type="checkbox"
      :checked="set.done"
      :aria-label="`Série ${index + 1} faite`"
      @change="$emit('update', { done: ($event.target as HTMLInputElement).checked })"
    />
    <span class="numeric set__index" aria-hidden="true">{{ index + 1 }}</span>
    <NumberStepper
      class="set__field"
      compact
      :label="`${config.repsLabel} série ${index + 1}`"
      :unit="config.repsUnit"
      :max="600"
      :model-value="set.reps"
      @update:model-value="$emit('update', { reps: $event })"
    />
    <NumberStepper
      v-if="config.usesWeight"
      class="set__field"
      compact
      :label="`charge série ${index + 1}`"
      unit="kg"
      :step="WEIGHT_STEP_KG"
      :max="1000"
      :model-value="set.weightKg"
      @update:model-value="$emit('update', { weightKg: $event })"
    />
    <AppButton size="sm" variant="ghost" icon="close" icon-only :label="`Supprimer la série ${index + 1}`" @click="$emit('remove')" />
  </li>
</template>

<style scoped>
.set {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: opacity var(--duration-fast) var(--easing);
}

.set--done .set__field {
  opacity: 0.6;
}

.set__index {
  width: var(--space-4);
  color: var(--color-text-faint);
  text-align: center;
}

.set__field {
  flex: 1;
}
</style>
