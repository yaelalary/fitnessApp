import { computed, onBeforeUnmount, ref } from 'vue'
import { vibrateAlert } from '@/services/haptics'

const TICK_MS = 250

export function useCountdown() {
  const endsAt = ref<number | null>(null)
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | null = null

  const remainingSeconds = computed(() => (endsAt.value === null ? 0 : Math.max(0, (endsAt.value - now.value) / 1000)))
  const running = computed(() => endsAt.value !== null)

  function clearTimer() {
    if (timer !== null) clearInterval(timer)
    timer = null
  }

  function stop() {
    clearTimer()
    endsAt.value = null
  }

  function finish() {
    stop()
    vibrateAlert()
  }

  function start(seconds: number) {
    clearTimer()
    now.value = Date.now()
    endsAt.value = now.value + seconds * 1000
    timer = setInterval(() => {
      now.value = Date.now()
      if (remainingSeconds.value <= 0) finish()
    }, TICK_MS)
  }

  onBeforeUnmount(clearTimer)

  return { remainingSeconds, running, start, stop }
}
