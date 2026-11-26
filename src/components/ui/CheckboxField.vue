<script setup lang="ts">
defineProps<{ label: string }>()
const checked = defineModel<boolean>({ required: true })
</script>

<template>
  <label class="checkbox-field">
    <input v-model="checked" type="checkbox" />
    <span>{{ label }}</span>
  </label>
</template>

<style scoped>
.checkbox-field {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--tap-size);
  cursor: pointer;
}
</style>
