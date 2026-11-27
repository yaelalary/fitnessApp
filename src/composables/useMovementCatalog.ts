import { ref, shallowRef } from 'vue'
import type { Movement } from '@/domain/movements'
import { loadMovements } from '@/services/movementCatalog'

const movements = shallowRef<Movement[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useMovementCatalog() {
  async function ensureLoaded() {
    if (movements.value.length > 0 || loading.value) return
    loading.value = true
    error.value = null
    try {
      movements.value = await loadMovements()
    } catch {
      error.value = 'Impossible de charger les démonstrations. Vérifie ta connexion.'
    } finally {
      loading.value = false
    }
  }

  return { movements, loading, error, ensureLoaded }
}
