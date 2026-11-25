<script setup lang="ts">
import { computed } from 'vue'
import type { LeaveChoice } from '@/composables/useLeaveGuard'
import ConfirmDialog, { type DialogChoice } from './ConfirmDialog.vue'

const props = defineProps<{ open: boolean; canSave: boolean; saving: boolean }>()
const emit = defineEmits<{ choose: [choice: LeaveChoice] }>()

const LEAVE_CHOICES: DialogChoice<LeaveChoice>[] = [
  { id: 'stay', label: 'Rester', variant: 'ghost', align: 'start' },
  { id: 'discard', label: 'Quitter', variant: 'danger' },
  { id: 'save', label: 'Enregistrer', variant: 'primary' },
]

const choices = computed(() => LEAVE_CHOICES.filter((choice) => props.canSave || choice.id !== 'save'))
const busyChoice = computed<LeaveChoice | null>(() => (props.saving ? 'save' : null))
</script>

<template>
  <ConfirmDialog
    :open="open"
    title="Quitter sans enregistrer ?"
    message="Tes modifications seront perdues si tu ne les enregistres pas avant de quitter la page."
    :choices="choices"
    :busy-choice="busyChoice"
    @choose="emit('choose', $event)"
    @close="emit('choose', 'stay')"
  />
</template>
