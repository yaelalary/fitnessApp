<script setup lang="ts" generic="T extends string | null">
export interface SegmentOption<V> {
  value: V
  label: string
}

defineProps<{ modelValue: T; options: SegmentOption<T>[]; label: string }>()

defineEmits<{ 'update:modelValue': [value: T] }>()
</script>

<template>
  <div class="segmented" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      role="radio"
      class="segmented__option"
      :aria-checked="option.value === modelValue"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: flex;
  gap: var(--space-1);
  overflow-x: auto;
  padding: var(--space-1);
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  scrollbar-width: none;
}

.segmented__option {
  flex: 1 0 auto;
  min-height: var(--tap-size-sm);
  padding: 0 var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  white-space: nowrap;
}

.segmented__option[aria-checked='true'] {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-raised);
}
</style>
