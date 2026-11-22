const ALERT_VIBRATION_MS = [200, 100, 200]

export function vibrateAlert(): void {
  if ('vibrate' in navigator) navigator.vibrate(ALERT_VIBRATION_MS)
}
