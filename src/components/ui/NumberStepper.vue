<script setup lang="ts">
import { computed } from 'vue'
import AppButton from './AppButton.vue'
import { clamp, roundTo, toSafeNumber } from '@/domain/numbers'

const props = withDefaults(
  defineProps<{
    modelValue: number
    label: string
    step?: number
    min?: number
    max?: number
    unit?: string
    id?: string
    describedBy?: string
    invalid?: 'true'
    compact?: boolean
  }>(),
  { compact: false, step: 1, min: 0, max: 9999, unit: '', id: undefined, describedBy: undefined, invalid: undefined },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const decimals = computed(() => (Number.isInteger(props.step) ? 0 : 2))
const canDecrease = computed(() => props.modelValue > props.min)
const canIncrease = computed(() => props.modelValue < props.max)

function commit(value: number) {
  emit('update:modelValue', roundTo(clamp(value, props.min, props.max), decimals.value))
}

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(',', '.')
  if (raw === '') return
  commit(toSafeNumber(raw, props.modelValue))
}
</script>

<template>
  <div class="stepper">
    <AppButton
      v-if="!compact"
      size="sm"
      variant="ghost"
      icon="minus"
      icon-only
      :label="`Diminuer ${label}`"
      :disabled="!canDecrease"
      @click="commit(modelValue - step)"
    />
    <div class="stepper__value">
      <input
        :id="id"
        type="number"
        inputmode="decimal"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :aria-describedby="describedBy"
        :aria-invalid="invalid"
        :aria-label="id ? undefined : label"
        @change="onInput"
      />
      <span v-if="unit" class="stepper__unit" aria-hidden="true">{{ unit }}</span>
    </div>
    <AppButton
      v-if="!compact"
      size="sm"
      variant="ghost"
      icon="plus"
      icon-only
      :label="`Augmenter ${label}`"
      :disabled="!canIncrease"
      @click="commit(modelValue + step)"
    />
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-1);
  border: var(--border-width) solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.stepper__value {
  display: flex;
  flex: 1;
  align-items: baseline;
  justify-content: center;
  min-width: 0;
}

.stepper__value input {
  flex: 1;
  width: 0;
  min-width: 0;
  min-height: var(--tap-size-sm);
  padding: 0 var(--space-1);
  border: none;
  background: transparent;
  text-align: center;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
}

.stepper__unit {
  flex: none;
  padding-right: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}
</style>
