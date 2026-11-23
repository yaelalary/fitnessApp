<script setup lang="ts" generic="T">
import { ref } from 'vue'
import { useSortable } from '@/composables/useSortable'

defineProps<{ items: T[]; itemKey: (item: T) => string }>()

const emit = defineEmits<{ move: [fromIndex: number, toIndex: number] }>()

defineSlots<{ default(props: { item: T; index: number }): unknown }>()

const container = ref<HTMLElement | null>(null)

useSortable(container, { handle: '.drag-handle', onMove: (fromIndex, toIndex) => emit('move', fromIndex, toIndex) })
</script>

<template>
  <div ref="container" class="stack">
    <template v-for="(item, index) in items" :key="itemKey(item)">
      <slot :item="item" :index="index" />
    </template>
  </div>
</template>
