<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressPoint } from '@/domain/stats'
import { formatLongDate } from '@/domain/dates'
import { formatWithUnit } from '@/domain/numbers'

const props = defineProps<{ points: ProgressPoint[]; label: string; unit: string }>()

const rows = computed(() =>
  [...props.points].reverse().map((point) => ({
    key: point.sessionId,
    date: formatLongDate(point.date),
    value: formatWithUnit(point.value, props.unit),
  })),
)
</script>

<template>
  <details class="table">
    <summary>Voir les valeurs</summary>
    <table>
      <thead>
        <tr>
          <th scope="col">Séance</th>
          <th scope="col">{{ label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key">
          <td>{{ row.date }}</td>
          <td>{{ row.value }}</td>
        </tr>
      </tbody>
    </table>
  </details>
</template>

<style scoped>
.table summary {
  padding: var(--space-2) 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
}
</style>
