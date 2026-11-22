<script setup lang="ts">
import { computed } from 'vue'
import { useWorkoutStore } from '@/stores/workout'
import { useSessionLauncher } from '@/composables/useSessionLauncher'
import { listSessionDrafts } from '@/services/sessionDrafts'
import { recentActivity } from '@/domain/stats'
import { sortSessionsDesc } from '@/domain/sessions'
import { todayIso } from '@/domain/dates'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ActivityTiles from '@/components/stats/ActivityTiles.vue'
import RoutineCard from '@/components/routines/RoutineCard.vue'
import SessionCard from '@/components/sessions/SessionCard.vue'

const RECENT_DAYS = 30
const RECENT_SESSION_COUNT = 3

const workout = useWorkoutStore()
const launcher = useSessionLauncher()

const greeting = computed(() => `Salut ${workout.activeProfile?.name ?? ''}`)
const drafts = computed(() => (workout.activeProfile ? sortSessionsDesc(listSessionDrafts(workout.activeProfile.id)) : []))
const draftIds = computed(() => new Set(drafts.value.map((draft) => draft.id)))
const lastSessions = computed(() =>
  workout.sessions.filter((session) => !draftIds.value.has(session.id)).slice(0, RECENT_SESSION_COUNT),
)
const activity = computed(() => recentActivity(workout.sessions, todayIso(), RECENT_DAYS))
</script>

<template>
  <div class="page">
    <header>
      <p class="eyebrow">Carnet d’entraînement</p>
      <h1>{{ greeting }}</h1>
    </header>

    <section v-if="drafts.length > 0" class="stack">
      <h2 class="section-title">Séance en cours</h2>
      <SessionCard v-for="draft in drafts" :key="draft.id" :session="draft" in-progress />
    </section>

    <section class="stack">
      <div class="split">
        <h2 class="section-title">Démarrer une séance</h2>
        <AppButton size="sm" variant="ghost" icon="plus" @click="launcher.startEmpty">Séance libre</AppButton>
      </div>
      <EmptyState
        v-if="workout.routines.length === 0"
        icon="route"
        title="Aucun parcours pour l’instant"
        message="Crée tes exercices, puis assemble-les en parcours pour démarrer une séance en un geste."
      >
        <AppButton :to="{ name: 'exercises' }" icon="dumbbell">Exercices</AppButton>
        <AppButton :to="{ name: 'routine-new' }" variant="primary" icon="plus">Nouveau parcours</AppButton>
      </EmptyState>
      <RoutineCard
        v-for="routine in workout.routines"
        :key="routine.id"
        :routine="routine"
        :exercises-by-id="workout.exercisesById"
        @start="launcher.startFromRoutine(routine)"
      />
    </section>

    <section class="stack">
      <h2 class="section-title">30 derniers jours</h2>
      <ActivityTiles :activity="activity" />
    </section>

    <section v-if="lastSessions.length > 0" class="stack">
      <div class="split">
        <h2 class="section-title">Dernières séances</h2>
        <AppButton :to="{ name: 'sessions' }" size="sm" variant="ghost">Tout voir</AppButton>
      </div>
      <SessionCard v-for="session in lastSessions" :key="session.id" :session="session" />
    </section>
  </div>
</template>
