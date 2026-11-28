<script setup lang="ts">
import type { FunFact } from '@/domain/funFacts'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps<{ facts: FunFact[] }>()
</script>

<template>
  <ul class="stack">
    <li v-for="fact in facts" :key="fact.id" class="card fact">
      <span class="fact__icon">
        <AppIcon :name="fact.icon" />
      </span>
      <p>{{ fact.message }}</p>
    </li>
  </ul>
</template>

<style scoped>
.fact {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.fact__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--tap-size);
  height: var(--tap-size);
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-on-accent);
}
</style>
