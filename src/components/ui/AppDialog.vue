<script setup lang="ts">
import { ref, watch } from 'vue'
import AppButton from './AppButton.vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)

watch(
  () => [props.open, dialog.value] as const,
  ([open, element]) => {
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  },
  { immediate: true },
)
</script>

<template>
  <dialog ref="dialog" class="dialog" :aria-label="title" @close="emit('close')">
    <header class="dialog__header">
      <h2 class="section-title">{{ title }}</h2>
      <AppButton variant="ghost" icon="close" icon-only label="Fermer" @click="emit('close')" />
    </header>
    <div class="dialog__body">
      <slot v-if="open" />
    </div>
  </dialog>
</template>

<style scoped>
.dialog[open] {
  display: flex;
  flex-direction: column;
}

.dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-5);
  border-bottom: var(--border-width) solid var(--color-border);
}

.dialog__body {
  overflow-y: auto;
  padding: var(--space-4) var(--space-5) var(--space-5);
}
</style>
