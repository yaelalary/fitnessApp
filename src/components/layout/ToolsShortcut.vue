<script setup lang="ts">
import { computed } from 'vue'
import type { RefillPhase } from '@/domain/refill'
import { formatClock } from '@/domain/dates'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{ refillPhase: RefillPhase; refillRemainingSeconds: number }>()

const isCounting = computed(() => props.refillPhase !== 'idle')
const isReady = computed(() => props.refillPhase === 'ready')
const countdown = computed(() => (isReady.value ? 'Prête' : formatClock(props.refillRemainingSeconds)))
const label = computed(() => (isReady.value ? 'Outils : gourde prête' : `Outils : gourde dans ${countdown.value}`))
</script>

<template>
  <RouterLink
    v-if="isCounting"
    :to="{ name: 'tools' }"
    class="shortcut"
    :class="{ 'shortcut--ready': isReady }"
    :aria-label="label"
  >
    <AppIcon name="droplet" />
    <span class="numeric">{{ countdown }}</span>
  </RouterLink>
  <AppButton v-else :to="{ name: 'tools' }" variant="ghost" icon="tools" icon-only label="Outils" />
</template>

<style scoped>
.shortcut {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--space-1);
  min-height: var(--tap-size-sm);
  padding: 0 var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--color-surface-sunken);
  color: var(--color-text);
  font-size: var(--text-md);
  text-decoration: none;
}

.shortcut--ready {
  background: var(--color-accent);
  color: var(--color-on-accent);
}
</style>
