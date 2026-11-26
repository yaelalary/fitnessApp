<script setup lang="ts">
import type { IconName } from './icons'
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{ icon: IconName; role?: 'alert' | 'timer' }>(), { role: 'alert' })
defineSlots<{ default(): unknown; actions(): unknown }>()
</script>

<template>
  <div class="banner" :role="role">
    <p class="banner__text">
      <AppIcon :name="icon" />
      <slot />
    </p>
    <div class="cluster banner__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
  background: var(--color-accent);
  color: var(--color-on-accent);
  box-shadow: var(--shadow-raised);
}

.banner__text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  font-weight: var(--weight-semibold);
}

.banner__actions {
  flex-wrap: nowrap;
}

.banner__actions :deep(.button--ghost) {
  color: inherit;
}
</style>
