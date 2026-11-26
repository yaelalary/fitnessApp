<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { WeekCount } from '@/domain/stats'
import { formatWeekRange } from '@/domain/dates'
import { countLabel } from '@/domain/numbers'
import { useThemeTokens } from '@/composables/useThemeTokens'
import ChartFrame from './ChartFrame.vue'
import { baseChartOptions, CHART_TOKENS, type ChartTokens } from './chartSetup'

const props = defineProps<{ weeks: WeekCount[] }>()

const tokens = useThemeTokens(CHART_TOKENS)

const data = computed<ChartData<'bar'>>(() => ({
  labels: props.weeks.map((week) => formatWeekRange(week.weekStart)),
  datasets: [
    {
      label: 'Séances',
      data: props.weeks.map((week) => week.count),
      backgroundColor: tokens.value['--color-chart-series'],
      borderRadius: 4,
      borderSkipped: 'start',
      maxBarThickness: 28,
    },
  ],
}))

const options = computed(() => {
  const base = baseChartOptions(tokens.value as ChartTokens, (value) => countLabel(value, 'séance')) as ChartOptions<'bar'>
  return {
    ...base,
    scales: { ...base.scales, y: { ...base.scales?.y, beginAtZero: true, ticks: { ...base.scales?.y?.ticks, precision: 0 } } },
  } as ChartOptions<'bar'>
})

const ready = computed(() => Boolean(tokens.value['--color-chart-series']))
</script>

<template>
  <ChartFrame label="Nombre de séances par semaine">
    <Bar v-if="ready" :data="data" :options="options" />
  </ChartFrame>
</template>

