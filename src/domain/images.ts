import type { FileChanges, ImageStore } from './types'

const IMAGE_REF_PREFIX = 'gist:'
export const IMAGE_FILE_PREFIX = 'image-'

export type ImageInput =
  | { kind: 'keep' }
  | { kind: 'none' }
  | { kind: 'url'; url: string }
  | { kind: 'upload'; dataUrl: string }

export interface ImagePlan {
  imageRef: string | null
  files: FileChanges
}

export function isImageFileName(fileName: string): boolean {
  return fileName.startsWith(IMAGE_FILE_PREFIX)
}

export function imageFileName(imageId: string): string {
  return `${IMAGE_FILE_PREFIX}${imageId}.txt`
}

export function storedFileOf(imageRef: string | null): string | null {
  return imageRef?.startsWith(IMAGE_REF_PREFIX) ? imageRef.slice(IMAGE_REF_PREFIX.length) : null
}

export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export function resolveImageSrc(imageRef: string | null, images: ImageStore): string | null {
  if (!imageRef) return null
  const storedFile = storedFileOf(imageRef)
  if (storedFile) return images[storedFile] ?? null
  return isValidImageUrl(imageRef) ? imageRef : null
}

export function planImageChange(previousRef: string | null, input: ImageInput, newImageId: string): ImagePlan {
  if (input.kind === 'keep') return { imageRef: previousRef, files: {} }
  const previousFile = storedFileOf(previousRef)
  const files: FileChanges = previousFile ? { [previousFile]: null } : {}
  if (input.kind === 'none') return { imageRef: null, files }
  if (input.kind === 'url') return { imageRef: input.url.trim(), files }
  const fileName = imageFileName(newImageId)
  return { imageRef: `${IMAGE_REF_PREFIX}${fileName}`, files: { ...files, [fileName]: input.dataUrl } }
}

export function releaseImage(imageRef: string | null): FileChanges {
  const storedFile = storedFileOf(imageRef)
  return storedFile ? { [storedFile]: null } : {}
}
