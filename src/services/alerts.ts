import { showNotification, type AppNotification } from './notifications'
import { vibrateAlert } from './haptics'
import { isPageVisible } from './pageVisibility'

export function announce(notification: AppNotification): void {
  if (isPageVisible()) vibrateAlert()
  else void showNotification(notification)
}
