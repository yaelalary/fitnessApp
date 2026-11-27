import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const SOURCE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const OUTPUT = fileURLToPath(new URL('../src/domain/movementCatalog.generated.ts', import.meta.url))

const response = await fetch(SOURCE)
if (!response.ok) throw new Error(`${SOURCE} : HTTP ${response.status}`)
const exercises = await response.json()

const movements = exercises
  .filter((exercise) => Array.isArray(exercise.images) && exercise.images.length > 0)
  .map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    category: exercise.category ?? 'other',
    equipment: exercise.equipment ?? 'other',
    muscles: exercise.primaryMuscles ?? [],
    instructions: exercise.instructions ?? [],
    images: exercise.images,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'))

const lines = [
  '// Fichier généré par scripts/build-movement-catalog.mjs (npm run movements). Ne pas modifier à la main.',
  '// Source : free-exercise-db (https://github.com/yuhonas/free-exercise-db), domaine public (Unlicense).',
  "import type { Movement } from './movements'",
  '',
  'export const GENERATED_MOVEMENTS: Movement[] = [',
  ...movements.map((movement) => `  ${JSON.stringify(movement)},`),
  ']',
  '',
]
await writeFile(OUTPUT, lines.join('\n'), 'utf8')
console.log(`${movements.length} mouvements écrits dans ${OUTPUT}`)
