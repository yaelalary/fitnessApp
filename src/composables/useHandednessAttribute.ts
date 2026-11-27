import { watchEffect } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useHandednessAttribute() {
  const settings = useSettingsStore()
  watchEffect(() => {
    document.documentElement.dataset.handedness = settings.handedness
  })
}
