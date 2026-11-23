<script setup lang="ts">
import AppButton from './AppButton.vue'

defineEmits<{ remove: [] }>()
</script>

<template>
  <div class="remove-item">
    <AppButton size="sm" variant="ghost" icon="trash" @click="$emit('remove')">Retirer</AppButton>
  </div>
</template>

<style scoped>
.remove-item {
  display: flex;
  justify-content: flex-end;
}
</style>
