<script setup lang="ts">
import { computed } from 'vue'
import type { Interval, SessionEntry } from '@/domain/types'
import type { CategoryConfig } from '@/domain/categories'
import { cardioSettingOptions, normalizeCardioSettings, type CardioSettingId } from '@/domain/cardioSettings'
import { addInterval, removeInterval, settingsUsedIn, updateInterval, withSettings } from '@/domain/intervals'
import AppButton from '@/components/ui/AppButton.vue'
import FormField from '@/components/ui/FormField.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'
import IntervalRow from './IntervalRow.vue'

const DISTANCE_STEP_KM = 0.1
const MAX_DISTANCE_KM = 200
const SETTING_GROUPS = [{ label: 'Réglages de la machine', options: cardioSettingOptions() }]

const props = defineProps<{ entry: SessionEntry; config: CategoryConfig }>()
const emit = defineEmits<{ update: [entry: SessionEntry] }>()

const canRemove = computed(() => props.entry.intervals.length > 1)
const settings = computed<CardioSettingId[]>({
  get: () => settingsUsedIn(props.entry.intervals),
  set: (value) => emit('update', withSettings(props.entry, normalizeCardioSettings(value))),
})

function patchInterval(index: number, patch: Partial<Interval>) {
  emit('update', updateInterval(props.entry, index, patch))
}

function setDistance(distanceKm: number) {
  emit('update', { ...props.entry, distanceKm })
}
</script>

<template>
  <ol class="stack">
    <IntervalRow
      v-for="(interval, index) in entry.intervals"
      :key="index"
      :interval="interval"
      :index="index"
      :settings="settings"
      :removable="canRemove"
      @update="patchInterval(index, $event)"
      @remove="emit('update', removeInterval(entry, index))"
    />
  </ol>
  <div class="cluster">
    <AppButton size="sm" icon="plus" @click="emit('update', addInterval(entry))">Palier</AppButton>
    <NumberStepper
      v-if="config.usesDistance"
      class="intervals__distance"
      compact
      label="la distance totale"
      unit="km"
      :step="DISTANCE_STEP_KM"
      :max="MAX_DISTANCE_KM"
      :model-value="entry.distanceKm"
      @update:model-value="setDistance"
    />
  </div>
  <FormField v-slot="field" label="Réglages notés à chaque palier">
    <MultiSelect
      :id="field.id"
      v-model="settings"
      :groups="SETTING_GROUPS"
      title="Réglages à noter"
      placeholder="Ajouter vitesse, pente, cadence…"
    />
  </FormField>
</template>

<style scoped>
.intervals__distance {
  flex: 1;
}
</style>
