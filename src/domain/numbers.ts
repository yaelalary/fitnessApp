const KG_PER_TONNE = 1000

const decimalFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

export function formatNumber(value: number): string {
  return decimalFormat.format(value)
}

export function formatWithUnit(value: number, unit: string): string {
  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value)
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function toSafeNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function percentChange(from: number, to: number): number | null {
  if (from === 0) return null
  return ((to - from) / from) * 100
}

export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count > 1 ? plural : singular}`
}

export function formatSignedNumber(value: number): string {
  return value > 0 ? `+${formatNumber(value)}` : formatNumber(value)
}

export interface FormattedQuantity {
  value: string
  unit: string
}

export function formatMass(kg: number): FormattedQuantity {
  if (Math.abs(kg) >= KG_PER_TONNE) return { value: formatNumber(roundTo(kg / KG_PER_TONNE, 1)), unit: 't' }
  return { value: formatNumber(Math.round(kg)), unit: 'kg' }
}

export function formatSignedPercent(value: number): string {
  return formatSignedNumber(Math.round(value))
}
