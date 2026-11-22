<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryId } from '@/domain/types'
import { categoryOf } from '@/domain/categories'

const props = defineProps<{ category: CategoryId }>()

const label = computed(() => categoryOf(props.category).label)
const colors = computed(() => ({
  '--badge-color': `var(--color-category-${props.category})`,
  '--badge-background': `var(--color-category-${props.category}-soft)`,
}))
</script>

<template>
  <span class="badge" :style="colors">{{ label }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--badge-background);
  color: var(--badge-color);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  line-height: 1.8;
  white-space: nowrap;
}
</style>
