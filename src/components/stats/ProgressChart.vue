<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { ProgressPoint } from '@/domain/stats'
import { formatShortDate } from '@/domain/dates'
import { formatWithUnit } from '@/domain/numbers'
import { useThemeTokens } from '@/composables/useThemeTokens'
import ChartFrame from './ChartFrame.vue'
import { baseChartOptions, CHART_TOKENS, type ChartTokens } from './chartSetup'

const props = defineProps<{ points: ProgressPoint[]; label: string; unit: string }>()

const tokens = useThemeTokens(CHART_TOKENS)

const data = computed<ChartData<'line'>>(() => ({
  labels: props.points.map((point) => formatShortDate(point.date)),
  datasets: [
    {
      label: props.label,
      data: props.points.map((point) => point.value),
      borderColor: tokens.value['--color-chart-series'],
      backgroundColor: tokens.value['--color-chart-series'],
      pointBorderColor: tokens.value['--color-surface'],
      borderWidth: 2,
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointHitRadius: 16,
      tension: 0.25,
    },
  ],
}))

const options = computed(
  () => baseChartOptions(tokens.value as ChartTokens, (value) => formatWithUnit(value, props.unit)) as ChartOptions<'line'>,
)

const ready = computed(() => Boolean(tokens.value['--color-chart-series']))
</script>

<template>
  <ChartFrame :label="`Évolution : ${label}`">
    <Line v-if="ready" :data="data" :options="options" />
  </ChartFrame>
</template>

