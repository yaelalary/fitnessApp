import type { Session } from '@/domain/types'
import { normalizeSession } from '@/domain/profiles'
import { keysWithPrefix, readJson, removeKey, writeJson } from './browserStorage'

function draftPrefix(profileId: string): string {
  return `carnet-muscu:draft:${profileId}:`
}

function draftKey(profileId: string, sessionId: string): string {
  return `${draftPrefix(profileId)}${sessionId}`
}

function readDraft(key: string): Session | null {
  const stored = readJson<unknown>(key, null)
  return stored === null ? null : normalizeSession(stored)
}

export function loadSessionDraft(profileId: string, sessionId: string): Session | null {
  return readDraft(draftKey(profileId, sessionId))
}

export function saveSessionDraft(profileId: string, session: Session): void {
  writeJson(draftKey(profileId, session.id), session)
}

export function clearSessionDraft(profileId: string, sessionId: string): void {
  removeKey(draftKey(profileId, sessionId))
}

export function listSessionDrafts(profileId: string): Session[] {
  return keysWithPrefix(draftPrefix(profileId))
    .map(readDraft)
    .filter((session): session is Session => session !== null)
}
