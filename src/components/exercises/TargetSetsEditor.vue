<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExerciseTargets, SetTarget } from '@/domain/types'
import type { CategoryConfig } from '@/domain/categories'
import { setLabels, setNounTitle } from '@/domain/setNouns'
import {
  appendTargetSet,
  hasIdenticalSets,
  patchTargetSetAt,
  removeTargetSetAt,
  repeatSet,
  targetSets,
  withTargetSets,
} from '@/domain/setTargets'
import AppButton from '@/components/ui/AppButton.vue'
import CheckboxField from '@/components/ui/CheckboxField.vue'
import NumberStepper from '@/components/ui/NumberStepper.vue'
import CheckableRow from '@/components/sessions/CheckableRow.vue'
import SetFields from '@/components/sessions/SetFields.vue'

const MAX_SETS = 20

const props = defineProps<{ targets: ExerciseTargets; config: CategoryConfig }>()
const emit = defineEmits<{ 'update:targets': [targets: ExerciseTargets] }>()

const sets = computed(() => targetSets(props.targets))
const repeat = ref(hasIdenticalSets(sets.value))

const addLabel = computed(() => setNounTitle(props.config.setNoun))
const countUnit = computed(() => props.config.setNoun.plural)
const countLabel = computed(() => `le nombre de ${props.config.setNoun.plural}`)
const repeatedSet = computed(() => sets.value[0] ?? repeatSet(undefined, 1)[0])
const rows = computed(() =>
  sets.value.map((set, index) => ({
    set,
    index,
    number: index + 1,
    removeLabel: setLabels(props.config.setNoun, props.config.repsLabel, index + 1).remove,
  })),
)
const canRemove = computed(() => sets.value.length > 1)

function replace(next: SetTarget[]) {
  emit('update:targets', withTargetSets(props.targets, next))
}

function setRepeat(value: boolean) {
  repeat.value = value
  if (value) replace(repeatSet(sets.value[0], sets.value.length))
}

function patchRepeated(patch: Partial<SetTarget>) {
  replace(repeatSet({ ...repeatedSet.value, ...patch }, sets.value.length))
}
</script>

<template>
  <div class="stack">
    <CheckableRow v-if="repeat" :checkable="false" marker="×" :label="addLabel">
      <SetFields :set="repeatedSet" :number="1" :config="config" require-reps @update="patchRepeated" />
    </CheckableRow>
    <ol v-else class="stack">
      <CheckableRow v-for="row in rows" :key="row.index" tag="li" :checkable="false" :marker="String(row.number)" :label="addLabel">
        <SetFields
          :set="row.set"
          :number="row.number"
          :config="config"
          require-reps
          @update="replace(patchTargetSetAt(sets, row.index, $event))"
        />
        <template v-if="canRemove" #actions>
          <AppButton size="sm" variant="ghost" icon="close" icon-only :label="row.removeLabel" @click="replace(removeTargetSetAt(sets, row.index))" />
        </template>
      </CheckableRow>
    </ol>
    <div class="cluster repeat">
      <CheckboxField label="Répéter" :model-value="repeat" @update:model-value="setRepeat" />
      <NumberStepper
        v-if="repeat"
        class="repeat__count"
        compact
        :label="countLabel"
        :unit="countUnit"
        :min="1"
        :max="MAX_SETS"
        :model-value="sets.length"
        @update:model-value="replace(repeatSet(repeatedSet, $event))"
      />
      <AppButton v-else size="sm" icon="plus" @click="replace(appendTargetSet(sets))">{{ addLabel }}</AppButton>
    </div>
  </div>
</template>

<style scoped>
.repeat {
  flex-wrap: nowrap;
}

.repeat__count {
  flex: 1;
  min-width: 0;
}
</style>
