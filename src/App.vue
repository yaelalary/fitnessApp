<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useWorkoutStore } from '@/stores/workout'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useHandednessAttribute } from '@/composables/useHandednessAttribute'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppNav from '@/components/layout/AppNav.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ProfileChooser from '@/components/profiles/ProfileChooser.vue'
import ToolsShortcut from '@/components/layout/ToolsShortcut.vue'
import RefillAlert from '@/components/tools/RefillAlert.vue'
import { useRefillStore } from '@/stores/refill'
import { useRestStore } from '@/stores/rest'
import RestBanner from '@/components/sessions/RestBanner.vue'

type Gate = 'loading' | 'error' | 'choose-profile' | 'content'

const route = useRoute()
const settings = useSettingsStore()
const workout = useWorkoutStore()
const creation = useAsyncAction()
const refill = useRefillStore()
const rest = useRestStore()
useHandednessAttribute()

const restBannerSessionId = computed(() => {
  const sessionId = rest.sessionId
  if (sessionId === null) return null
  return route.name === 'session' && route.params.id === sessionId ? null : sessionId
})
const showRefillAlert = computed(() => refill.phase === 'ready' && route.name !== 'tools')

const gate = computed<Gate>(() => {
  if (route.meta.standalone) return 'content'
  if (workout.status === 'idle' || workout.status === 'loading') return 'loading'
  if (workout.status === 'error') return 'error'
  if (route.meta.requiresProfile && !workout.activeProfile) return 'choose-profile'
  return 'content'
})

function createProfile(name: string) {
  creation.run(() => workout.addProfile(name))
}

onMounted(() => workout.load())
</script>

<template>
  <AppHeader
    :profiles="workout.profiles"
    :active-profile-id="workout.activeProfile?.id ?? null"
    :synced="workout.storageKind === 'gist'"
    @switch-profile="settings.setActiveProfile"
  >
    <ToolsShortcut :refill-phase="refill.phase" :refill-remaining-seconds="refill.remainingSeconds" />
  </AppHeader>
  <div class="banners">
    <RestBanner
      v-if="restBannerSessionId"
      :session-id="restBannerSessionId"
      :entry-id="rest.entryId"
      :exercise-name="rest.exerciseName"
      :remaining-seconds="rest.remainingSeconds"
      @stop="rest.stop"
    />
    <RefillAlert v-if="showRefillAlert" @refill="refill.start" @dismiss="refill.cancel" />
  </div>
  <main>
    <div v-if="gate === 'loading'" class="page">
      <LoadingState label="Chargement de tes séances…" />
    </div>
    <div v-else-if="gate === 'error'" class="page">
      <ErrorMessage :message="workout.loadError ?? 'Chargement impossible.'" retry-label="Réessayer" @retry="workout.load" />
      <AppButton :to="{ name: 'settings' }" icon="settings">Vérifier les réglages</AppButton>
    </div>
    <div v-else-if="gate === 'choose-profile'" class="page">
      <ProfileChooser
        :profiles="workout.profiles"
        :busy="creation.busy.value"
        :error="creation.error.value"
        @select="settings.setActiveProfile"
        @create="createProfile"
      />
    </div>
    <RouterView v-else v-slot="{ Component, route: current }">
      <component :is="Component" :key="`${workout.activeProfile?.id}:${current.path}`" />
    </RouterView>
  </main>
  <AppNav />
</template>

<style scoped>
.banners {
  position: sticky;
  top: var(--header-height);
  z-index: var(--z-sticky);
}
</style>
