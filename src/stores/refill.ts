import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  cancelRefill,
  changeRefillDuration,
  refillPhase,
  refillProgress,
  refillRemainingSeconds,
  startRefill,
  type RefillTimer,
} from '@/domain/refill'
import { loadRefillTimer, saveRefillTimer } from '@/services/refillStorage'
import type { AppNotification } from '@/services/notifications'
import { announce } from '@/services/alerts'
import { useDeadlineTicker } from '@/composables/useDeadlineTicker'

export const REFILL_READY_NOTIFICATION: AppNotification = {
  title: 'Gourde',
  body: 'Tu peux remplir ta gourde à la water station.',
  tag: 'refill-ready',
}

export const useRefillStore = defineStore('refill', () => {
  const timer = ref<RefillTimer>(loadRefillTimer())
  const { now, refresh } = useDeadlineTicker(
    () => timer.value.run?.endsAt ?? null,
    () => announce(REFILL_READY_NOTIFICATION),
  )

  const phase = computed(() => refillPhase(timer.value, now.value))
  const remainingSeconds = computed(() => refillRemainingSeconds(timer.value, now.value))
  const progress = computed(() => refillProgress(timer.value, now.value))
  const durationMinutes = computed(() => timer.value.durationMinutes)
  const endsAt = computed(() => timer.value.run?.endsAt ?? null)

  function update(next: RefillTimer) {
    timer.value = next
    saveRefillTimer(next)
  }

  function start() {
    refresh()
    update(startRefill(timer.value, now.value))
  }

  function cancel() {
    update(cancelRefill(timer.value))
  }

  function setDuration(minutes: number) {
    update(changeRefillDuration(timer.value, minutes))
  }

  return { phase, remainingSeconds, progress, durationMinutes, endsAt, start, cancel, setDuration }
})
