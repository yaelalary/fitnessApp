<script setup lang="ts">
import { computed } from 'vue'
import { formatClock } from '@/domain/dates'
import { useCountdown } from '@/composables/useCountdown'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{ seconds: number }>()

const { remainingSeconds, running, start, stop } = useCountdown()

const startLabel = computed(() => `Récup ${formatClock(props.seconds)}`)
const remaining = computed(() => formatClock(remainingSeconds.value))
</script>

<template>
  <div v-if="running" class="timer" role="timer" aria-live="off">
    <span class="numeric timer__value">{{ remaining }}</span>
    <AppButton size="sm" variant="ghost" icon="stop" @click="stop">Arrêter</AppButton>
  </div>
  <AppButton v-else size="sm" icon="timer" :disabled="seconds <= 0" @click="start(seconds)">{{ startLabel }}</AppButton>
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
