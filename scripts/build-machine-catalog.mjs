import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUTPUT = fileURLToPath(new URL('../src/domain/machineCatalog.generated.ts', import.meta.url))
const USER_AGENT = 'Mozilla/5.0 (compatible; carnet-muscu-catalog/1.0)'
const CONCURRENCY = 4
const RETRIES = 2
const IMAGE_WIDTH = 800

const HAMMER_SITEMAP = 'https://www.lifefitness.com/en-us/sitemap.xml'
const HAMMER_CATEGORIES = {
  'plate-loaded': 'Plate-Loaded',
  selectorized: 'Charges guidées',
  benches: 'Bancs',
  'racks-rigs-platforms': 'Racks et plateformes',
  'cable-machines-functional-trainers': 'Poulies',
}
const HAMMER_NAME_PREFIXES = [/^hammer strength\s+/i, /^plate[- ]loaded\s+/i]

const TECHNOGYM_SITEMAP = 'https://www.technogym.com/fr-FR/products-sitemap.xml'
const TECHNOGYM_EXERCISE_TYPES = ['strength', 'cardio']
const TECHNOGYM_HOME_ONLY = 'home'
const TECHNOGYM_CABLE_STATION = /^(cable (station|crossover|tower)|kinesis)/i
const TECHNOGYM_CABLE_LINE = 'Cable Stations'
const CACHE_DIR = process.env.CATALOG_CACHE_DIR
const TECHNOGYM_IMAGE_PREFERENCE = ['packshot', 'large', 'card']

async function cachedPage(url) {
  if (!CACHE_DIR) return null
  const file = join(CACHE_DIR, createHash('sha1').update(url).digest('hex'))
  return { file, content: await readFile(file, 'utf8').catch(() => null) }
}

async function fetchText(url) {
  const cache = await cachedPage(url)
  if (cache?.content) return cache.content
  const content = await download(url)
  if (cache) {
    await mkdir(CACHE_DIR, { recursive: true })
    await writeFile(cache.file, content, 'utf8')
  }
  return content
}

async function download(url) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.text()
    } catch (error) {
      if (attempt >= RETRIES) throw new Error(`${url} : ${error.message}`)
    }
  }
}

async function imageIsReachable(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': USER_AGENT } })
    return response.ok && (response.headers.get('content-type') ?? '').startsWith('image/')
  } catch {
    return false
  }
}

async function mapWithConcurrency(items, worker) {
  const results = new Array(items.length)
  let next = 0
  let done = 0
  async function run() {
    while (next < items.length) {
      const index = next++
      results[index] = await worker(items[index]).catch((error) => {
        console.warn(`  ignoré : ${error.message}`)
        return null
      })
      done++
      if (done % 25 === 0) console.log(`  ${done}/${items.length}`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, run))
  return results
}

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim())
}

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
}

function cleanName(name) {
  return decodeEntities(name).replace(/[®™]/g, '').replace(/\s+/g, ' ').trim()
}

function withSearchParam(url, key, value) {
  const parsed = new URL(url)
  parsed.search = ''
  parsed.searchParams.set(key, String(value))
  return parsed.toString()
}

function hammerProductFromPage(html) {
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data
    try {
      data = JSON.parse(match[1])
    } catch {
      continue
    }
    if (data['@type'] === 'Product') return data
  }
  return null
}

function cleanHammerName(name) {
  return HAMMER_NAME_PREFIXES.reduce((current, prefix) => current.replace(prefix, ''), cleanName(name))
}

async function collectHammer() {
  console.log('Hammer Strength : lecture du sitemap Life Fitness')
  const pattern = /\/en-us\/catalog\/strength-training\/([^/]+)\/[^/]+$/
  const pages = sitemapUrls(await fetchText(HAMMER_SITEMAP))
    .map((url) => ({ url, category: url.match(pattern)?.[1] }))
    .filter((page) => page.category in HAMMER_CATEGORIES)
  console.log(`  ${pages.length} pages produit à examiner`)
  const products = await mapWithConcurrency(pages, async (page) => {
    const product = hammerProductFromPage(await fetchText(page.url))
    if (!product || product.brand?.name?.toLowerCase() !== 'hammer strength') return null
    const imageUrl = product.image ? withSearchParam(product.image, 'width', IMAGE_WIDTH) : null
    return { name: cleanHammerName(product.name), line: HAMMER_CATEGORIES[page.category], imageUrl, source: page.url }
  })
  return disambiguate(products.filter(Boolean))
}

function technogymProductFromPage(html) {
  const match = html.match(/<script[^>]*id="mobify-data"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return null
  return JSON.parse(match[1])?.__PRELOADED_STATE__?.pageProps?.product ?? null
}

function technogymImage(product) {
  for (const viewType of TECHNOGYM_IMAGE_PREFERENCE) {
    const image = product.imageGroups?.find((group) => group.viewType === viewType)?.images?.[0]
    const base = image?.disBaseLink ?? image?.link
    if (base) return withSearchParam(base, 'sw', IMAGE_WIDTH)
  }
  return null
}

function technogymLine(product) {
  if (product.c_productLine?.label) return product.c_productLine.label
  return TECHNOGYM_CABLE_STATION.test(product.name ?? '') ? TECHNOGYM_CABLE_LINE : null
}

function isTechnogymClubMachine(product) {
  const gymTypes = product.c_gym_type ?? []
  const homeOnly = gymTypes.length > 0 && gymTypes.every((type) => type === TECHNOGYM_HOME_ONLY)
  const exerciseTypes = product.c_exercise_type ?? []
  const isMachine =
    TECHNOGYM_CABLE_STATION.test(product.name ?? '') || exerciseTypes.some((type) => TECHNOGYM_EXERCISE_TYPES.includes(type))
  return !homeOnly && isMachine && technogymLine(product) !== null
}

async function collectTechnogym() {
  console.log('Technogym : lecture du sitemap produits')
  const pages = sitemapUrls(await fetchText(TECHNOGYM_SITEMAP)).filter((url) => url.includes('/product/'))
  console.log(`  ${pages.length} pages produit à examiner`)
  const products = await mapWithConcurrency(pages, async (url) => {
    const product = technogymProductFromPage(await fetchText(url))
    if (!product || !isTechnogymClubMachine(product)) return null
    return { name: cleanName(product.name), line: technogymLine(product), imageUrl: technogymImage(product), source: url }
  })
  return disambiguate(products.filter(Boolean))
}

function disambiguate(machines) {
  const byName = new Map()
  for (const machine of machines) {
    const key = machine.name.toLowerCase()
    if (!byName.has(key)) byName.set(key, machine)
  }
  return [...byName.values()].sort((a, b) => a.line.localeCompare(b.line, 'fr') || a.name.localeCompare(b.name, 'fr'))
}

async function verifyImages(machines) {
  const checks = await mapWithConcurrency(machines, async (machine) =>
    machine.imageUrl && (await imageIsReachable(machine.imageUrl)) ? machine.imageUrl : null,
  )
  return machines.map((machine, index) => ({ ...machine, imageUrl: checks[index] }))
}

function render(catalog) {
  const lines = [
    '// Fichier généré par scripts/build-machine-catalog.mjs (npm run catalog). Ne pas modifier à la main.',
    "import type { GeneratedMachine } from './machineCatalog'",
    '',
    'export const GENERATED_MACHINES: Record<"technogym" | "hammer-strength", GeneratedMachine[]> = {',
  ]
  for (const [brand, machines] of Object.entries(catalog)) {
    lines.push(`  ${JSON.stringify(brand)}: [`)
    for (const { name, line, imageUrl } of machines) {
      lines.push(`    { name: ${JSON.stringify(name)}, line: ${JSON.stringify(line)}, imageUrl: ${JSON.stringify(imageUrl)} },`)
    }
    lines.push('  ],')
  }
  lines.push('}', '')
  return lines.join('\n')
}

const hammer = await verifyImages(await collectHammer())
const technogym = await verifyImages(await collectTechnogym())
await writeFile(OUTPUT, render({ technogym, 'hammer-strength': hammer }), 'utf8')

for (const [label, machines] of [['Technogym', technogym], ['Hammer Strength', hammer]]) {
  const missing = machines.filter((machine) => !machine.imageUrl).length
  console.log(`${label} : ${machines.length} machines, ${missing} sans photo`)
}
console.log(`Catalogue écrit dans ${OUTPUT}`)
