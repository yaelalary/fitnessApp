<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BrandId } from '@/domain/types'
import {
  BRANDS,
  CATALOG_BRANDS,
  CATALOG_ENTRIES,
  catalogLines,
  filterCatalog,
  machineThumbnailUrl,
  type CatalogEntry,
} from '@/domain/machines'
import { countLabel } from '@/domain/numbers'
import AppButton from '@/components/ui/AppButton.vue'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl.vue'
import ExerciseThumb from './ExerciseThumb.vue'

const THUMBNAIL_WIDTH = 320

const props = defineProps<{ initialBrand: BrandId | null; selectedName: string }>()
const emit = defineEmits<{ pick: [entry: CatalogEntry]; custom: [] }>()

const query = ref('')
const brand = ref<BrandId | null>(props.initialBrand && CATALOG_BRANDS.includes(props.initialBrand) ? props.initialBrand : null)
const line = ref<string | null>(null)

const brandOptions: SegmentOption<BrandId | null>[] = [
  { value: null, label: 'Toutes' },
  ...CATALOG_BRANDS.map((id) => ({ value: id, label: BRANDS[id].label })),
]
const lineOptions = computed<SegmentOption<string | null>[]>(() => [
  { value: null, label: 'Toutes les gammes' },
  ...catalogLines(brand.value).map((name) => ({ value: name, label: name })),
])
const hasLines = computed(() => lineOptions.value.length > 2)

const cards = computed(() =>
  filterCatalog(CATALOG_ENTRIES, { brand: brand.value, line: line.value, query: query.value }).map((entry) => ({
    entry,
    key: `${entry.brand}:${entry.name}`,
    thumbnail: machineThumbnailUrl(entry.imageUrl, THUMBNAIL_WIDTH),
    caption: brand.value ? entry.line : `${BRANDS[entry.brand].label} · ${entry.line}`,
    selected: entry.name === props.selectedName,
  })),
)
const resultLabel = computed(() => countLabel(cards.value.length, 'machine'))

function setBrand(value: BrandId | null) {
  brand.value = value
  line.value = null
}

function setQuery(event: Event) {
  query.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <div class="gallery">
    <div class="gallery__filters stack">
      <input
        type="search"
        :value="query"
        placeholder="Chest press, leg, bench…"
        aria-label="Rechercher une machine"
        autocomplete="off"
        @input="setQuery"
      />
      <SegmentedControl :model-value="brand" :options="brandOptions" label="Marque" @update:model-value="setBrand" />
      <SegmentedControl v-if="hasLines" v-model="line" :options="lineOptions" label="Gamme" />
      <p class="small muted" aria-live="polite">{{ resultLabel }}</p>
    </div>

    <ul v-if="cards.length > 0" class="gallery__grid">
      <li v-for="card in cards" :key="card.key">
        <button
          type="button"
          class="gallery__card"
          :class="{ 'gallery__card--selected': card.selected }"
          :aria-pressed="card.selected"
          @click="emit('pick', card.entry)"
        >
          <ExerciseThumb :src="card.thumbnail" :alt="card.entry.name" size="square" />
          <span class="gallery__name">{{ card.entry.name }}</span>
          <span class="small muted">{{ card.caption }}</span>
        </button>
      </li>
    </ul>
    <p v-else class="muted">Aucune machine ne correspond. Essaie un autre mot ou une autre marque.</p>

    <div class="gallery__custom stack">
      <p class="small muted">Ta machine n’est pas dans le catalogue ?</p>
      <AppButton icon="edit" block @click="emit('custom')">Saisir son nom</AppButton>
    </div>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.gallery__filters {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  gap: var(--space-2);
  padding: var(--space-3) 0 var(--space-2);
  background: var(--color-surface);
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--field-min-width), 1fr));
  gap: var(--space-3);
}

.gallery__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
  height: 100%;
  padding: var(--space-2);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--easing);
}

.gallery__card:hover {
  border-color: var(--color-border-strong);
}

.gallery__card--selected {
  border-color: var(--color-accent-ink);
  box-shadow: inset 0 0 0 var(--border-width) var(--color-accent-ink);
}

.gallery__name {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
}

.gallery__custom {
  padding-top: var(--space-3);
  border-top: var(--border-width) solid var(--color-border);
}
</style>
