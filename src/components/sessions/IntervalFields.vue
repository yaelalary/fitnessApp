<script setup lang="ts">
import { computed } from 'vue'
import type { Interval } from '@/domain/types'
import { CARDIO_SETTINGS, type CardioSettingId } from '@/domain/cardioSettings'
import DurationInput from '@/components/ui/DurationInput.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'

const props = withDefaults(defineProps<{ interval: Interval; number: number; settings: CardioSettingId[]; compact?: boolean }>(), {
  compact: true,
})
const emit = defineEmits<{ update: [patch: Partial<Interval>] }>()

const fields = computed(() =>
  props.settings.map((id) => ({
    ...CARDIO_SETTINGS[id],
    value: props.interval.values[id] ?? 0,
    label: `${CARDIO_SETTINGS[id].label.toLowerCase()} palier ${props.number}`,
  })),
)

function setSetting(setting: CardioSettingId, value: number) {
  emit('update', { values: { ...props.interval.values, [setting]: value } })
}
</script>

<template>
  <div class="interval">
    <DurationInput
      class="interval__duration"
      :compact="compact"
      :label="`la durée palier ${number}`"
      :model-value="interval.durationMinutes"
      @update:model-value="emit('update', { durationMinutes: $event })"
    />
    <NumberStepper
      v-for="field in fields"
      :key="field.id"
      :compact="compact"
      :label="field.label"
      :unit="field.unit"
      :step="field.step"
      :max="field.max"
      :model-value="field.value"
      @update:model-value="setSetting(field.id, $event)"
    />
  </div>
</template>

<style scoped>
.interval {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--compact-field-min-width), 1fr));
  gap: var(--space-2);
  min-width: 0;
}

.interval__duration {
  grid-column: 1 / -1;
}
</style>
