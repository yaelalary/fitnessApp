import type { FileChanges } from '@/domain/types'

const API_URL = 'https://api.github.com'

export class StorageError extends Error {}

interface GistFile {
  content?: string
  truncated?: boolean
  raw_url?: string
}

interface GistResponse {
  id: string
  files: Record<string, GistFile | null>
}

const STATUS_MESSAGES: Record<number, string> = {
  401: 'Jeton GitHub refusé : vérifie-le dans les réglages.',
  403: 'Accès refusé par GitHub : le jeton doit avoir le droit « gist ».',
  404: 'Gist introuvable : vérifie son identifiant et le jeton.',
  422: 'GitHub a refusé la modification du gist.',
}

function headers(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: 'no-store',
      headers: { ...headers(token), ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    })
  } catch {
    throw new StorageError('Connexion à GitHub impossible. Vérifie ta connexion internet.')
  }
  if (!response.ok) {
    throw new StorageError(STATUS_MESSAGES[response.status] ?? `Erreur GitHub (${response.status}).`)
  }
  return (await response.json()) as T
}

async function readFileContent(file: GistFile): Promise<string> {
  if (!file.truncated && file.content !== undefined) return file.content
  if (!file.raw_url) return ''
  try {
    const response = await fetch(file.raw_url, { cache: 'no-store' })
    if (!response.ok) throw new StorageError('Lecture d’un fichier du gist impossible.')
    return await response.text()
  } catch (error) {
    throw error instanceof StorageError ? error : new StorageError('Lecture d’un fichier du gist impossible.')
  }
}

export async function fetchGistFiles(gistId: string, token: string): Promise<Record<string, string>> {
  const gist = await request<GistResponse>(`/gists/${encodeURIComponent(gistId)}`, token)
  const files = Object.entries(gist.files).filter((entry): entry is [string, GistFile] => entry[1] !== null)
  const contents = await Promise.all(files.map(async ([name, file]) => [name, await readFileContent(file)] as const))
  return Object.fromEntries(contents)
}

function toGistPayload(changes: FileChanges): Record<string, { content: string } | null> {
  return Object.fromEntries(
    Object.entries(changes).map(([name, content]) => [name, content === null ? null : { content }]),
  )
}

export async function updateGistFiles(gistId: string, token: string, changes: FileChanges): Promise<void> {
  if (Object.keys(changes).length === 0) return
  await request<GistResponse>(`/gists/${encodeURIComponent(gistId)}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ files: toGistPayload(changes) }),
  })
}

export async function createGist(token: string, description: string, files: Record<string, string>): Promise<string> {
  const gist = await request<GistResponse>('/gists', token, {
    method: 'POST',
    body: JSON.stringify({ description, public: false, files: toGistPayload(files) }),
  })
  return gist.id
}
