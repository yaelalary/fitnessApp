<script setup lang="ts">
import AlertBanner from '@/components/ui/AlertBanner.vue'
import AppButton from '@/components/ui/AppButton.vue'

const emit = defineEmits<{ refill: []; dismiss: [] }>()
</script>

<template>
  <AlertBanner icon="droplet">
    Tu peux remplir ta gourde.
    <template #actions>
      <AppButton size="sm" variant="secondary" @click="emit('refill')">Remplie</AppButton>
      <AppButton size="sm" variant="ghost" icon="close" icon-only label="Masquer l’alerte" @click="emit('dismiss')" />
    </template>
  </AlertBanner>
</template>
