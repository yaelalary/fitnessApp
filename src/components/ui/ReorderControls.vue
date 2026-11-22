<script setup lang="ts">
import AppButton from './AppButton.vue'

defineProps<{ index: number; count: number; itemLabel: string }>()
defineEmits<{ move: [offset: -1 | 1]; remove: [] }>()
</script>

<template>
  <div class="cluster">
    <slot />
    <AppButton
      size="sm"
      variant="ghost"
      icon="up"
      icon-only
      :label="`Monter ${itemLabel}`"
      :disabled="index === 0"
      @click="$emit('move', -1)"
    />
    <AppButton
      size="sm"
      variant="ghost"
      icon="down"
      icon-only
      :label="`Descendre ${itemLabel}`"
      :disabled="index === count - 1"
      @click="$emit('move', 1)"
    />
    <AppButton size="sm" variant="ghost" icon="trash" icon-only :label="`Retirer ${itemLabel}`" @click="$emit('remove')" />
  </div>
</template>
