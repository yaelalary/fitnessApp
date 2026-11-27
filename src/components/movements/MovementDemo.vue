<script setup lang="ts">
import { computed } from 'vue'
import { describeMovement, movementImageUrls, MOVEMENT_SOURCE_URL, type Movement } from '@/domain/movements'
import ExerciseThumb from '@/components/exercises/ExerciseThumb.vue'
import ImageCarousel from '@/components/ui/ImageCarousel.vue'

const props = defineProps<{ movement: Movement }>()

const STEP_LABELS = ['Départ', 'Arrivée']

const frames = computed(() =>
  movementImageUrls(props.movement).map((src, index) => ({
    key: src,
    src,
    label: STEP_LABELS[index] ?? `Étape ${index + 1}`,
    alt: `${props.movement.name} : ${(STEP_LABELS[index] ?? `étape ${index + 1}`).toLowerCase()}`,
  })),
)
const carouselLabel = computed(() => `Images du mouvement ${props.movement.name}`)
const description = computed(() => describeMovement(props.movement))
const hasInstructions = computed(() => props.movement.instructions.length > 0)
</script>

<template>
  <div class="stack">
    <div>
      <p class="demo__name">{{ movement.name }}</p>
      <p v-if="description" class="muted small">{{ description }}</p>
    </div>
    <ImageCarousel :slides="frames" :label="carouselLabel">
      <template #slide="{ slide }">
        <ExerciseThumb :src="slide.src" :alt="slide.alt" size="wide" />
      </template>
    </ImageCarousel>
    <details v-if="hasInstructions" class="demo__instructions">
      <summary>Consignes (en anglais)</summary>
      <ol class="demo__steps">
        <li v-for="step in movement.instructions" :key="step">{{ step }}</li>
      </ol>
    </details>
    <p class="muted small">
      Source : <a :href="MOVEMENT_SOURCE_URL" target="_blank" rel="noopener noreferrer">free-exercise-db</a>
    </p>
  </div>
</template>

<style scoped>
.demo__name {
  font-weight: var(--weight-semibold);
}

.demo__instructions summary {
  padding: var(--space-2) 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
}

.demo__steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-inline-start: var(--space-5);
  list-style: decimal;
}
</style>
