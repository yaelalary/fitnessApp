<script setup lang="ts" generic="C extends string">
import { computed } from 'vue'
import AppButton from './AppButton.vue'
import AppDialog from './AppDialog.vue'
import type { IconName } from './icons'

export interface DialogChoice<Id extends string = string> {
  id: Id
  label: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  icon?: IconName
  align?: 'start' | 'end'
}

const props = withDefaults(
  defineProps<{ open: boolean; title: string; message: string; choices: readonly DialogChoice<C>[]; busyChoice?: C | null }>(),
  { busyChoice: null },
)
const emit = defineEmits<{ choose: [choice: C]; close: [] }>()

const isStart = (choice: DialogChoice<C>) => choice.align === 'start'

const buttons = computed(() => {
  const ordered = [...props.choices.filter(isStart), ...props.choices.filter((choice) => !isStart(choice))]
  const firstEnd = ordered.find((choice) => !isStart(choice))
  return ordered.map((choice) => ({
    ...choice,
    variant: choice.variant ?? 'secondary',
    loading: props.busyChoice === choice.id,
    disabled: props.busyChoice !== null && props.busyChoice !== choice.id,
    startsEndGroup: choice === firstEnd,
  }))
})
</script>

<template>
  <AppDialog :open="open" :title="title" @close="emit('close')">
    <p>{{ message }}</p>
    <template #footer>
      <div class="confirm__actions">
        <AppButton
          v-for="button in buttons"
          :key="button.id"
          size="sm"
          :class="{ 'confirm__end': button.startsEndGroup }"
          :variant="button.variant"
          :icon="button.icon"
          :loading="button.loading"
          :disabled="button.disabled"
          @click="emit('choose', button.id)"
        >
          {{ button.label }}
        </AppButton>
      </div>
    </template>
  </AppDialog>
</template>

<style scoped>
.confirm__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.confirm__end {
  margin-inline-start: auto;
}
</style>