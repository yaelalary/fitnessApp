const MAX_DIMENSION = 480
const JPEG_QUALITY = 0.72

function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const ratio = Math.min(1, max / Math.max(width, height))
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) }
}

export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Ce fichier n’est pas une image.')
  const bitmap = await createImageBitmap(file)
  const size = fitWithin(bitmap.width, bitmap.height, MAX_DIMENSION)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Impossible de traiter l’image sur cet appareil.')
  context.drawImage(bitmap, 0, 0, size.width, size.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}
