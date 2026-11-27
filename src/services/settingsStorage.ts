import { DEFAULT_GIST_ID } from '@/config'
import { normalizeHandedness, type Handedness } from '@/domain/handedness'
import { readJson, writeJson } from './browserStorage'

export interface AppSettings {
  gistId: string
  token: string
  activeProfileId: string | null
  handedness: Handedness
}

const SETTINGS_KEY = 'carnet-muscu:settings'

export function resolveSettings(stored: Partial<AppSettings>, defaultGistId: string): AppSettings {
  return {
    gistId: stored.gistId?.trim() || defaultGistId,
    token: stored.token ?? '',
    activeProfileId: stored.activeProfileId ?? null,
    handedness: normalizeHandedness(stored.handedness),
  }
}

export function loadSettings(): AppSettings {
  return resolveSettings(readJson<Partial<AppSettings>>(SETTINGS_KEY, {}), DEFAULT_GIST_ID)
}

export function saveSettings(settings: AppSettings): void {
  writeJson(SETTINGS_KEY, settings)
}
