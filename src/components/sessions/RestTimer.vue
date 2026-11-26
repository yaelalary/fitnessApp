<script setup lang="ts">
import { computed } from 'vue'
import { formatClock } from '@/domain/dates'
import { useRestStore } from '@/stores/rest'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{ seconds: number; sessionId: string; entryId: string; exerciseName: string }>()

const rest = useRestStore()

const running = computed(() => rest.isRunningFor(props.sessionId, props.entryId))
const startLabel = computed(() => `Récup ${formatClock(props.seconds)}`)
const remaining = computed(() => formatClock(rest.remainingSeconds))

function start() {
  rest.start({ sessionId: props.sessionId, entryId: props.entryId, exerciseName: props.exerciseName, seconds: props.seconds })
}
</script>

<template>
  <div v-if="running" class="timer" role="timer" aria-live="off">
    <span class="numeric timer__value">{{ remaining }}</span>
    <AppButton size="sm" variant="ghost" icon="stop" @click="rest.stop">Arrêter</AppButton>
  </div>
  <AppButton v-else size="sm" icon="timer" :disabled="seconds <= 0" @click="start">{{ startLabel }}</AppButton>
</template>

<style scoped>
.timer {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding-left: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.timer .button {
  color: inherit;
}

.timer__value {
  font-size: var(--text-xl);
}
</style>
