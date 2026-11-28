import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { countdownRemainingSeconds } from '@/domain/countdown'
import { isRestRunning, restBelongsTo, restOverNotification, startRest, type RestStart, type RestTimer } from '@/domain/rest'
import { loadRestTimer, saveRestTimer } from '@/services/restStorage'
import { announce } from '@/services/alerts'
import { useDeadlineTicker } from '@/composables/useDeadlineTicker'

export const useRestStore = defineStore('rest', () => {
  const rest = ref<RestTimer | null>(loadRestTimer(Date.now()))

  function update(next: RestTimer | null) {
    rest.value = next
    saveRestTimer(next)
  }

  function finish() {
    if (rest.value) announce(restOverNotification(rest.value))
    update(null)
  }

  const { now, refresh } = useDeadlineTicker(() => rest.value?.run.endsAt ?? null, finish)

  const running = computed(() => isRestRunning(rest.value, now.value))
  const remainingSeconds = computed(() => countdownRemainingSeconds(rest.value?.run ?? null, now.value))
  const sessionId = computed(() => (running.value ? (rest.value?.sessionId ?? null) : null))
  const exerciseName = computed(() => rest.value?.exerciseName ?? '')
  const entryId = computed(() => rest.value?.entryId ?? null)

  function start(request: RestStart) {
    refresh()
    update(startRest(request, now.value))
  }

  function stop() {
    update(null)
  }

  function isRunningFor(session: string, entryId?: string): boolean {
    return running.value && restBelongsTo(rest.value, session, entryId)
  }

  function stopForSession(session: string) {
    if (restBelongsTo(rest.value, session)) stop()
  }

  return { running, remainingSeconds, sessionId, entryId, exerciseName, start, stop, isRunningFor, stopForSession }
})
