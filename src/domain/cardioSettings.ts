export type CardioSettingId = 'speed' | 'incline' | 'cadence' | 'level'

export interface CardioSettingConfig {
  id: CardioSettingId
  label: string
  unit: string
  step: number
  max: number
}

export const CARDIO_SETTINGS: Record<CardioSettingId, CardioSettingConfig> = {
  speed: { id: 'speed', label: 'Vitesse', unit: 'km/h', step: 0.5, max: 30 },
  incline: { id: 'incline', label: 'Pente', unit: '%', step: 0.5, max: 30 },
  cadence: { id: 'cadence', label: 'Cadence', unit: '/min', step: 5, max: 250 },
  level: { id: 'level', label: 'Niveau', unit: 'niv.', step: 1, max: 30 },
}

export const CARDIO_SETTING_ORDER: CardioSettingId[] = ['speed', 'incline', 'cadence', 'level']

export function isCardioSettingId(value: unknown): value is CardioSettingId {
  return typeof value === 'string' && Object.hasOwn(CARDIO_SETTINGS, value)
}

export function normalizeCardioSettings(value: unknown): CardioSettingId[] {
  if (!Array.isArray(value)) return []
  return CARDIO_SETTING_ORDER.filter((id) => value.includes(id))
}

export function cardioSettingOptions() {
  return CARDIO_SETTING_ORDER.map((id) => ({ value: id, label: `${CARDIO_SETTINGS[id].label} (${CARDIO_SETTINGS[id].unit})` }))
}
