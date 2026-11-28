import type { LocationQuery, RouteLocationRaw } from 'vue-router'

const ENTRY_QUERY_KEY = 'exercice'

export function sessionEntryRoute(sessionId: string, entryId: string | null): RouteLocationRaw {
  const query = entryId ? { [ENTRY_QUERY_KEY]: entryId } : {}
  return { name: 'session', params: { id: sessionId }, query }
}

export function focusedEntryId(query: LocationQuery): string | null {
  const value = query[ENTRY_QUERY_KEY]
  return typeof value === 'string' && value !== '' ? value : null
}

export function entryAnchorId(entryId: string): string {
  return `entree-${entryId}`
}
