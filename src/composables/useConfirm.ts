import { ref } from 'vue'

export interface ConfirmRequest {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
}

export function useConfirm() {
  const request = ref<ConfirmRequest | null>(null)
  let answer: ((confirmed: boolean) => void) | null = null

  function ask(next: ConfirmRequest): Promise<boolean> {
    answer?.(false)
    request.value = next
    return new Promise((resolve) => {
      answer = resolve
    })
  }

  function respond(confirmed: boolean) {
    request.value = null
    answer?.(confirmed)
    answer = null
  }

  return { request, ask, respond }
}
