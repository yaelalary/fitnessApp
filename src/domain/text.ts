export function searchableText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr')
}
