import type { Session } from '@/domain/types'
import { keysWithPrefix, readJson, removeKey, writeJson } from './browserStorage'

function draftPrefix(profileId: string): string {
  return `carnet-muscu:draft:${profileId}:`
}

function draftKey(profileId: string, sessionId: string): string {
  return `${draftPrefix(profileId)}${sessionId}`
}

export function loadSessionDraft(profileId: string, sessionId: string): Session | null {
  return readJson<Session | null>(draftKey(profileId, sessionId), null)
}

export function saveSessionDraft(profileId: string, session: Session): void {
  writeJson(draftKey(profileId, session.id), session)
}

export function clearSessionDraft(profileId: string, sessionId: string): void {
  removeKey(draftKey(profileId, sessionId))
}

export function listSessionDrafts(profileId: string): Session[] {
  return keysWithPrefix(draftPrefix(profileId))
    .map((key) => readJson<Session | null>(key, null))
    .filter((session): session is Session => session !== null)
}
