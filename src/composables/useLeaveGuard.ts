import { onBeforeUnmount, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { warnBeforeUnload } from '@/services/pageUnload'

export type LeaveChoice = 'save' | 'discard' | 'stay'

interface LeaveGuardOptions {
  isDirty: () => boolean
  save?: () => Promise<boolean>
}

export function useLeaveGuard({ isDirty, save }: LeaveGuardOptions) {
  const open = ref(false)
  const saving = ref(false)
  const canSave = save !== undefined
  let leaveAllowed = false
  let answer: ((leave: boolean) => void) | null = null

  const mustAsk = () => !leaveAllowed && isDirty()

  function settle(leave: boolean) {
    if (!answer) return
    if (leave) leaveAllowed = true
    open.value = false
    answer(leave)
    answer = null
  }

  async function saveThenLeave() {
    if (!save) return
    saving.value = true
    try {
      settle(await save())
    } finally {
      saving.value = false
    }
  }

  const CHOICE_ACTIONS: Record<LeaveChoice, () => void | Promise<void>> = {
    save: saveThenLeave,
    discard: () => settle(true),
    stay: () => settle(false),
  }

  function choose(choice: LeaveChoice) {
    return CHOICE_ACTIONS[choice]()
  }

  function allowLeave() {
    leaveAllowed = true
  }

  onBeforeRouteLeave(() => {
    if (!mustAsk()) return true
    open.value = true
    return new Promise<boolean>((resolve) => {
      answer = resolve
    })
  })

  onBeforeUnmount(warnBeforeUnload(mustAsk))

  return { open, saving, canSave, choose, allowLeave }
}
