<script setup lang="ts">
import { computed } from 'vue'
import { formatClock } from '@/domain/dates'
import AlertBanner from '@/components/ui/AlertBanner.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { sessionEntryRoute } from '@/router/sessionLinks'

const props = defineProps<{ sessionId: string; entryId: string | null; exerciseName: string; remainingSeconds: number }>()
const emit = defineEmits<{ stop: [] }>()

const countdown = computed(() => formatClock(props.remainingSeconds))
const title = computed(() => (props.exerciseName ? `Récup · ${props.exerciseName}` : 'Récup'))
const sessionRoute = computed(() => sessionEntryRoute(props.sessionId, props.entryId))
</script>

<template>
  <AlertBanner icon="timer" role="timer">
    <RouterLink :to="sessionRoute" class="rest__link">
      <span class="numeric">{{ countdown }}</span>
      <span class="rest__name">{{ title }}</span>
    </RouterLink>
    <template #actions>
      <AppButton size="sm" variant="secondary" :to="sessionRoute">Séance</AppButton>
      <AppButton size="sm" variant="ghost" icon="close" icon-only label="Arrêter la récup" @click="emit('stop')" />
    </template>
  </AlertBanner>
</template>

<style scoped>
.rest__link {
  display: inline-flex;
  gap: var(--space-2);
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.rest__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
