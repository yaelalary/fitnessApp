<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { movementOrigin, movementSearchQuery, NO_MOVEMENT, resolveMovement, type MovementSubject } from '@/domain/movements'
import { useMovementCatalog } from '@/composables/useMovementCatalog'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import MovementDemo from './MovementDemo.vue'
import MovementPicker from './MovementPicker.vue'

const ORIGIN_MESSAGES = {
  missing: 'Aucune démonstration trouvée automatiquement pour ce nom. Choisis-en une dans la base.',
  none: 'Pas de démonstration pour cet exercice.',
  waiting: 'Donne un nom à l’exercice ou choisis une machine : une démonstration sera cherchée automatiquement.',
}

const props = defineProps<{ subject: Omit<MovementSubject, 'movementId'> }>()
const movementId = defineModel<string | null>({ required: true })

const { movements, loading, error, ensureLoaded } = useMovementCatalog()
const pickerOpen = ref(false)

const subject = computed<MovementSubject>(() => ({ ...props.subject, movementId: movementId.value }))
const origin = computed(() => movementOrigin(subject.value))
const movement = computed(() => resolveMovement(movements.value, subject.value))
const message = computed(() => {
  if (origin.value === 'none') return ORIGIN_MESSAGES.none
  if (origin.value !== 'automatic') return ''
  if (movement.value) return ''
  return searchQuery.value ? ORIGIN_MESSAGES.missing : ORIGIN_MESSAGES.waiting
})
const searchQuery = computed(() => movementSearchQuery(subject.value))
const initialQuery = computed(() => movement.value?.name ?? searchQuery.value)
const pickLabel = computed(() => (movement.value ? 'Changer' : 'Choisir une démonstration'))
const canRemove = computed(() => movement.value !== null)
const selectedId = computed(() => movement.value?.id ?? null)
const canRestoreAutomatic = computed(() => origin.value !== 'automatic')

onMounted(() => {
  void ensureLoaded()
})

function openPicker() {
  void ensureLoaded()
  pickerOpen.value = true
}

function pick(id: string) {
  movementId.value = id
  pickerOpen.value = false
}
</script>

<template>
  <div class="stack">
    <LoadingState v-if="loading" label="Recherche d’une démonstration…" />
    <ErrorMessage v-else-if="error" :message="error" retry-label="Réessayer" @retry="ensureLoaded" />
    <template v-else>
      <MovementDemo v-if="movement" :movement="movement" />
      <p v-if="message" class="muted small">{{ message }}</p>
    </template>
    <div class="cluster">
      <AppButton size="sm" icon="image" @click="openPicker">{{ pickLabel }}</AppButton>
      <AppButton v-if="canRemove" size="sm" variant="ghost" icon="close" @click="movementId = NO_MOVEMENT">Retirer</AppButton>
      <AppButton v-if="canRestoreAutomatic" size="sm" variant="ghost" icon="refresh" @click="movementId = null">
        Trouver automatiquement
      </AppButton>
    </div>

    <AppDialog :open="pickerOpen" title="Choisir une démonstration" fullscreen @close="pickerOpen = false">
      <LoadingState v-if="loading" label="Chargement des mouvements…" />
      <ErrorMessage v-else-if="error" :message="error" retry-label="Réessayer" @retry="ensureLoaded" />
      <MovementPicker v-else :movements="movements" :initial-query="initialQuery" :selected-id="selectedId" @pick="pick" />
    </AppDialog>
  </div>
</template>
