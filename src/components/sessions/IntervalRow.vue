<script setup lang="ts">
import { computed } from 'vue'
import type { Interval } from '@/domain/types'
import type { CardioSettingId } from '@/domain/cardioSettings'
import AppButton from '@/components/ui/AppButton.vue'
import CheckableRow from './CheckableRow.vue'
import IntervalFields from './IntervalFields.vue'

const props = defineProps<{ interval: Interval; index: number; settings: CardioSettingId[]; removable: boolean }>()
const emit = defineEmits<{ update: [patch: Partial<Interval>]; remove: [] }>()

const number = computed(() => props.index + 1)
</script>

<template>
  <CheckableRow
    tag="li"
    :done="interval.done"
    :marker="String(number)"
    :label="`Palier ${number} fait`"
    @update:done="emit('update', { done: $event })"
  >
    <IntervalFields :interval="interval" :number="number" :settings="settings" @update="emit('update', $event)" />
    <template v-if="removable" #actions>
      <AppButton size="sm" variant="ghost" icon="close" icon-only :label="`Supprimer le palier ${number}`" @click="emit('remove')" />
    </template>
  </CheckableRow>
</template>
