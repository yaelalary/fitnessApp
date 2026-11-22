<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BrandId } from '@/domain/types'
import { machineGroups, resolveMachineSelection } from '@/domain/machines'

const NO_MACHINE = ''
const CUSTOM_MACHINE = '__custom__'

const props = defineProps<{ modelValue: string; brand: BrandId | null; id?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const choosingCustom = ref(false)

const groups = computed(() => machineGroups(props.brand))
const hasCatalog = computed(() => groups.value.length > 0)
const selection = computed(() => resolveMachineSelection(props.brand, props.modelValue))
const isCustom = computed(() => !hasCatalog.value || choosingCustom.value || selection.value.kind === 'custom')
const selectValue = computed(() => {
  if (isCustom.value) return CUSTOM_MACHINE
  return selection.value.kind === 'catalog' ? selection.value.name : NO_MACHINE
})

function onSelect(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  choosingCustom.value = value === CUSTOM_MACHINE
  emit('update:modelValue', value === CUSTOM_MACHINE ? '' : value)
}

function onCustomInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="stack">
    <select v-if="hasCatalog" :id="id" :value="selectValue" @change="onSelect">
      <option :value="NO_MACHINE">Choisir une machine</option>
      <optgroup v-for="group in groups" :key="group.label" :label="group.label">
        <option v-for="machine in group.names" :key="machine" :value="machine">{{ machine }}</option>
      </optgroup>
      <option :value="CUSTOM_MACHINE">Autre machine…</option>
    </select>
    <input
      v-if="isCustom"
      :id="hasCatalog ? undefined : id"
      type="text"
      autocomplete="off"
      placeholder="Nom de la machine"
      :aria-label="hasCatalog ? 'Nom de la machine' : undefined"
      :value="modelValue"
      @input="onCustomInput"
    />
  </div>
</template>
