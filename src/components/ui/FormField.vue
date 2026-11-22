<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(defineProps<{ label: string; hint?: string; error?: string; hideLabel?: boolean }>(), {
  hint: '',
  error: '',
  hideLabel: false,
})

defineSlots<{ default(props: { id: string; describedBy: string | undefined; invalid: 'true' | undefined }): unknown }>()

const id = useId()
const messageId = `${id}-message`
const message = computed(() => props.error || props.hint)
const describedBy = computed(() => (message.value ? messageId : undefined))
const invalid = computed<'true' | undefined>(() => (props.error ? 'true' : undefined))
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label" :class="{ 'visually-hidden': hideLabel }">{{ label }}</label>
    <slot :id="id" :described-by="describedBy" :invalid="invalid" />
    <p v-if="message" :id="messageId" class="field__message" :class="{ 'field__message--error': error }">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.field__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
}

.field__message {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.field__message--error {
  color: var(--color-danger);
}
</style>
