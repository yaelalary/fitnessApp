<script setup lang="ts">
import { computed } from 'vue'
import type { Measure } from '@/domain/types'
import { latestValue, measurePoints, summarizeMeasure } from '@/domain/measures'
import { formatNumber, formatSignedNumber, formatWithUnit } from '@/domain/numbers'
import AppButton from '@/components/ui/AppButton.vue'
import StatTile from '@/components/ui/StatTile.vue'
import ProgressChart from '@/components/stats/ProgressChart.vue'
import ProgressTable from '@/components/stats/ProgressTable.vue'
import MeasureEntryForm from './MeasureEntryForm.vue'

const props = defineProps<{ measure: Measure; today: string; busy: boolean }>()
const emit = defineEmits<{ add: [date: string, value: number]; 'remove-entry': [entryId: string]; delete: [] }>()

const points = computed(() => measurePoints(props.measure))
const hasPoints = computed(() => points.value.length > 0)
const summary = computed(() => summarizeMeasure(props.measure))
const suggestedValue = computed(() => latestValue(props.measure) ?? 0)
const tiles = computed(() => {
  if (!summary.value) return []
  const unit = props.measure.unit
  return [
    { label: 'Dernière', value: formatNumber(summary.value.last), unit, hint: '' },
    {
      label: 'Évolution',
      value: formatSignedNumber(summary.value.change),
      unit,
      hint: `depuis ${formatWithUnit(summary.value.first, unit)}`,
    },
    { label: 'Relevés', value: formatNumber(summary.value.count), unit: '', hint: '' },
  ]
})

function forwardAdd(date: string, value: number) {
  emit('add', date, value)
}
</script>

<template>
  <div class="stack">
    <div v-if="hasPoints" class="grid-3">
      <StatTile v-for="tile in tiles" :key="tile.label" :label="tile.label" :value="tile.value" :unit="tile.unit" :hint="tile.hint" />
    </div>
    <div class="card stack">
      <ProgressChart v-if="hasPoints" :points="points" :label="measure.name" :unit="measure.unit" />
      <p v-else class="muted">Aucune valeur pour l’instant : ajoute la première ci-dessous.</p>
      <MeasureEntryForm
        :unit="measure.unit"
        :suggested-value="suggestedValue"
        :today="today"
        :busy="busy"
        @add="forwardAdd"
      />
      <ProgressTable
        v-if="hasPoints"
        :points="points"
        :label="measure.name"
        :unit="measure.unit"
        date-label="Date"
        removable
        @remove="emit('remove-entry', $event)"
      />
    </div>
    <div>
      <AppButton size="sm" variant="ghost" icon="trash" :disabled="busy" @click="emit('delete')">Supprimer la mesure</AppButton>
    </div>
  </div>
</template>
