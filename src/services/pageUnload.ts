export function warnBeforeUnload(shouldWarn: () => boolean): () => void {
  const listener = (event: BeforeUnloadEvent) => {
    if (shouldWarn()) event.preventDefault()
  }
  window.addEventListener('beforeunload', listener)
  return () => window.removeEventListener('beforeunload', listener)
}
