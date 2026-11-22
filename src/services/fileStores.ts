import type { FileChanges } from '@/domain/types'
import { applyFileChanges } from '@/domain/storageFiles'
import { fetchGistFiles, StorageError, updateGistFiles } from './gistApi'
import { readJson, writeJson } from './browserStorage'

export interface FileStore {
  kind: 'gist' | 'local'
  readAll(): Promise<Record<string, string>>
  write(changes: FileChanges): Promise<void>
}

const LOCAL_FILES_KEY = 'carnet-muscu:files'

export function createLocalFileStore(): FileStore {
  return {
    kind: 'local',
    async readAll() {
      return readJson<Record<string, string>>(LOCAL_FILES_KEY, {})
    },
    async write(changes) {
      const next = applyFileChanges(readJson<Record<string, string>>(LOCAL_FILES_KEY, {}), changes)
      if (!writeJson(LOCAL_FILES_KEY, next)) {
        throw new StorageError('Stockage du navigateur plein ou indisponible.')
      }
    },
  }
}

export function createGistFileStore(gistId: string, token: string): FileStore {
  return {
    kind: 'gist',
    readAll: () => fetchGistFiles(gistId, token),
    write: (changes) => updateGistFiles(gistId, token, changes),
  }
}

export function readLocalFiles(): Record<string, string> {
  return readJson<Record<string, string>>(LOCAL_FILES_KEY, {})
}
