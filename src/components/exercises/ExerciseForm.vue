<script setup lang="ts">
import { computed } from 'vue'
import type { BrandId, CategoryId, Exercise } from '@/domain/types'
import type { ImageInput } from '@/domain/images'
import { CATEGORIES, CATEGORY_ORDER, categoryOf } from '@/domain/categories'
import { BRANDS, BRAND_ORDER, machineImageUrl, machinePageUrl, type CatalogEntry } from '@/domain/machines'
import { muscleOptionGroups } from '@/domain/muscles'
import { cardioSettingOptions, normalizeCardioSettings, type CardioSettingId } from '@/domain/cardioSettings'
import { changeExerciseBrand, changeExerciseCategory, changeExerciseSettings, selectCatalogMachine, type ExerciseField } from '@/domain/exercises'
import type { ValidationErrors } from '@/domain/validation'
import AppButton from '@/components/ui/AppButton.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl.vue'
import ImagePicker from './ImagePicker.vue'
import MachineField from './MachineField.vue'
import TargetsEditor from './TargetsEditor.vue'
import MovementField from '@/components/movements/MovementField.vue'

const props = withDefaults(
  defineProps<{
    draft: Exercise
    image: ImageInput
    errors: ValidationErrors<ExerciseField>
    imageSrc: string | null
    submitting?: boolean
    error?: string | null
  }>(),
  { submitting: false, error: null },
)

const emit = defineEmits<{ 'update:draft': [draft: Exercise]; 'update:image': [image: ImageInput]; submit: [] }>()

const categoryOptions: SegmentOption<CategoryId>[] = CATEGORY_ORDER.map((id) => ({ value: id, label: CATEGORIES[id].label }))
const config = computed(() => categoryOf(props.draft.category))
const muscleGroups = computed(() => muscleOptionGroups(props.draft.muscles))
const settingGroups = [{ label: 'Réglages de la machine', options: cardioSettingOptions() }]
const catalogImageSrc = computed(() =>
  config.value.usesMachine ? machineImageUrl(props.draft.brand, props.draft.machine) : null,
)
const imageAlt = computed(() => props.draft.machine || props.draft.name)
const machinePage = computed(() => machinePageUrl(props.draft.brand, props.draft.machine))

function replaceDraft(draft: Exercise) {
  emit('update:draft', draft)
}

function draftField<K extends 'name' | 'machine' | 'muscles' | 'defaults' | 'notes' | 'movementId'>(key: K) {
  return computed<Exercise[K]>({
    get: () => props.draft[key],
    set: (value) => replaceDraft({ ...props.draft, [key]: value }),
  })
}

const name = draftField('name')
const machine = draftField('machine')
const muscles = draftField('muscles')
const settings = computed<CardioSettingId[]>({
  get: () => props.draft.settings,
  set: (value) => replaceDraft(changeExerciseSettings(props.draft, normalizeCardioSettings(value))),
})
const defaults = draftField('defaults')
const notes = draftField('notes')
const movementId = draftField('movementId')
const movementSubject = computed(() => ({
  name: props.draft.name,
  machine: props.draft.machine,
  category: props.draft.category,
  brand: props.draft.brand,
}))
const image = computed<ImageInput>({
  get: () => props.image,
  set: (value) => emit('update:image', value),
})

function setCategory(category: CategoryId) {
  replaceDraft(changeExerciseCategory(props.draft, category))
}

function setBrand(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  replaceDraft(changeExerciseBrand(props.draft, value === '' ? null : (value as BrandId)))
}

function pickMachine(entry: CatalogEntry) {
  replaceDraft(selectCatalogMachine(props.draft, entry))
}
</script>

<template>
  <form class="stack-lg" novalidate @submit.prevent="emit('submit')">
    <SegmentedControl :model-value="draft.category" :options="categoryOptions" label="Catégorie" @update:model-value="setCategory" />

    <FormField v-slot="field" label="Nom de l’exercice" :error="errors.name">
      <input
        :id="field.id"
        v-model="name"
        type="text"
        autocomplete="off"
        placeholder="Développé couché, rameur…"
        :aria-describedby="field.describedBy"
        :aria-invalid="field.invalid"
      />
    </FormField>

    <div v-if="config.usesMachine" class="stack">
      <FormField v-slot="field" label="Machine">
        <MachineField :id="field.id" v-model="machine" :brand="draft.brand" @pick="pickMachine" />
      </FormField>
      <div v-if="machinePage">
        <AppButton :href="machinePage" size="sm" icon="external">Voir la machine sur le site du fabricant</AppButton>
      </div>
      <FormField v-slot="field" label="Marque">
        <select :id="field.id" :value="draft.brand ?? ''" :aria-describedby="field.describedBy" @change="setBrand">
          <option value="">Aucune</option>
          <option v-for="brandId in BRAND_ORDER" :key="brandId" :value="brandId">{{ BRANDS[brandId].label }}</option>
        </select>
      </FormField>
    </div>

    <FormField v-slot="field" label="Muscles travaillés">
      <MultiSelect
        :id="field.id"
        v-model="muscles"
        :groups="muscleGroups"
        title="Muscles travaillés"
        placeholder="Aucun muscle choisi"
        :aria-describedby="field.describedBy"
      />
    </FormField>

    <FormField v-if="config.usesSettings" v-slot="field" label="Réglages à noter" hint="Vitesse, pente… à renseigner pour chaque palier pendant la séance.">
      <MultiSelect
        :id="field.id"
        v-model="settings"
        :groups="settingGroups"
        title="Réglages à noter"
        placeholder="Aucun réglage"
        :aria-describedby="field.describedBy"
      />
    </FormField>

    <section class="stack">
      <h2 class="section-title">Objectif par défaut</h2>
      <TargetsEditor v-model:targets="defaults" :category="draft.category" :settings="draft.settings" :errors="errors" />
    </section>

    <section class="stack">
      <h2 class="section-title">Comment faire le mouvement</h2>
      <MovementField v-model="movementId" :subject="movementSubject" />
    </section>

    <section class="stack">
      <h2 class="section-title">Photo de la machine</h2>
      <ImagePicker v-model="image" :current-src="imageSrc" :fallback-src="catalogImageSrc" :alt="imageAlt" />
    </section>

    <FormField v-slot="field" label="Notes" hint="Réglages du siège, prise, consignes…">
      <textarea :id="field.id" v-model="notes" :aria-describedby="field.describedBy" />
    </FormField>

    <ErrorMessage v-if="error" :message="error" />

    <div class="sticky-actions">
      <slot name="secondary-action" />
      <AppButton type="submit" variant="primary" icon="check" :loading="submitting">Enregistrer</AppButton>
    </div>
  </form>
</template>
