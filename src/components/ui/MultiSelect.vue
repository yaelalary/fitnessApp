<script setup lang="ts">
import { computed, ref } from 'vue'
import { toggleValue } from '@/domain/collections'
import AppButton from './AppButton.vue'
import AppDialog from './AppDialog.vue'
import CheckboxField from './CheckboxField.vue'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectGroup {
  label: string
  options: MultiSelectOption[]
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{ modelValue: string[]; groups: readonly MultiSelectGroup[]; title: string; id?: string; placeholder?: string }>(),
  { id: undefined, placeholder: 'Choisir…' },
)
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const open = ref(false)

const labelByValue = computed(
  () => new Map(props.groups.flatMap((group) => group.options.map((option) => [option.value, option.label] as const))),
)
const selected = computed(() => new Set(props.modelValue))
const summary = computed(() => props.modelValue.map((value) => labelByValue.value.get(value) ?? value).join(', '))
const hasSelection = computed(() => props.modelValue.length > 0)
const triggerText = computed(() => (hasSelection.value ? summary.value : props.placeholder))

function toggle(value: string) {
  emit('update:modelValue', toggleValue(props.modelValue, value))
}
</script>

<template>
  <button v-bind="$attrs" :id="id" type="button" class="select-trigger" aria-haspopup="dialog" @click="open = true">
    <span class="truncate multi-select__text" :class="{ 'multi-select__placeholder': !hasSelection }">{{ triggerText }}</span>
  </button>

  <AppDialog :open="open" :title="title" @close="open = false">
    <div class="stack-lg">
      <fieldset v-for="group in groups" :key="group.label" class="multi-select__group">
        <legend class="eyebrow">{{ group.label }}</legend>
        <CheckboxField
          v-for="option in group.options"
          :key="option.value"
          :label="option.label"
          :model-value="selected.has(option.value)"
          @update:model-value="toggle(option.value)"
        />
      </fieldset>
      <AppButton variant="primary" icon="check" block @click="open = false">Valider</AppButton>
    </div>
  </AppDialog>
</template>

<style scoped>
.multi-select__text {
  display: block;
}

.multi-select__placeholder {
  color: var(--color-text-faint);
}

.multi-select__group {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
}
</style>
