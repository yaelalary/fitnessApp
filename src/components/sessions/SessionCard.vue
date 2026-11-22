<script setup lang="ts">
import { computed } from 'vue'
import type { Session } from '@/domain/types'
import { describeSessionSummary, summarizeSession } from '@/domain/sessions'
import { formatLongDate } from '@/domain/dates'

const props = withDefaults(defineProps<{ session: Session; inProgress?: boolean }>(), { inProgress: false })

const date = computed(() => formatLongDate(props.session.date))
const details = computed(() => describeSessionSummary(summarizeSession(props.session)))
</script>

<template>
  <RouterLink :to="{ name: 'session', params: { id: session.id } }" class="card card-link stack session">
    <div class="split">
      <p class="eyebrow">{{ date }}</p>
      <span v-if="inProgress" class="session__flag">En cours</span>
    </div>
    <p class="section-title">{{ session.title }}</p>
    <p class="muted small">{{ details }}</p>
  </RouterLink>
</template>

<style scoped>
.session {
  gap: var(--space-1);
}

.session__flag {
  padding: 0 var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
}
</style>
