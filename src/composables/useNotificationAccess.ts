import { ref } from 'vue'
import {
  notificationAccess,
  requestNotificationAccess,
  showNotification,
  type AppNotification,
} from '@/services/notifications'

export function useNotificationAccess() {
  const access = ref(notificationAccess())
  const requesting = ref(false)
  const testFailed = ref(false)

  async function request() {
    requesting.value = true
    access.value = await requestNotificationAccess()
    requesting.value = false
  }

  async function sendTest(notification: AppNotification) {
    testFailed.value = !(await showNotification(notification))
  }

  return { access, requesting, testFailed, request, sendTest }
}
