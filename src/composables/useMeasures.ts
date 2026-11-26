import { computed, ref, watch } from 'vue'
import type { Measure } from '@/domain/types'
import { addMeasureEntry, removeMeasureEntry } from '@/domain/measures'
import { findById } from '@/domain/collections'
import { useWorkoutStore } from '@/stores/workout'
import { useAsyncAction } from './useAsyncAction'

export function useMeasures() {
  const workout = useWorkoutStore()
  const { busy, error, run, clearError } = useAsyncAction()
  const selectedId = ref('')

  const measures = computed(() => workout.measures)
  const selected = computed(() => findById(measures.value, selectedId.value) ?? null)

  watch(
    measures,
    (list) => {
      if (!findById(list, selectedId.value)) selectedId.value = list[0]?.id ?? ''
    },
    { immediate: true },
  )

  async function create(measure: Measure): Promise<boolean> {
    const done = await run(async () => {
      await workout.saveMeasure(measure)
      return true
    })
    if (done) selectedId.value = measure.id
    return done === true
  }

  function change(update: (measure: Measure) => Measure) {
    const current = selected.value
    if (current) void run(() => workout.saveMeasure(update(current)))
  }

  function addEntry(date: string, value: number) {
    change((measure) => addMeasureEntry(measure, date, value))
  }

  function removeEntry(entryId: string) {
    change((measure) => removeMeasureEntry(measure, entryId))
  }

  async function removeSelected() {
    const current = selected.value
    if (!current) return
    await run(() => workout.deleteMeasure(current.id))
  }

  return { measures, selectedId, selected, busy, error, clearError, create, addEntry, removeEntry, removeSelected }
}
