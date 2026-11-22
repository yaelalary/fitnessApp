<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ImageInput } from '@/domain/images'
import { isValidImageUrl } from '@/domain/images'
import { compressImage } from '@/services/imageCompression'
import { useAsyncAction } from '@/composables/useAsyncAction'
import AppButton from '@/components/ui/AppButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import ExerciseThumb from './ExerciseThumb.vue'

const props = defineProps<{ modelValue: ImageInput; currentSrc: string | null; alt: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: ImageInput] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const urlDraft = ref('')
const editingUrl = ref(false)
const { busy, error, run } = useAsyncAction()

const previewSrc = computed(() => {
  switch (props.modelValue.kind) {
    case 'keep':
      return props.currentSrc
    case 'upload':
      return props.modelValue.dataUrl
    case 'url':
      return props.modelValue.url
    case 'none':
      return null
  }
})

const urlError = computed(() =>
  urlDraft.value.trim() !== '' && !isValidImageUrl(urlDraft.value.trim()) ? 'Ce lien ne ressemble pas à une adresse web.' : '',
)

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const dataUrl = await run(() => compressImage(file))
  if (dataUrl) emit('update:modelValue', { kind: 'upload', dataUrl })
}

function applyUrl() {
  const url = urlDraft.value.trim()
  if (!url || urlError.value) return
  emit('update:modelValue', { kind: 'url', url })
  editingUrl.value = false
}
</script>

<template>
  <div class="stack">
    <ExerciseThumb :src="previewSrc" :alt="alt" size="lg" />
    <input ref="fileInput" type="file" accept="image/*" capture="environment" @change="onFileSelected" />
    <div class="cluster">
      <AppButton size="sm" icon="camera" :loading="busy" @click="fileInput?.click()">Photo</AppButton>
      <AppButton size="sm" icon="image" @click="editingUrl = !editingUrl">Lien</AppButton>
      <AppButton v-if="previewSrc" size="sm" variant="ghost" icon="trash" @click="emit('update:modelValue', { kind: 'none' })">
        Retirer
      </AppButton>
    </div>
    <div v-if="editingUrl" class="url-row">
      <FormField v-slot="field" label="Adresse de l’image" :error="urlError" hint="Copie le lien d’une photo de la machine.">
        <input
          :id="field.id"
          v-model="urlDraft"
          type="url"
          inputmode="url"
          placeholder="https://…"
          :aria-describedby="field.describedBy"
          :aria-invalid="field.invalid"
          @keydown.enter.prevent="applyUrl"
        />
      </FormField>
      <AppButton size="sm" variant="primary" :disabled="!urlDraft.trim() || Boolean(urlError)" @click="applyUrl">
        Utiliser
      </AppButton>
    </div>
    <ErrorMessage v-if="error" :message="error" />
  </div>
</template>

<style scoped>
.url-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.url-row > :first-child {
  align-self: stretch;
}
</style>
