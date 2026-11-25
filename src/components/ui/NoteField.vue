<script setup lang="ts">
import FormField from './FormField.vue'

withDefaults(defineProps<{ modelValue: string; label?: string; placeholder?: string }>(), {
  label: 'Note',
  placeholder: 'Une note sur cet exercice…',
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <FormField v-slot="field" :label="label" hide-label>
    <input :id="field.id" type="text" :placeholder="placeholder" :value="modelValue" @change="onChange" />
  </FormField>
</template>
