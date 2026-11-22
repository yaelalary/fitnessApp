<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryId, ExerciseTargets } from '@/domain/types'
import type { ExerciseField } from '@/domain/exercises'
import type { ValidationErrors } from '@/domain/validation'
import { categoryOf } from '@/domain/categories'
import FormField from '@/components/ui/FormField.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'

const REST_STEP_SECONDS = 15

const props = withDefaults(
  defineProps<{ targets: ExerciseTargets; category: CategoryId; errors?: ValidationErrors<ExerciseField> }>(),
  { errors: () => ({}) },
)

const emit = defineEmits<{ 'update:targets': [value: ExerciseTargets] }>()

const config = computed(() => categoryOf(props.category))

function update<K extends keyof ExerciseTargets>(key: K, value: ExerciseTargets[K]) {
  emit('update:targets', { ...props.targets, [key]: value })
}
</script>

<template>
  <div v-if="config.tracking === 'sets'" class="grid-fields">
    <FormField v-slot="field" label="Séries" :error="errors.sets">
      <NumberStepper
        :id="field.id"
        :described-by="field.describedBy"
        :invalid="field.invalid"
        label="séries"
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
  <FormField v-else v-slot="field" label="Durée" :error="errors.durationMinutes">
    <NumberStepper
      :id="field.id"
      :described-by="field.describedBy"
      :invalid="field.invalid"
      label="la durée"
      unit="min"
      :max="300"
      :model-value="targets.durationMinutes"
      @update:model-value="update('durationMinutes', $event)"
    />
  </FormField>
</template>
