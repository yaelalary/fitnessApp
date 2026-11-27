<script setup lang="ts">
withDefaults(defineProps<{ selected?: boolean }>(), { selected: false })
const emit = defineEmits<{ pick: [] }>()
defineSlots<{ default(): unknown }>()
</script>

<template>
  <button type="button" class="pick" :class="{ 'pick--selected': selected }" :aria-pressed="selected" @click="emit('pick')">
    <slot />
  </button>
</template>

<style scoped>
.pick {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.pick:hover {
  border-color: var(--color-border-strong);
}

.pick--selected {
  border-color: var(--color-accent);
}
</style>
