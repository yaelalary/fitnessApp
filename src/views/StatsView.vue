<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MetricId } from '@/domain/metrics'
import { METRICS } from '@/domain/metrics'
import { categoryOf } from '@/domain/categories'
import { buildProgression, exercisesWithHistory, RECENT_DAYS, recentActivity, summarizeProgression, weeklySessionCounts } from '@/domain/stats'
import { todayIso } from '@/domain/dates'
import { formatNumber, formatSignedPercent, formatWithUnit } from '@/domain/numbers'
import { useWorkoutStore } from '@/stores/workout'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormField from '@/components/ui/FormField.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import StatTile from '@/components/ui/StatTile.vue'
import ProgressChart from '@/components/stats/ProgressChart.vue'
import ProgressTable from '@/components/stats/ProgressTable.vue'
import WeeklyChart from '@/components/stats/WeeklyChart.vue'
import ActivityTiles from '@/components/stats/ActivityTiles.vue'
import FunFactsSection from '@/components/stats/FunFactsSection.vue'
import MeasuresSection from '@/components/measures/MeasuresSection.vue'

const WEEKS_SHOWN = 12

const workout = useWorkoutStore()

const today = todayIso()
const activityTitle = `Activité des ${RECENT_DAYS} derniers jours`
const activity = computed(() => recentActivity(workout.sessions, today, RECENT_DAYS))
const weeks = computed(() => weeklySessionCounts(workout.sessions, WEEKS_SHOWN, today))

const trackedExercises = computed(() => exercisesWithHistory(workout.exercises, workout.sessions))
const exerciseId = ref<string>(trackedExercises.value[0]?.id ?? '')
const exercise = computed(() => workout.exercisesById.get(exerciseId.value) ?? null)
const metricOptions = computed(() =>
  exercise.value ? categoryOf(exercise.value.category).metrics.map((id) => ({ value: id, label: METRICS[id].label })) : [],
)
const metricId = ref<MetricId>(metricOptions.value[0]?.value ?? 'maxWeight')
const metric = computed(() => METRICS[metricId.value])

watch(exercise, () => {
  const available = metricOptions.value.map((option) => option.value)
  if (!available.includes(metricId.value)) metricId.value = available[0] ?? 'maxWeight'
})

const points = computed(() => (exercise.value ? buildProgression(workout.sessions, exercise.value.id, metricId.value) : []))
const summary = computed(() => summarizeProgression(points.value))
const summaryTiles = computed(() => {
  if (!summary.value) return []
  const unit = metric.value.unit
  const change = summary.value.changePercent
  return [
    { label: 'Dernière', value: formatNumber(summary.value.last), unit },
    { label: 'Record', value: formatNumber(summary.value.best), unit },
    {
      label: 'Évolution',
      value: change === null ? '—' : formatSignedPercent(change),
      unit: change === null ? '' : '%',
      hint: `depuis ${formatWithUnit(summary.value.first, unit)}`,
    },
  ]
})
</script>

<template>
  <div class="page">
    <PageHeader title="Statistiques" subtitle="Ta progression" />

    <div class="stats">
      <EmptyState
        v-if="workout.sessions.length === 0"
        icon="chart"
        title="Pas encore de séance"
        message="Enregistre quelques séances : tes charges, répétitions et ta régularité apparaîtront ici."
      />
      <template v-else>
        <FunFactsSection :sessions="workout.sessions" :today="today" />

        <section class="stack">
          <h2 class="section-title">{{ activityTitle }}</h2>
          <ActivityTiles :activity="activity" />
        </section>

        <section class="stack">
          <h2 class="section-title">Séances par semaine</h2>
          <div class="card">
            <WeeklyChart :weeks="weeks" />
          </div>
        </section>

        <section class="stack">
          <h2 class="section-title">Progression par exercice</h2>
          <p v-if="trackedExercises.length === 0" class="muted">Aucun exercice suivi dans tes séances pour l’instant.</p>
          <template v-else>
            <FormField v-slot="field" label="Exercice">
              <select :id="field.id" v-model="exerciseId">
                <option v-for="item in trackedExercises" :key="item.id" :value="item.id">{{ item.name }}</option>
              </select>
            </FormField>
            <SegmentedControl v-if="metricOptions.length > 1" v-model="metricId" :options="metricOptions" label="Mesure" />

            <p v-if="points.length === 0" class="muted">Pas de valeur pour cette mesure.</p>
            <template v-else>
              <div class="grid-3">
                <StatTile
                  v-for="tile in summaryTiles"
                  :key="tile.label"
                  :label="tile.label"
                  :value="tile.value"
                  :unit="tile.unit"
                  :hint="tile.hint"
                />
              </div>
              <div class="card stack">
                <h3 class="section-title">{{ metric.label }}</h3>
                <ProgressChart :points="points" :label="metric.label" :unit="metric.unit" />
                <ProgressTable :points="points" :label="metric.label" :unit="metric.unit" />
              </div>
            </template>
          </template>
        </section>
      </template>

      <MeasuresSection :today="today" />
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
}
</style>
