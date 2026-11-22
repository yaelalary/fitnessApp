<script setup lang="ts">
withDefaults(defineProps<{ label: string; value: string; unit?: string; hint?: string }>(), { unit: '', hint: '' })
</script>

<template>
  <div class="tile">
    <p class="eyebrow">{{ label }}</p>
    <p class="tile__value">
      <span class="numeric">{{ value }}</span>
      <span v-if="unit" class="tile__unit">{{ unit }}</span>
    </p>
    <p v-if="hint" class="tile__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.tile {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-3) var(--space-4);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.tile__value {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.tile__value .numeric {
  font-size: var(--text-3xl);
  line-height: 1;
}

.tile__unit,
.tile__hint {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>
