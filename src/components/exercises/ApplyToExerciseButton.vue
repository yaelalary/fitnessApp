<script lang="ts">
export interface ExerciseUpdateProps {
  upToDate: boolean
  busy: boolean
  error: string
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{ upToDate: boolean; busy: boolean }>()
const emit = defineEmits<{ apply: [] }>()

const label = computed(() => (props.upToDate ? 'Exercice à jour' : 'Mettre à jour l’exercice'))
const icon = computed(() => (props.upToDate ? 'check' : 'refresh'))
</script>

<template>
  <AppButton size="sm" variant="ghost" :icon="icon" :loading="busy" :disabled="upToDate" @click="emit('apply')">{{ label }}</AppButton>
</template>
