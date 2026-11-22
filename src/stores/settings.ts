import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { loadSettings, saveSettings } from '@/services/settingsStorage'

export const useSettingsStore = defineStore('settings', () => {
  const initial = loadSettings()
  const gistId = ref(initial.gistId)
  const token = ref(initial.token)
  const activeProfileId = ref<string | null>(initial.activeProfileId)

  const isGistConnected = computed(() => gistId.value.trim() !== '' && token.value.trim() !== '')

  watch([gistId, token, activeProfileId], () => {
    saveSettings({ gistId: gistId.value, token: token.value, activeProfileId: activeProfileId.value })
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

  return { gistId, token, activeProfileId, isGistConnected, setConnection, clearConnection, setActiveProfile }
})
