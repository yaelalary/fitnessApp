<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'

withDefaults(defineProps<{ title: string; message?: string; icon?: IconName }>(), { message: '', icon: 'dumbbell' })
</script>

<template>
  <div class="empty">
    <span class="empty__icon"><AppIcon :name="icon" /></span>
    <p class="empty__title">{{ title }}</p>
    <p v-if="message" class="empty__message">{{ message }}</p>
    <div v-if="$slots.default" class="cluster empty__actions"><slot /></div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-7) var(--space-4);
  border: var(--border-width) dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty__icon {
  display: grid;
  place-items: center;
  width: var(--tap-size);
  height: var(--tap-size);
  border-radius: var(--radius-pill);
  background: var(--color-surface-sunken);
  color: var(--color-text-muted);
}

.empty__title {
  font-weight: var(--weight-semibold);
}

.empty__message {
  max-width: 28rem;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.empty__actions {
  justify-content: center;
  margin-top: var(--space-2);
}
</style>
