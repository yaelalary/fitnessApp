export function createId(): string {
  const random = Math.random().toString(36).slice(2, 8)
  return `${Date.now().toString(36)}${random}`
}
