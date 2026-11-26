<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryId, ExerciseTargets } from '@/domain/types'
import type { ExerciseField } from '@/domain/exercises'
import type { ValidationErrors } from '@/domain/validation'
import type { CardioSettingId } from '@/domain/cardioSettings'
import { categoryOf, REST_STEP_SECONDS } from '@/domain/categories'
import FormField from '@/components/ui/FormField.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import TargetIntervalsEditor from './TargetIntervalsEditor.vue'
import TargetSetsEditor from './TargetSetsEditor.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'

const props = withDefaults(
  defineProps<{ targets: ExerciseTargets; category: CategoryId; settings?: CardioSettingId[]; errors?: ValidationErrors<ExerciseField> }>(),
  { errors: () => ({}), settings: () => [] },
)

const emit = defineEmits<{ 'update:targets': [value: ExerciseTargets] }>()

const config = computed(() => categoryOf(props.category))
const setsError = computed(() => props.errors.sets ?? props.errors.reps ?? props.errors.weightKg ?? '')

function update<K extends keyof ExerciseTargets>(key: K, value: ExerciseTargets[K]) {
  emit('update:targets', { ...props.targets, [key]: value })
}
</script>

<template>
  <div v-if="config.tracking === 'sets'" class="stack">
    <TargetSetsEditor :targets="targets" :config="config" @update:targets="emit('update:targets', $event)" />
    <ErrorMessage v-if="setsError" :message="setsError" />
    <div v-if="config.usesRest" class="grid-fields">
      <FormField v-slot="field" label="Récup" :error="errors.restSeconds">
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
  </div>
  <TargetIntervalsEditor v-else :targets="targets" :settings="settings" @update:targets="emit('update:targets', $event)" />
</template>
