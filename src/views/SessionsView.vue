<script setup lang="ts">
import { computed } from 'vue'
import { useWorkoutStore } from '@/stores/workout'
import { useSessionLauncher } from '@/composables/useSessionLauncher'
import { listSessionDrafts } from '@/services/sessionDrafts'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SessionCard from '@/components/sessions/SessionCard.vue'

const workout = useWorkoutStore()
const launcher = useSessionLauncher()

const draftIds = computed(
  () => new Set(workout.activeProfile ? listSessionDrafts(workout.activeProfile.id).map((draft) => draft.id) : []),
)
const rows = computed(() => workout.sessions.map((session) => ({ session, inProgress: draftIds.value.has(session.id) })))
</script>

<template>
  <div class="page">
    <PageHeader title="Historique" subtitle="Toutes tes séances">
      <template #actions>
        <AppButton variant="primary" icon="plus" @click="launcher.startEmpty">Séance</AppButton>
      </template>
    </PageHeader>

    <EmptyState
      v-if="rows.length === 0"
      icon="history"
      title="Aucune séance enregistrée"
      message="Démarre une séance depuis un parcours ou en séance libre."
    >
      <AppButton :to="{ name: 'routines' }" variant="primary" icon="route">Mes parcours</AppButton>
    </EmptyState>

    <SessionCard v-for="row in rows" :key="row.session.id" :session="row.session" :in-progress="row.inProgress" />
  </div>
</template>
