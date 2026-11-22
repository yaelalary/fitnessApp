<script setup lang="ts">
import { computed } from 'vue'
import type { Exercise, SessionEntry, SetLog } from '@/domain/types'
import { categoryOf } from '@/domain/categories'
import { addSet, describePerformance, isEntryComplete, removeSet, updateSet } from '@/domain/sessions'
import AppButton from '@/components/ui/AppButton.vue'
import FormField from '@/components/ui/FormField.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'
import ReorderControls from '@/components/ui/ReorderControls.vue'
import ExerciseSummary from '@/components/exercises/ExerciseSummary.vue'
import RestTimer from './RestTimer.vue'
import SetRow from './SetRow.vue'

const DISTANCE_STEP_KM = 0.1

const props = defineProps<{
  entry: SessionEntry
  exercise: Exercise
  imageSrc: string | null
  previous: SessionEntry | null
  index: number
  count: number
}>()

const emit = defineEmits<{ update: [entry: SessionEntry]; move: [offset: -1 | 1]; remove: [] }>()

const config = computed(() => categoryOf(props.entry.category))
const previousSummary = computed(() => (props.previous ? describePerformance(props.previous) : ''))
const complete = computed(() => isEntryComplete(props.entry))

function patch(changes: Partial<SessionEntry>) {
  emit('update', { ...props.entry, ...changes })
}

function patchSet(index: number, changes: Partial<SetLog>) {
  emit('update', updateSet(props.entry, index, changes))
}
</script>

<template>
  <article class="card stack entry" :class="{ 'entry--complete': complete }">
    <ExerciseSummary :exercise="exercise" :image-src="imageSrc" />
    <p v-if="previousSummary" class="small muted">Dernière fois : {{ previousSummary }}</p>
    <p v-if="exercise.notes" class="small notes">{{ exercise.notes }}</p>

    <template v-if="config.tracking === 'sets'">
      <ol class="stack">
        <SetRow
          v-for="(set, setIndex) in entry.sets"
          :key="setIndex"
          :set="set"
          :index="setIndex"
          :config="config"
          @update="patchSet(setIndex, $event)"
          @remove="emit('update', removeSet(entry, setIndex))"
        />
      </ol>
      <div class="cluster">
        <AppButton size="sm" icon="plus" @click="emit('update', addSet(entry))">Série</AppButton>
        <RestTimer v-if="config.usesRest" :seconds="entry.restSeconds" />
      </div>
    </template>

    <div v-else class="grid-2">
      <FormField v-slot="field" label="Durée">
        <NumberStepper
          :id="field.id"
          label="la durée"
          unit="min"
          :max="300"
          :model-value="entry.durationMinutes"
          @update:model-value="patch({ durationMinutes: $event })"
        />
      </FormField>
      <FormField v-if="config.usesDistance" v-slot="field" label="Distance">
        <NumberStepper
          :id="field.id"
          label="la distance"
          unit="km"
          :step="DISTANCE_STEP_KM"
          :max="200"
          :model-value="entry.distanceKm"
          @update:model-value="patch({ distanceKm: $event })"
        />
      </FormField>
    </div>

    <FormField v-slot="field" label="Note" hide-label>
      <input
        :id="field.id"
        type="text"
        placeholder="Une note sur cet exercice…"
        :value="entry.notes"
        @change="patch({ notes: ($event.target as HTMLInputElement).value })"
      />
    </FormField>

    <ReorderControls
      class="entry__controls"
      :index="index"
      :count="count"
      :item-label="exercise.name"
      @move="emit('move', $event)"
      @remove="emit('remove')"
    />
  </article>
</template>

<style scoped>
.entry {
  transition: border-color var(--duration-medium) var(--easing);
}

.entry--complete {
  border-color: var(--color-success);
}

.notes {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  white-space: pre-line;
}

.entry__controls {
  justify-content: flex-end;
}
</style>
