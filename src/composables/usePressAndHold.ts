import { onBeforeUnmount, ref } from 'vue'

const HOLD_DELAY_MS = 150

export function usePressAndHold() {
  const active = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function clearTimer() {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  function press(event: PointerEvent) {
    if (event.button !== 0) return
    ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
    clearTimer()
    timer = setTimeout(() => {
      active.value = true
    }, HOLD_DELAY_MS)
  }

  function release() {
    clearTimer()
    active.value = false
  }

  function pressKey(event: KeyboardEvent) {
    if (event.repeat) return
    active.value = true
  }

  onBeforeUnmount(clearTimer)

  return { active, press, release, pressKey }
}
