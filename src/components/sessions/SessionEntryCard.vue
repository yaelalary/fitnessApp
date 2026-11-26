<script setup lang="ts">
import { computed } from 'vue'
import type { Exercise, SessionEntry, SetLog } from '@/domain/types'
import { categoryOf } from '@/domain/categories'
import { setNounTitle } from '@/domain/setNouns'
import { addSet, describePerformance, isEntryComplete, removeSet, updateSet } from '@/domain/sessions'
import AppButton from '@/components/ui/AppButton.vue'
import DragHandle from '@/components/ui/DragHandle.vue'
import NoteField from '@/components/ui/NoteField.vue'
import RemoveItemButton from '@/components/ui/RemoveItemButton.vue'
import ExerciseSummary from '@/components/exercises/ExerciseSummary.vue'
import RestTimer from './RestTimer.vue'
import IntervalsEditor from './IntervalsEditor.vue'
import SetRow from './SetRow.vue'

const props = defineProps<{
  entry: SessionEntry
  exercise: Exercise
  imageSrc: string | null
  previous: SessionEntry | null
  routineNote?: string
}>()

const emit = defineEmits<{ update: [entry: SessionEntry]; move: [offset: -1 | 1]; remove: [] }>()

const config = computed(() => categoryOf(props.entry.category))
const addSetLabel = computed(() => setNounTitle(config.value.setNoun))
const previousSummary = computed(() => (props.previous ? describePerformance(props.previous) : ''))
const complete = computed(() => isEntryComplete(props.entry))
const instructions = computed(() => [props.exercise.notes.trim(), props.routineNote ?? ''].filter((note) => note !== ''))

function patch(changes: Partial<SessionEntry>) {
  emit('update', { ...props.entry, ...changes })
}

function patchSet(index: number, changes: Partial<SetLog>) {
  emit('update', updateSet(props.entry, index, changes))
}
</script>

<template>
  <article class="card stack entry" :class="{ 'entry--complete': complete }">
    <ExerciseSummary :exercise="exercise" :image-src="imageSrc">
      <DragHandle :item-label="exercise.name" @move="emit('move', $event)" />
    </ExerciseSummary>
    <p v-if="previousSummary" class="small muted">Dernière fois : {{ previousSummary }}</p>
    <p v-for="note in instructions" :key="note" class="small notes">{{ note }}</p>

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
        <AppButton size="sm" icon="plus" @click="emit('update', addSet(entry))">{{ addSetLabel }}</AppButton>
        <RestTimer v-if="config.usesRest" :seconds="entry.restSeconds" />
      </div>
    </template>

    <IntervalsEditor v-else :entry="entry" :config="config" @update="emit('update', $event)" />

    <NoteField :model-value="entry.notes" @update:model-value="patch({ notes: $event })" />

    <RemoveItemButton @remove="emit('remove')" />
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
</style>
