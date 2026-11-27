export type Handedness = 'right' | 'left'

export const DEFAULT_HANDEDNESS: Handedness = 'right'

export const HANDEDNESS_LABELS: Record<Handedness, string> = {
  right: 'Droitier',
  left: 'Gaucher',
}

export const HANDEDNESS_ORDER: Handedness[] = ['right', 'left']

export function normalizeHandedness(value: unknown): Handedness {
  return HANDEDNESS_ORDER.find((handedness) => handedness === value) ?? DEFAULT_HANDEDNESS
}
