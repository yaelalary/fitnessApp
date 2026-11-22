<script setup lang="ts">
import type { CategoryId } from '@/domain/types'
import { CATEGORIES, CATEGORY_ORDER } from '@/domain/categories'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl.vue'

defineProps<{ category: CategoryId | null; query: string }>()

defineEmits<{ 'update:category': [value: CategoryId | null]; 'update:query': [value: string] }>()

const options: SegmentOption<CategoryId | null>[] = [
  { value: null, label: 'Tout' },
  ...CATEGORY_ORDER.map((id) => ({ value: id, label: CATEGORIES[id].pluralLabel })),
]
</script>

<template>
  <div class="stack">
    <input
      type="search"
      :value="query"
      placeholder="Rechercher un exercice, une machine, un muscle…"
      aria-label="Rechercher"
      @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
    />
    <SegmentedControl
      :model-value="category"
      :options="options"
      label="Catégorie"
      @update:model-value="$emit('update:category', $event)"
    />
  </div>
</template>
