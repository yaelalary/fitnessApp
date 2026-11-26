const requested = new Set<string>()

export function preloadImage(url: string): void {
  if (!url || requested.has(url)) return
  requested.add(url)
  const image = new Image()
  image.decoding = 'async'
  image.src = url
}
