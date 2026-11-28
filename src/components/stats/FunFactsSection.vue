<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Session } from '@/domain/types'
import { FACT_PERIOD_ORDER, FACT_PERIODS, factTotals, funFacts, sessionsForPeriod, type FactPeriod } from '@/domain/funFacts'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl.vue'
import FunFacts from './FunFacts.vue'

const props = defineProps<{ sessions: Session[]; today: string }>()

const periodOptions: SegmentOption<FactPeriod>[] = FACT_PERIOD_ORDER.map((value) => ({ value, label: FACT_PERIODS[value].label }))
const period = ref<FactPeriod>('all')

const facts = computed(() => funFacts(factTotals(sessionsForPeriod(props.sessions, period.value, props.today))))
const hasFacts = computed(() => facts.value.length > 0)
</script>

<template>
  <section class="stack">
    <h2 class="section-title">Tes exploits</h2>
    <SegmentedControl v-model="period" :options="periodOptions" label="Période" />
    <FunFacts v-if="hasFacts" :facts="facts" />
    <p v-else class="muted">Rien à comparer sur cette période pour l’instant. Encore quelques séries !</p>
  </section>
</template>
