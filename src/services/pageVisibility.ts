export function isPageVisible(): boolean {
  return document.visibilityState === 'visible'
}

export function onPageVisible(callback: () => void): () => void {
  const listener = () => {
    if (isPageVisible()) callback()
  }
  document.addEventListener('visibilitychange', listener)
  return () => document.removeEventListener('visibilitychange', listener)
}
