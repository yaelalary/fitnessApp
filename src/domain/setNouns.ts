export interface SetNoun {
  singular: string
  plural: string
  definite: string
  done: string
  atLeastOne: string
}

export const SERIES: SetNoun = {
  singular: 'série',
  plural: 'séries',
  definite: 'la série',
  done: 'faite',
  atLeastOne: 'Au moins une série.',
}

export const HOLDS: SetNoun = {
  singular: 'maintien',
  plural: 'maintiens',
  definite: 'le maintien',
  done: 'fait',
  atLeastOne: 'Au moins un maintien.',
}

export interface SetLabels {
  done: string
  reps: string
  weight: string
  remove: string
}

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase('fr') + text.slice(1)
}

export function setNounTitle(noun: SetNoun, plural = false): string {
  return capitalize(plural ? noun.plural : noun.singular)
}

export function setLabels(noun: SetNoun, repsLabel: string, number: number): SetLabels {
  return {
    done: `${setNounTitle(noun)} ${number} ${noun.done}`,
    reps: `${repsLabel} ${noun.singular} ${number}`,
    weight: `charge ${noun.singular} ${number}`,
    remove: `Supprimer ${noun.definite} ${number}`,
  }
}
