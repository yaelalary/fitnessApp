<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryId, ExerciseTargets } from '@/domain/types'
import type { ExerciseField } from '@/domain/exercises'
import type { ValidationErrors } from '@/domain/validation'
import type { CardioSettingId } from '@/domain/cardioSettings'
import { categoryOf, REST_STEP_SECONDS, WEIGHT_STEP_KG } from '@/domain/categories'
import { setNounTitle } from '@/domain/setNouns'
import FormField from '@/components/ui/FormField.vue'
import TargetIntervalsEditor from './TargetIntervalsEditor.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'

const props = withDefaults(
  defineProps<{ targets: ExerciseTargets; category: CategoryId; settings?: CardioSettingId[]; errors?: ValidationErrors<ExerciseField> }>(),
  { errors: () => ({}), settings: () => [] },
)

const emit = defineEmits<{ 'update:targets': [value: ExerciseTargets] }>()

const config = computed(() => categoryOf(props.category))
const setsLabel = computed(() => setNounTitle(config.value.setNoun, true))

function update<K extends keyof ExerciseTargets>(key: K, value: ExerciseTargets[K]) {
  emit('update:targets', { ...props.targets, [key]: value })
}
</script>

<template>
  <div v-if="config.tracking === 'sets'" class="grid-fields">
    <FormField v-slot="field" :label="setsLabel" :error="errors.sets">
      <NumberStepper
        :id="field.id"
        :described-by="field.describedBy"
        :invalid="field.invalid"
        :label="setsLabel"
        :min="1"
        :max="20"
        :model-value="targets.sets"
        @update:model-value="update('sets', $event)"
      />
    </FormField>
    <FormField v-slot="field" :label="config.repsLabel" :error="errors.reps">
      <NumberStepper
        :id="field.id"
        :described-by="field.describedBy"
        :invalid="field.invalid"
        :label="config.repsLabel"
        :min="1"
        :max="600"
        :model-value="targets.reps"
        @update:model-value="update('reps', $event)"
      />
    </FormField>
    <FormField v-if="config.usesWeight" v-slot="field" label="Charge" :error="errors.weightKg">
      <NumberStepper
        :id="field.id"
        :described-by="field.describedBy"
        :invalid="field.invalid"
        label="la charge"
        unit="kg"
        :step="WEIGHT_STEP_KG"
        :max="1000"
        :model-value="targets.weightKg"
        @update:model-value="update('weightKg', $event)"
      />
    </FormField>
    <FormField v-if="config.usesRest" v-slot="field" label="Récup" :error="errors.restSeconds">
      <NumberStepper
        :id="field.id"
        :described-by="field.describedBy"
        :invalid="field.invalid"
        label="la récupération"
        unit="s"
        :step="REST_STEP_SECONDS"
        :max="900"
        :model-value="targets.restSeconds"
        @update:model-value="update('restSeconds', $event)"
      />
    </FormField>
  </div>
  <TargetIntervalsEditor v-else :targets="targets" :settings="settings" @update:targets="emit('update:targets', $event)" />
</template>
