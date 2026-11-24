<script setup lang="ts">
import { computed } from 'vue'
import type { ActivitySummary } from '@/domain/stats'
import { formatNumber } from '@/domain/numbers'
import { METRICS } from '@/domain/metrics'
import StatTile from '@/components/ui/StatTile.vue'

const props = defineProps<{ activity: ActivitySummary }>()

const tiles = computed(() => [
  { label: 'Séances', value: formatNumber(props.activity.sessionCount), unit: '' },
  { label: METRICS.volume.label, value: formatNumber(Math.round(props.activity.volumeKg)), unit: 'kg' },
  { label: 'Cardio', value: formatNumber(props.activity.cardioMinutes), unit: 'min' },
])
</script>

<template>
  <div class="grid-3">
    <StatTile v-for="tile in tiles" :key="tile.label" :label="tile.label" :value="tile.value" :unit="tile.unit" />
  </div>
</template>
