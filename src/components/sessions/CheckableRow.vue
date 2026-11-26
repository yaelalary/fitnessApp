<script setup lang="ts">
withDefaults(defineProps<{ done?: boolean; label: string; marker?: string; tag?: 'li' | 'div'; checkable?: boolean }>(), {
  done: false,
  marker: '',
  tag: 'div',
  checkable: true,
})
const emit = defineEmits<{ 'update:done': [value: boolean] }>()
defineSlots<{ default(): unknown; actions?(): unknown }>()

function onChange(event: Event) {
  emit('update:done', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <component :is="tag" class="row" :class="{ 'row--done': done }">
    <input v-if="checkable" type="checkbox" :checked="done" :aria-label="label" @change="onChange" />
    <span v-if="marker" class="numeric row__marker" aria-hidden="true">{{ marker }}</span>
    <div class="row__fields">
      <slot />
    </div>
    <slot name="actions" />
  </component>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.row__marker {
  width: var(--space-4);
  color: var(--color-text-faint);
  text-align: center;
}

.row__fields {
  display: flex;
  flex: 1;
  gap: var(--space-2);
  min-width: 0;
  transition: opacity var(--duration-fast) var(--easing);
}

.row__fields > :slotted(*) {
  flex: 1;
  min-width: 0;
}

.row--done .row__fields {
  opacity: 0.6;
}
</style>
