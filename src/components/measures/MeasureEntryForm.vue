<script setup lang="ts">
import { ref, watch } from 'vue'
import { MEASURE_VALUE } from '@/domain/measures'
import AppButton from '@/components/ui/AppButton.vue'
import FormField from '@/components/ui/FormField.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'

const props = defineProps<{ unit: string; suggestedValue: number; today: string; busy: boolean }>()
const emit = defineEmits<{ add: [date: string, value: number] }>()

const date = ref(props.today)
const value = ref(props.suggestedValue)

watch(
  () => props.suggestedValue,
  (next) => {
    value.value = next
  },
)

function setDate(event: Event) {
  const next = (event.target as HTMLInputElement).value
  if (next) date.value = next
}
</script>

<template>
  <form class="stack" novalidate @submit.prevent="emit('add', date, value)">
    <FormField v-slot="field" label="Date">
      <input :id="field.id" type="date" required :value="date" :max="today" @change="setDate" />
    </FormField>
    <FormField v-slot="field" label="Valeur">
      <NumberStepper
        :id="field.id"
        label="la valeur"
        :unit="unit"
        :step="MEASURE_VALUE.step"
        :max="MEASURE_VALUE.max"
        v-model="value"
      />
    </FormField>
    <AppButton type="submit" icon="plus" :loading="busy">Ajouter la valeur</AppButton>
  </form>
</template>
