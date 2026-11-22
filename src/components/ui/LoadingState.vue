<script setup lang="ts">
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{ label?: string }>(), { label: 'Chargement…' })
</script>

<template>
  <div class="loading" role="status">
    <AppIcon name="refresh" class="is-spinning" />
    <span>{{ label }}</span>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-muted);
}
</style>
