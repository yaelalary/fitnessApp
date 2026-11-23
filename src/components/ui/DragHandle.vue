<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps<{ itemLabel: string }>()
const emit = defineEmits<{ move: [offset: -1 | 1] }>()

const KEY_OFFSETS: Record<string, -1 | 1> = { ArrowUp: -1, ArrowDown: 1 }

const label = computed(() => `Déplacer ${props.itemLabel}. Glisse, ou utilise les flèches haut et bas.`)

function onKeydown(event: KeyboardEvent) {
  const offset = KEY_OFFSETS[event.key]
  if (offset === undefined) return
  event.preventDefault()
  emit('move', offset)
}
</script>

<template>
  <button type="button" class="drag-handle" :aria-label="label" :title="label" @keydown="onKeydown">
    <AppIcon name="grip" />
  </button>
</template>

<style scoped>
.drag-handle {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--tap-size);
  height: var(--tap-size);
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-faint);
  cursor: grab;
  touch-action: none;
}

.drag-handle:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
