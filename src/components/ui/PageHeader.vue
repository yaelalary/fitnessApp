<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import AppButton from './AppButton.vue'

withDefaults(defineProps<{ title: string; subtitle?: string; backTo?: RouteLocationRaw }>(), {
  subtitle: '',
  backTo: undefined,
})
</script>

<template>
  <header class="page-header">
    <AppButton v-if="backTo" :to="backTo" variant="ghost" icon="back" icon-only label="Retour" />
    <div class="page-header__text">
      <p v-if="subtitle" class="eyebrow">{{ subtitle }}</p>
      <h1>{{ title }}</h1>
    </div>
    <div v-if="$slots.actions" class="cluster"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.page-header__text {
  flex: 1;
  min-width: 0;
}

.page-header__text h1 {
  overflow-wrap: anywhere;
}
</style>
