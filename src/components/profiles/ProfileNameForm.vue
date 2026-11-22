<script setup lang="ts">
import { ref } from 'vue'
import type { Profile } from '@/domain/types'
import { validateProfileName } from '@/domain/profiles'
import AppButton from '@/components/ui/AppButton.vue'
import FormField from '@/components/ui/FormField.vue'

const props = withDefaults(
  defineProps<{ initialName?: string; submitLabel: string; others: Profile[]; busy?: boolean }>(),
  { initialName: '', busy: false },
)

const emit = defineEmits<{ submit: [name: string] }>()

const name = ref(props.initialName)
const error = ref<string | undefined>()

function submit() {
  error.value = validateProfileName(name.value, props.others)
  if (!error.value) emit('submit', name.value.trim())
}
</script>

<template>
  <form class="name-form" novalidate @submit.prevent="submit">
    <FormField v-slot="field" label="Prénom" :error="error" hide-label>
      <input
        :id="field.id"
        v-model="name"
        type="text"
        autocomplete="given-name"
        placeholder="Prénom"
        :aria-describedby="field.describedBy"
        :aria-invalid="field.invalid"
      />
    </FormField>
    <AppButton type="submit" variant="primary" :loading="busy">{{ submitLabel }}</AppButton>
  </form>
</template>

<style scoped>
.name-form {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.name-form > :first-child {
  flex: 1;
}
</style>
