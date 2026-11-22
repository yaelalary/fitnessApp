import { ref } from 'vue'

export function useAsyncAction() {
  const busy = ref(false)
  const error = ref<string | null>(null)

  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    busy.value = true
    error.value = null
    try {
      return await action()
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Une erreur inattendue est survenue.'
      return undefined
    } finally {
      busy.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return { busy, error, run, clearError }
}
