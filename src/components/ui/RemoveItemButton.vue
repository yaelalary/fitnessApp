<script setup lang="ts">
import AppButton from './AppButton.vue'

defineEmits<{ remove: [] }>()
defineSlots<{ default?(): unknown }>()
</script>

<template>
  <div class="remove-item">
    <slot />
    <AppButton class="remove-item__button" size="sm" variant="ghost" icon="trash" @click="$emit('remove')">Retirer</AppButton>
  </div>
</template>

<style scoped>
.remove-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.remove-item__button {
  margin-inline-start: auto;
}
</style>
