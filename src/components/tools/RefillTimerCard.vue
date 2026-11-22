<script setup lang="ts">
import { computed } from 'vue'
import { REFILL_DURATION, type RefillPhase } from '@/domain/refill'
import { formatClock, formatTimeOfDay } from '@/domain/dates'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import FormField from '@/components/ui/FormField.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'

const props = defineProps<{
  phase: RefillPhase
  remainingSeconds: number
  progress: number
  endsAt: number | null
  durationMinutes: number
}>()

const emit = defineEmits<{ start: []; cancel: []; 'update:durationMinutes': [minutes: number] }>()

const STATUS: Record<RefillPhase, string> = {
  idle: 'Remplis ta gourde à la water station, puis lance le décompte.',
  running: 'Prochain remplissage possible à',
  ready: 'Tu peux remplir ta gourde.',
}

const status = computed(() => STATUS[props.phase])
const isRunning = computed(() => props.phase === 'running')
const isReady = computed(() => props.phase === 'ready')
const canDismiss = computed(() => props.phase !== 'idle')
const dismissLabel = computed(() => (isRunning.value ? 'Annuler' : 'Masquer'))
const remaining = computed(() => formatClock(props.remainingSeconds))
const readyAt = computed(() => (props.endsAt === null ? '' : formatTimeOfDay(props.endsAt)))
const progressPercent = computed(() => `${Math.round(props.progress * 100)}%`)
const durationHint = computed(() =>
  isRunning.value ? 'Le nouveau délai s’appliquera au prochain remplissage.' : 'Temps à attendre entre deux remplissages.',
)
</script>

<template>
  <section class="card stack refill" :class="`refill--${phase}`">
    <div class="split">
      <h2 class="section-title cluster">
        <AppIcon name="droplet" />
        Gourde
      </h2>
      <span v-if="isReady" class="refill__badge">Prête</span>
    </div>

    <div v-if="isRunning" class="stack refill__countdown" role="timer" aria-live="off">
      <p class="numeric refill__clock">{{ remaining }}</p>
      <div class="refill__track" aria-hidden="true">
        <div class="refill__bar" :style="{ width: progressPercent }" />
      </div>
      <p class="muted">{{ status }} <strong>{{ readyAt }}</strong></p>
    </div>
    <p v-else class="refill__status">{{ status }}</p>

    <div class="cluster">
      <AppButton v-if="!isRunning" variant="primary" icon="droplet" @click="emit('start')">Gourde remplie</AppButton>
      <AppButton v-if="canDismiss" variant="ghost" icon="close" @click="emit('cancel')">{{ dismissLabel }}</AppButton>
    </div>

    <FormField label="Délai entre deux remplissages" :hint="durationHint">
      <template #default="field">
        <NumberStepper
          :id="field.id"
          :described-by="field.describedBy"
          label="le délai"
          unit="min"
          :model-value="durationMinutes"
          :min="REFILL_DURATION.minMinutes"
          :max="REFILL_DURATION.maxMinutes"
          :step="REFILL_DURATION.stepMinutes"
          @update:model-value="emit('update:durationMinutes', $event)"
        />
      </template>
    </FormField>
  </section>
</template>

<style scoped>
.refill--ready {
  border-color: var(--color-accent-ink);
}

.refill__badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.refill__countdown {
  gap: var(--space-2);
}

.refill__clock {
  font-size: var(--text-3xl);
  line-height: var(--leading-tight);
}

.refill__track {
  height: var(--space-2);
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-surface-sunken);
}

.refill__bar {
  height: 100%;
  border-radius: inherit;
  background: var(--color-accent);
  transition: width var(--duration-medium) var(--easing);
}

.refill__status {
  font-size: var(--text-lg);
}
</style>
