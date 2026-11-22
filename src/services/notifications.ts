export type NotificationAccess = 'unsupported' | 'default' | 'granted' | 'denied'

export interface AppNotification {
  title: string
  body: string
  tag: string
}

const SERVICE_WORKER_URL = './sw.js'
const NOTIFICATION_ICON = './favicon.svg'

function isSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}

export function notificationAccess(): NotificationAccess {
  return isSupported() ? Notification.permission : 'unsupported'
}

export async function requestNotificationAccess(): Promise<NotificationAccess> {
  if (!isSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return notificationAccess()
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    await navigator.serviceWorker.register(SERVICE_WORKER_URL)
  } catch {
    return
  }
}

export async function showNotification(notification: AppNotification): Promise<boolean> {
  if (notificationAccess() !== 'granted') return false
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return false
    await registration.showNotification(notification.title, {
      body: notification.body,
      tag: notification.tag,
      icon: NOTIFICATION_ICON,
    })
    return true
  } catch {
    return false
  }
}
