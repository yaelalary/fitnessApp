<script setup lang="ts">
import type { Movement } from '@/domain/movements'
import AppDialog from '@/components/ui/AppDialog.vue'
import MovementDemo from './MovementDemo.vue'

defineProps<{ open: boolean; movement: Movement; title: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <AppDialog :open="open" :title="title" @close="emit('close')">
    <MovementDemo :movement="movement" />
  </AppDialog>
</template>
