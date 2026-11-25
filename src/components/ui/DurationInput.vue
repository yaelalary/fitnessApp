<script setup lang="ts">
import { computed } from 'vue'
import { joinMinutes, splitMinutes } from '@/domain/dates'
import NumberStepper from './NumberStepper.vue'

const MAX_MINUTES = 300
const MAX_SECONDS = 59
const SECONDS_STEP = 5

const props = withDefaults(defineProps<{ modelValue: number; label: string; id?: string; compact?: boolean }>(), {
  id: undefined,
  compact: false,
})
const emit = defineEmits<{ 'update:modelValue': [minutes: number] }>()

const parts = computed(() => splitMinutes(props.modelValue))

function setMinutes(minutes: number) {
  emit('update:modelValue', joinMinutes({ ...parts.value, minutes }))
}

function setSeconds(seconds: number) {
  emit('update:modelValue', joinMinutes({ ...parts.value, seconds }))
}
</script>

<template>
  <div class="duration">
    <NumberStepper
      :id="id"
      :compact="compact"
      :label="`${label} (minutes)`"
      unit="min"
      :max="MAX_MINUTES"
      :model-value="parts.minutes"
      @update:model-value="setMinutes"
    />
    <NumberStepper
      :compact="compact"
      :label="`${label} (secondes)`"
      unit="s"
      :step="SECONDS_STEP"
      :max="MAX_SECONDS"
      :model-value="parts.seconds"
      @update:model-value="setSeconds"
    />
  </div>
</template>

<style scoped>
.duration {
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.duration > * {
  flex: 1;
  min-width: 0;
}
</style>
