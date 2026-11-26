<script setup lang="ts">
import { computed } from 'vue'
import { formatClock } from '@/domain/dates'
import AlertBanner from '@/components/ui/AlertBanner.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{ sessionId: string; exerciseName: string; remainingSeconds: number }>()
const emit = defineEmits<{ stop: [] }>()

const countdown = computed(() => formatClock(props.remainingSeconds))
const title = computed(() => (props.exerciseName ? `Récup · ${props.exerciseName}` : 'Récup'))
const sessionRoute = computed(() => ({ name: 'session', params: { id: props.sessionId } }))
</script>

<template>
  <AlertBanner icon="timer" role="timer">
    <span class="numeric">{{ countdown }}</span>
    <span class="rest__name">{{ title }}</span>
    <template #actions>
      <AppButton size="sm" variant="secondary" :to="sessionRoute">Séance</AppButton>
      <AppButton size="sm" variant="ghost" icon="close" icon-only label="Arrêter la récup" @click="emit('stop')" />
    </template>
  </AlertBanner>
</template>

<style scoped>
.rest__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
