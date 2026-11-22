<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type { BrandId, CategoryId, Exercise } from '@/domain/types'
import type { ImageInput } from '@/domain/images'
import { CATEGORIES, CATEGORY_ORDER, categoryOf } from '@/domain/categories'
import { BRANDS, BRAND_ORDER, MUSCLE_GROUPS, machineSuggestions } from '@/domain/machines'
import { changeExerciseCategory, validateExercise, type ExerciseField } from '@/domain/exercises'
import { hasErrors, type ValidationErrors } from '@/domain/validation'
import AppButton from '@/components/ui/AppButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl.vue'
import ImagePicker from './ImagePicker.vue'
import TargetsEditor from './TargetsEditor.vue'

const props = withDefaults(
  defineProps<{ exercise: Exercise; imageSrc: string | null; submitting?: boolean; error?: string | null }>(),
  { submitting: false, error: null },
)

const emit = defineEmits<{ submit: [exercise: Exercise, image: ImageInput] }>()

const draft = ref<Exercise>(structuredClone(props.exercise))
const image = ref<ImageInput>({ kind: 'keep' })
const errors = ref<ValidationErrors<ExerciseField>>({})
const machineListId = useId()
const muscleListId = useId()

const categoryOptions: SegmentOption<CategoryId>[] = CATEGORY_ORDER.map((id) => ({ value: id, label: CATEGORIES[id].label }))
const config = computed(() => categoryOf(draft.value.category))
const machines = computed(() => machineSuggestions(draft.value.brand))

function setCategory(category: CategoryId) {
  draft.value = changeExerciseCategory(draft.value, category)
}

function setBrand(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  draft.value.brand = value === '' ? null : (value as BrandId)
}

function submit() {
  errors.value = validateExercise(draft.value)
  if (hasErrors(errors.value)) return
  emit('submit', draft.value, image.value)
}
</script>

<template>
  <form class="stack-lg" novalidate @submit.prevent="submit">
    <SegmentedControl :model-value="draft.category" :options="categoryOptions" label="Catégorie" @update:model-value="setCategory" />

    <FormField v-slot="field" label="Nom de l’exercice" :error="errors.name">
      <input
        :id="field.id"
        v-model="draft.name"
        type="text"
        autocomplete="off"
        placeholder="Développé couché, rameur…"
        :aria-describedby="field.describedBy"
        :aria-invalid="field.invalid"
      />
    </FormField>

    <div v-if="config.usesMachine" class="grid-2">
      <FormField v-slot="field" label="Marque">
        <select :id="field.id" :value="draft.brand ?? ''" @change="setBrand">
          <option value="">Aucune</option>
          <option v-for="brandId in BRAND_ORDER" :key="brandId" :value="brandId">{{ BRANDS[brandId].label }}</option>
        </select>
      </FormField>
      <FormField v-slot="field" label="Machine">
        <input :id="field.id" v-model="draft.machine" type="text" :list="machineListId" autocomplete="off" />
        <datalist :id="machineListId">
          <option v-for="machine in machines" :key="machine" :value="machine" />
        </datalist>
      </FormField>
    </div>

    <FormField v-slot="field" label="Groupe musculaire">
      <input :id="field.id" v-model="draft.muscleGroup" type="text" :list="muscleListId" autocomplete="off" />
      <datalist :id="muscleListId">
        <option v-for="muscle in MUSCLE_GROUPS" :key="muscle" :value="muscle" />
      </datalist>
    </FormField>

    <section class="stack">
      <h2 class="section-title">Objectif par défaut</h2>
      <TargetsEditor v-model:targets="draft.defaults" :category="draft.category" :errors="errors" />
    </section>

    <section class="stack">
      <h2 class="section-title">Photo de la machine</h2>
      <ImagePicker v-model="image" :current-src="imageSrc" :alt="draft.machine || draft.name" />
    </section>

    <FormField v-slot="field" label="Notes" hint="Réglages du siège, prise, consignes…">
      <textarea :id="field.id" v-model="draft.notes" :aria-describedby="field.describedBy" />
    </FormField>

    <ErrorMessage v-if="error" :message="error" />

    <div class="sticky-actions">
      <slot name="secondary-action" />
      <AppButton type="submit" variant="primary" icon="check" :loading="submitting">Enregistrer</AppButton>
    </div>
  </form>
</template>
