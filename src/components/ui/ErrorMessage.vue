<script setup lang="ts">
import AppButton from './AppButton.vue'

withDefaults(defineProps<{ message: string; retryLabel?: string }>(), { retryLabel: '' })

defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="error" role="alert">
    <p>{{ message }}</p>
    <AppButton v-if="retryLabel" size="sm" icon="refresh" @click="$emit('retry')">{{ retryLabel }}</AppButton>
  </div>
</template>

<style scoped>
.error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}
</style>
