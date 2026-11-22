<script setup lang="ts">
import type { Profile } from '@/domain/types'
import { useSettingsStore } from '@/stores/settings'
import { useWorkoutStore } from '@/stores/workout'
import { useAsyncAction } from '@/composables/useAsyncAction'
import PageHeader from '@/components/ui/PageHeader.vue'
import ProfilesManager from '@/components/profiles/ProfilesManager.vue'
import GistSettings from '@/components/settings/GistSettings.vue'

const settings = useSettingsStore()
const workout = useWorkoutStore()
const profileAction = useAsyncAction()
const gistAction = useAsyncAction()

function createProfile(name: string) {
  profileAction.run(() => workout.addProfile(name))
}

function renameProfile(profileId: string, name: string) {
  profileAction.run(() => workout.renameProfile(profileId, name))
}

function removeProfile(profile: Profile) {
  const message = `Supprimer le profil « ${profile.name} » et toutes ses données (exercices, parcours, séances) ?`
  if (window.confirm(message)) profileAction.run(() => workout.deleteProfile(profile.id))
}

function connect(gistId: string, token: string) {
  gistAction.run(() => workout.connectGist(gistId, token))
}

function createGist(token: string) {
  gistAction.run(() => workout.createGistFromCurrentData(token))
}

function disconnect() {
  if (window.confirm('Cet appareil n’utilisera plus le gist. Les données du gist ne sont pas supprimées.')) {
    gistAction.run(() => workout.disconnectGist())
  }
}
</script>

<template>
  <div class="page">
    <PageHeader title="Réglages" :back-to="{ name: 'home' }" />

    <section class="stack">
      <h2 class="section-title">Profils</h2>
      <ProfilesManager
        :profiles="workout.profiles"
        :active-profile-id="settings.activeProfileId"
        :busy="profileAction.busy.value"
        :error="profileAction.error.value"
        @create="createProfile"
        @rename="renameProfile"
        @remove="removeProfile"
      />
    </section>

    <section class="stack">
      <h2 class="section-title">Sauvegarde GitHub Gist</h2>
      <GistSettings
        :key="String(settings.isGistConnected)"
        :connected="settings.isGistConnected"
        :gist-id="settings.gistId"
        :token="settings.token"
        :busy="gistAction.busy.value"
        :error="gistAction.error.value"
        @connect="connect"
        @create="createGist"
        @disconnect="disconnect"
      />
    </section>
  </div>
</template>
