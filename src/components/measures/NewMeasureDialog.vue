<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Measure } from '@/domain/types'
import {
  availableSuggestions,
  createMeasure,
  validateMeasure,
  type MeasureField,
  type MeasureSuggestion,
} from '@/domain/measures'
import { hasErrors, type ValidationErrors } from '@/domain/validation'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FormField from '@/components/ui/FormField.vue'

const props = defineProps<{ open: boolean; measures: Measure[]; busy: boolean; error: string | null }>()
const emit = defineEmits<{ create: [measure: Measure]; close: [] }>()

const draft = ref<Measure>(createMeasure())
const errors = ref<ValidationErrors<MeasureField>>({})
const suggestions = computed(() =>
  availableSuggestions(props.measures).map((suggestion) => ({ suggestion, label: `${suggestion.name} (${suggestion.unit})` })),
)
const hasSuggestions = computed(() => suggestions.value.length > 0)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    draft.value = createMeasure()
    errors.value = {}
  },
)

function submit(measure: Measure) {
  errors.value = validateMeasure(measure, props.measures)
  if (!hasErrors(errors.value)) emit('create', measure)
}

function pick(suggestion: MeasureSuggestion) {
  submit(createMeasure(suggestion.name, suggestion.unit))
}
</script>

<template>
  <AppDialog :open="open" title="Nouvelle mesure" @close="emit('close')">
    <div class="stack-lg">
      <section v-if="hasSuggestions" class="stack">
        <h3 class="eyebrow">Suggestions</h3>
        <div class="cluster">
          <AppButton
            v-for="item in suggestions"
            :key="item.label"
            size="sm"
            icon="plus"
            :disabled="busy"
            @click="pick(item.suggestion)"
          >
            {{ item.label }}
          </AppButton>
        </div>
      </section>

      <form class="stack" novalidate @submit.prevent="submit(draft)">
        <h3 class="eyebrow">Mesure personnalisée</h3>
        <div class="grid-2">
          <FormField v-slot="field" label="Nom" :error="errors.name">
            <input
              :id="field.id"
              v-model="draft.name"
              type="text"
              placeholder="Tour de mollet…"
              :aria-describedby="field.describedBy"
              :aria-invalid="field.invalid"
            />
          </FormField>
          <FormField v-slot="field" label="Unité">
            <input :id="field.id" v-model="draft.unit" type="text" placeholder="cm, kg, %…" />
          </FormField>
        </div>
        <ErrorMessage v-if="error" :message="error" />
        <AppButton type="submit" variant="primary" icon="check" :loading="busy">Créer la mesure</AppButton>
      </form>
    </div>
  </AppDialog>
</template>
