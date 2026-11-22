<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const emit = defineEmits<{ refill: []; dismiss: [] }>()
</script>

<template>
  <div class="refill-alert" role="alert">
    <p class="refill-alert__text">
      <AppIcon name="droplet" />
      Tu peux remplir ta gourde.
    </p>
    <div class="cluster refill-alert__actions">
      <AppButton size="sm" variant="secondary" @click="emit('refill')">Remplie</AppButton>
      <AppButton size="sm" variant="ghost" icon="close" icon-only label="Masquer l’alerte" @click="emit('dismiss')" />
    </div>
  </div>
</template>

<style scoped>
.refill-alert {
  position: sticky;
  top: var(--header-height);
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
  background: var(--color-accent);
  color: var(--color-on-accent);
  box-shadow: var(--shadow-raised);
}

.refill-alert__text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-semibold);
}

.refill-alert__actions {
  flex-wrap: nowrap;
}

.refill-alert__actions .button--ghost {
  color: inherit;
}
</style>
