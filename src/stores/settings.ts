import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { loadSettings, saveSettings } from '@/services/settingsStorage'
import type { Handedness } from '@/domain/handedness'

export const useSettingsStore = defineStore('settings', () => {
  const initial = loadSettings()
  const gistId = ref(initial.gistId)
  const token = ref(initial.token)
  const activeProfileId = ref<string | null>(initial.activeProfileId)
  const handedness = ref<Handedness>(initial.handedness)

  const isGistConnected = computed(() => gistId.value.trim() !== '' && token.value.trim() !== '')

  watch([gistId, token, activeProfileId, handedness], () => {
    saveSettings({ gistId: gistId.value, token: token.value, activeProfileId: activeProfileId.value, handedness: handedness.value })
  })

  function setConnection(nextGistId: string, nextToken: string) {
    gistId.value = nextGistId.trim()
    token.value = nextToken.trim()
  }

  function clearConnection() {
    gistId.value = ''
    token.value = ''
  }

  function setActiveProfile(profileId: string | null) {
    activeProfileId.value = profileId
  }

  function setHandedness(next: Handedness) {
    handedness.value = next
  }

  return { gistId, token, activeProfileId, handedness, isGistConnected, setConnection, clearConnection, setActiveProfile, setHandedness }
})
