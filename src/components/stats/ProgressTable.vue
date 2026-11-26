<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressPoint } from '@/domain/stats'
import { formatLongDate } from '@/domain/dates'
import { formatWithUnit } from '@/domain/numbers'
import AppButton from '@/components/ui/AppButton.vue'

const props = withDefaults(
  defineProps<{ points: ProgressPoint[]; label: string; unit: string; dateLabel?: string; removable?: boolean }>(),
  { dateLabel: 'Séance', removable: false },
)
const emit = defineEmits<{ remove: [id: string] }>()

const rows = computed(() =>
  [...props.points].reverse().map((point) => ({
    key: point.id,
    date: formatLongDate(point.date),
    removeLabel: `Supprimer la valeur du ${formatLongDate(point.date)}`,
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
          <th scope="col">{{ dateLabel }}</th>
          <th scope="col">{{ label }}</th>
          <th v-if="removable" scope="col"><span class="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key">
          <td>{{ row.date }}</td>
          <td>{{ row.value }}</td>
          <td v-if="removable" class="table__action">
            <AppButton size="sm" variant="ghost" icon="close" icon-only :label="row.removeLabel" @click="emit('remove', row.key)" />
          </td>
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

.table__action {
  width: var(--tap-size);
  text-align: end;
}
</style>
