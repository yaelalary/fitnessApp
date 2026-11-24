<script setup lang="ts">
import { computed } from 'vue'
import type { SetLog } from '@/domain/types'
import { WEIGHT_STEP_KG, type CategoryConfig } from '@/domain/categories'
import AppButton from '@/components/ui/AppButton.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'
import CheckableRow from './CheckableRow.vue'

const props = defineProps<{ set: SetLog; index: number; config: CategoryConfig }>()
defineEmits<{ update: [patch: Partial<SetLog>]; remove: [] }>()

const number = computed(() => props.index + 1)
</script>

<template>
  <CheckableRow
    tag="li"
    :done="set.done"
    :marker="String(number)"
    :label="`Série ${number} faite`"
    @update:done="$emit('update', { done: $event })"
  >
    <NumberStepper
      compact
      :label="`${config.repsLabel} série ${number}`"
      :unit="config.repsUnit"
      :max="600"
      :model-value="set.reps"
      @update:model-value="$emit('update', { reps: $event })"
    />
    <NumberStepper
      v-if="config.usesWeight"
      compact
      :label="`charge série ${number}`"
      unit="kg"
      :step="WEIGHT_STEP_KG"
      :max="1000"
      :model-value="set.weightKg"
      @update:model-value="$emit('update', { weightKg: $event })"
    />
    <template #actions>
      <AppButton size="sm" variant="ghost" icon="close" icon-only :label="`Supprimer la série ${number}`" @click="$emit('remove')" />
    </template>
  </CheckableRow>
</template>
