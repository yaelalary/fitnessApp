<script setup lang="ts">
import { computed } from 'vue'
import type { ExerciseTargets, Interval } from '@/domain/types'
import type { CardioSettingId } from '@/domain/cardioSettings'
import { appendInterval, applySettings, patchIntervalAt, removeIntervalAt, targetIntervals, withTargetIntervals } from '@/domain/intervals'
import AppButton from '@/components/ui/AppButton.vue'
import CheckableRow from '@/components/sessions/CheckableRow.vue'
import IntervalFields from '@/components/sessions/IntervalFields.vue'

const props = defineProps<{ targets: ExerciseTargets; settings: CardioSettingId[] }>()
const emit = defineEmits<{ 'update:targets': [targets: ExerciseTargets] }>()

const intervals = computed(() => applySettings(targetIntervals(props.targets), props.settings))
const canRemove = computed(() => intervals.value.length > 1)
const rows = computed(() => intervals.value.map((interval, index) => ({ interval, index, number: index + 1, marker: String(index + 1) })))

function replace(next: Interval[]) {
  emit('update:targets', withTargetIntervals(props.targets, next))
}

function patch(index: number, changes: Partial<Interval>) {
  replace(patchIntervalAt(intervals.value, index, changes))
}
</script>

<template>
  <ol class="stack">
    <CheckableRow
      v-for="row in rows"
      :key="row.index"
      tag="li"
      :checkable="false"
      :marker="row.marker"
      :label="`Palier ${row.number}`"
    >
      <IntervalFields :interval="row.interval" :number="row.number" :settings="settings" @update="patch(row.index, $event)" />
      <template v-if="canRemove" #actions>
        <AppButton
          size="sm"
          variant="ghost"
          icon="close"
          icon-only
          :label="`Supprimer le palier ${row.number}`"
          @click="replace(removeIntervalAt(intervals, row.index))"
        />
      </template>
    </CheckableRow>
  </ol>
  <div>
    <AppButton size="sm" icon="plus" @click="replace(appendInterval(intervals))">Palier</AppButton>
  </div>
</template>
