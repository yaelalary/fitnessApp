export type ValidationErrors<Field extends string> = Partial<Record<Field, string>>

export function hasErrors<Field extends string>(errors: ValidationErrors<Field>): boolean {
  return Object.values(errors).some(Boolean)
}

export function requiredText(value: string, message: string): string | undefined {
  return value.trim().length === 0 ? message : undefined
}

export function nonNegative(value: number, message: string): string | undefined {
  return !Number.isFinite(value) || value < 0 ? message : undefined
}
