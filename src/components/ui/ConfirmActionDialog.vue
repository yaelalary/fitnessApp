<script setup lang="ts">
import { computed } from 'vue'
import type { ConfirmRequest } from '@/composables/useConfirm'
import ConfirmDialog, { type DialogChoice } from './ConfirmDialog.vue'

type ConfirmChoice = 'cancel' | 'confirm'

const DEFAULT_CANCEL_LABEL = 'Annuler'

const props = defineProps<{ request: ConfirmRequest | null }>()
const emit = defineEmits<{ respond: [confirmed: boolean] }>()

const isOpen = computed(() => props.request !== null)
const title = computed(() => props.request?.title ?? '')
const message = computed(() => props.request?.message ?? '')
const choices = computed<DialogChoice<ConfirmChoice>[]>(() => [
  { id: 'cancel', label: props.request?.cancelLabel ?? DEFAULT_CANCEL_LABEL, variant: 'ghost', align: 'start' },
  {
    id: 'confirm',
    label: props.request?.confirmLabel ?? '',
    variant: props.request?.destructive ? 'danger' : 'primary',
  },
])

function choose(choice: ConfirmChoice) {
  emit('respond', choice === 'confirm')
}
</script>

<template>
  <ConfirmDialog
    :open="isOpen"
    :title="title"
    :message="message"
    :choices="choices"
    @choose="choose"
    @close="emit('respond', false)"
  />
</template>
