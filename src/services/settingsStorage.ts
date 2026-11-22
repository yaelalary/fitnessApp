import { readJson, writeJson } from './browserStorage'

export interface AppSettings {
  gistId: string
  token: string
  activeProfileId: string | null
}

const SETTINGS_KEY = 'carnet-muscu:settings'

const DEFAULT_SETTINGS: AppSettings = { gistId: '', token: '', activeProfileId: null }

export function loadSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<AppSettings>>(SETTINGS_KEY, {}) }
}

export function saveSettings(settings: AppSettings): void {
  writeJson(SETTINGS_KEY, settings)
}
