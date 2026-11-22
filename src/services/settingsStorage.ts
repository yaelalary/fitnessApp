import { DEFAULT_GIST_ID } from '@/config'
import { readJson, writeJson } from './browserStorage'

export interface AppSettings {
  gistId: string
  token: string
  activeProfileId: string | null
}

const SETTINGS_KEY = 'carnet-muscu:settings'

export function resolveSettings(stored: Partial<AppSettings>, defaultGistId: string): AppSettings {
  return {
    gistId: stored.gistId?.trim() || defaultGistId,
    token: stored.token ?? '',
    activeProfileId: stored.activeProfileId ?? null,
  }
}

export function loadSettings(): AppSettings {
  return resolveSettings(readJson<Partial<AppSettings>>(SETTINGS_KEY, {}), DEFAULT_GIST_ID)
}

export function saveSettings(settings: AppSettings): void {
  writeJson(SETTINGS_KEY, settings)
}
