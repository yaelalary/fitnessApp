import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  becameReadyBetween,
  cancelRefill,
  changeRefillDuration,
  refillPhase,
  refillProgress,
  refillRemainingSeconds,
  startRefill,
  type RefillTimer,
} from '@/domain/refill'
import { loadRefillTimer, saveRefillTimer } from '@/services/refillStorage'
import { showNotification, type AppNotification } from '@/services/notifications'
import { vibrateAlert } from '@/services/haptics'
import { isPageVisible, onPageVisible } from '@/services/pageVisibility'

const TICK_MS = 1000

export const REFILL_READY_NOTIFICATION: AppNotification = {
  title: 'Gourde',
  body: 'Tu peux remplir ta gourde à la water station.',
  tag: 'refill-ready',
}

export const useRefillStore = defineStore('refill', () => {
  const timer = ref<RefillTimer>(loadRefillTimer())
  const now = ref(Date.now())
  let ticker: ReturnType<typeof setInterval> | null = null

  const phase = computed(() => refillPhase(timer.value, now.value))
  const remainingSeconds = computed(() => refillRemainingSeconds(timer.value, now.value))
  const progress = computed(() => refillProgress(timer.value, now.value))
  const durationMinutes = computed(() => timer.value.durationMinutes)
  const endsAt = computed(() => timer.value.run?.endsAt ?? null)

  function announceReady() {
    if (isPageVisible()) vibrateAlert()
    else void showNotification(REFILL_READY_NOTIFICATION)
  }

  function syncTicker() {
    const shouldTick = phase.value === 'running'
    if (shouldTick && ticker === null) ticker = setInterval(tick, TICK_MS)
    if (!shouldTick && ticker !== null) {
      clearInterval(ticker)
      ticker = null
    }
  }

  function tick() {
    const previous = now.value
    now.value = Date.now()
    if (becameReadyBetween(timer.value, previous, now.value)) announceReady()
    syncTicker()
  }

  function update(next: RefillTimer) {
    timer.value = next
    saveRefillTimer(next)
    syncTicker()
  }

  function start() {
    now.value = Date.now()
    update(startRefill(timer.value, now.value))
  }

  function cancel() {
    update(cancelRefill(timer.value))
  }

  function setDuration(minutes: number) {
    update(changeRefillDuration(timer.value, minutes))
  }

  onPageVisible(() => {
    now.value = Date.now()
    syncTicker()
  })
  syncTicker()

  return { phase, remainingSeconds, progress, durationMinutes, endsAt, start, cancel, setDuration }
})
