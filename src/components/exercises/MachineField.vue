<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BrandId } from '@/domain/types'
import { BRANDS, findCatalogEntry, machineThumbnailUrl, type CatalogEntry } from '@/domain/machines'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import ExerciseThumb from './ExerciseThumb.vue'
import MachineGallery from './MachineGallery.vue'

const THUMBNAIL_WIDTH = 160

const props = defineProps<{ modelValue: string; brand: BrandId | null; id?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; pick: [entry: CatalogEntry] }>()

const galleryOpen = ref(false)
const typingCustom = ref(false)

const entry = computed(() => findCatalogEntry(props.brand, props.modelValue))
const showsCatalogMachine = computed(() => entry.value !== null && !typingCustom.value)
const showsCustomInput = computed(() => !showsCatalogMachine.value && (typingCustom.value || props.modelValue.trim() !== ''))
const thumbnail = computed(() => machineThumbnailUrl(entry.value?.imageUrl ?? null, THUMBNAIL_WIDTH))
const selectedName = computed(() => entry.value?.name ?? '')
const caption = computed(() => (entry.value ? `${BRANDS[entry.value.brand].label} · ${entry.value.line}` : ''))

function pick(selected: CatalogEntry) {
  typingCustom.value = false
  galleryOpen.value = false
  emit('pick', selected)
}

function chooseCustom() {
  typingCustom.value = true
  galleryOpen.value = false
  emit('update:modelValue', '')
}

function clear() {
  typingCustom.value = false
  emit('update:modelValue', '')
}

function onCustomInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="stack">
    <div v-if="showsCatalogMachine && entry" class="machine">
      <ExerciseThumb :src="thumbnail" :alt="entry.name" size="md" />
      <div class="machine__text">
        <p class="machine__name">{{ entry.name }}</p>
        <p class="small muted">{{ caption }}</p>
      </div>
      <div class="machine__actions">
        <AppButton :id="id" size="sm" @click="galleryOpen = true">Changer</AppButton>
        <AppButton size="sm" variant="ghost" icon="close" icon-only label="Retirer la machine" @click="clear" />
      </div>
    </div>

    <template v-else-if="showsCustomInput">
      <input
        :id="id"
        type="text"
        autocomplete="off"
        placeholder="Nom de la machine"
        :value="modelValue"
        @input="onCustomInput"
      />
      <AppButton size="sm" variant="ghost" icon="image" @click="galleryOpen = true">Choisir dans le catalogue</AppButton>
    </template>

    <AppButton v-else :id="id" icon="image" block @click="galleryOpen = true">Choisir une machine</AppButton>

    <AppDialog :open="galleryOpen" title="Choisir une machine" fullscreen @close="galleryOpen = false">
      <MachineGallery :initial-brand="brand" :selected-name="selectedName" @pick="pick" @custom="chooseCustom" />
    </AppDialog>
  </div>
</template>

<style scoped>
.machine {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.machine__text {
  flex: 1;
  min-width: 0;
}

.machine__name {
  font-weight: var(--weight-semibold);
  overflow-wrap: anywhere;
}

.machine__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}
</style>
