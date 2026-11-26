<script setup lang="ts">
import { computed } from 'vue'
import type { SetLog } from '@/domain/types'
import type { CategoryConfig } from '@/domain/categories'
import { setLabels } from '@/domain/setNouns'
import AppButton from '@/components/ui/AppButton.vue'
import CheckableRow from './CheckableRow.vue'
import SetFields from './SetFields.vue'

const props = defineProps<{ set: SetLog; index: number; config: CategoryConfig }>()
defineEmits<{ update: [patch: Partial<SetLog>]; remove: [] }>()

const number = computed(() => props.index + 1)
const labels = computed(() => setLabels(props.config.setNoun, props.config.repsLabel, number.value))
</script>

<template>
  <CheckableRow
    tag="li"
    :done="set.done"
    :marker="String(number)"
    :label="labels.done"
    @update:done="$emit('update', { done: $event })"
  >
    <SetFields :set="set" :number="number" :config="config" @update="$emit('update', $event)" />
    <template #actions>
      <AppButton size="sm" variant="ghost" icon="close" icon-only :label="labels.remove" @click="$emit('remove')" />
    </template>
  </CheckableRow>
</template>
