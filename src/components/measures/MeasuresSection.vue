<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Measure } from '@/domain/types'
import { describeMeasure } from '@/domain/measures'
import { useMeasures } from '@/composables/useMeasures'
import { useConfirm } from '@/composables/useConfirm'
import AppButton from '@/components/ui/AppButton.vue'
import ConfirmActionDialog from '@/components/ui/ConfirmActionDialog.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import MeasurePanel from './MeasurePanel.vue'
import NewMeasureDialog from './NewMeasureDialog.vue'

defineProps<{ today: string }>()

const { measures, selectedId, selected, busy, error, clearError, create, addEntry, removeEntry, removeSelected } = useMeasures()
const confirm = useConfirm()
const dialogOpen = ref(false)

const options = computed(() => measures.value.map((measure) => ({ value: measure.id, label: describeMeasure(measure) })))
const hasMeasures = computed(() => measures.value.length > 0)
const panelError = computed(() => (dialogOpen.value ? null : error.value))

function openDialog() {
  clearError()
  dialogOpen.value = true
}

async function createMeasure(measure: Measure) {
  if (await create(measure)) dialogOpen.value = false
}

async function deleteSelected() {
  const measure = selected.value
  if (!measure) return
  const confirmed = await confirm.ask({
    title: `Supprimer « ${measure.name} » ?`,
    message: 'La mesure et toutes ses valeurs seront effacées.',
    confirmLabel: 'Supprimer',
    destructive: true,
  })
  if (confirmed) await removeSelected()
}
</script>

<template>
  <section class="stack">
    <div class="split">
      <h2 class="section-title">Mesures</h2>
      <AppButton size="sm" icon="plus" @click="openDialog">Nouvelle mesure</AppButton>
    </div>

    <p v-if="!hasMeasures" class="muted">Suis ton poids, ton tour de taille ou toute autre mesure, et vois leur évolution.</p>
    <template v-else>
      <FormField v-slot="field" label="Mesure">
        <select :id="field.id" v-model="selectedId">
          <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </FormField>
      <MeasurePanel
        v-if="selected"
        :key="selected.id"
        :measure="selected"
        :today="today"
        :busy="busy"
        @add="addEntry"
        @remove-entry="removeEntry"
        @delete="deleteSelected"
      />
    </template>
    <ErrorMessage v-if="panelError" :message="panelError" />

    <NewMeasureDialog
      :open="dialogOpen"
      :measures="measures"
      :busy="busy"
      :error="error"
      @create="createMeasure"
      @close="dialogOpen = false"
    />
    <ConfirmActionDialog :request="confirm.request.value" @respond="confirm.respond" />
  </section>
</template>
