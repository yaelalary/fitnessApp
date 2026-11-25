interface Identified {
  id: string
}

export function upsertById<T extends Identified>(list: readonly T[], item: T): T[] {
  const exists = list.some((current) => current.id === item.id)
  return exists ? list.map((current) => (current.id === item.id ? item : current)) : [...list, item]
}

export function removeById<T extends Identified>(list: readonly T[], id: string): T[] {
  return list.filter((item) => item.id !== id)
}

export function findById<T extends Identified>(list: readonly T[], id: string): T | undefined {
  return list.find((item) => item.id === id)
}

export function moveItem<T>(list: readonly T[], fromIndex: number, toIndex: number): T[] {
  const isValidIndex = (index: number) => Number.isInteger(index) && index >= 0 && index < list.length
  if (!isValidIndex(fromIndex) || !isValidIndex(toIndex) || fromIndex === toIndex) return [...list]
  const next = [...list]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function indexById<T extends Identified>(list: readonly T[]): Map<string, T> {
  return new Map(list.map((item) => [item.id, item]))
}

export function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function isSameData(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
