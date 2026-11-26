import { ref, watch } from 'vue'
import { onPageVisible } from '@/services/pageVisibility'

const TICK_MS = 250

export function useDeadlineTicker(deadline: () => number | null, onReached: () => void) {
  const now = ref(Date.now())
  let ticker: ReturnType<typeof setInterval> | null = null

  function isPending(): boolean {
    const end = deadline()
    return end !== null && now.value < end
  }

  function sync() {
    const shouldTick = isPending()
    if (shouldTick && ticker === null) ticker = setInterval(tick, TICK_MS)
    if (!shouldTick && ticker !== null) {
      clearInterval(ticker)
      ticker = null
    }
  }

  function tick() {
    const end = deadline()
    const previous = now.value
    now.value = Date.now()
    if (end !== null && previous < end && end <= now.value) onReached()
    sync()
  }

  function refresh() {
    now.value = Date.now()
    sync()
  }

  watch(deadline, refresh)
  onPageVisible(tick)
  sync()

  return { now, refresh }
}
