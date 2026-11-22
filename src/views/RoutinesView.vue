<script setup lang="ts">
import { useWorkoutStore } from '@/stores/workout'
import { useSessionLauncher } from '@/composables/useSessionLauncher'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import RoutineCard from '@/components/routines/RoutineCard.vue'

const workout = useWorkoutStore()
const launcher = useSessionLauncher()
</script>

<template>
  <div class="page">
    <PageHeader title="Parcours" subtitle="Tes enchaînements d’exercices">
      <template #actions>
        <AppButton :to="{ name: 'routine-new' }" variant="primary" icon="plus">Nouveau</AppButton>
      </template>
    </PageHeader>

    <EmptyState
      v-if="workout.routines.length === 0"
      icon="route"
      title="Aucun parcours"
      message="Un parcours, c’est ta séance type : échauffement, machines dans l’ordre, cardio et étirements."
    >
      <AppButton :to="{ name: 'routine-new' }" variant="primary" icon="plus">Créer un parcours</AppButton>
    </EmptyState>

    <RoutineCard
      v-for="routine in workout.routines"
      :key="routine.id"
      :routine="routine"
      :exercises-by-id="workout.exercisesById"
      @start="launcher.startFromRoutine(routine)"
    />
  </div>
</template>
