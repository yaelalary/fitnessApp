<script setup lang="ts" generic="Slide extends { key: string; label: string }">
import { computed, ref } from 'vue'
import AppButton from './AppButton.vue'

const props = defineProps<{ slides: Slide[]; label: string }>()

defineSlots<{ slide(props: { slide: Slide }): unknown }>()

const track = ref<HTMLElement | null>(null)
const current = ref(0)

const lastIndex = computed(() => props.slides.length - 1)
const hasSeveral = computed(() => props.slides.length > 1)
const isFirst = computed(() => current.value === 0)
const isLast = computed(() => current.value >= lastIndex.value)
const currentLabel = computed(() => props.slides[current.value]?.label ?? '')
const position = computed(() => `${current.value + 1} / ${props.slides.length}`)

function clampIndex(index: number): number {
  return Math.min(Math.max(index, 0), lastIndex.value)
}

function syncCurrent() {
  const element = track.value
  if (!element || element.clientWidth === 0) return
  current.value = clampIndex(Math.round(element.scrollLeft / element.clientWidth))
}

function goTo(index: number) {
  const element = track.value
  if (!element) return
  const target = clampIndex(index)
  current.value = target
  element.scrollTo({ left: target * element.clientWidth, behavior: 'smooth' })
}

function slideLabel(index: number): string {
  return `${props.slides[index]?.label} (${index + 1} sur ${props.slides.length})`
}
</script>

<template>
  <section class="carousel" :aria-label="label" aria-roledescription="carrousel">
    <div class="carousel__viewport">
      <div ref="track" class="carousel__track" @scroll.passive="syncCurrent">
        <div
          v-for="(slide, index) in slides"
          :key="slide.key"
          class="carousel__slide"
          role="group"
          aria-roledescription="image"
          :aria-label="slideLabel(index)"
        >
          <slot name="slide" :slide="slide" />
        </div>
      </div>
      <template v-if="hasSeveral">
        <AppButton
          class="carousel__arrow carousel__arrow--previous"
          icon="back"
          icon-only
          size="sm"
          label="Image précédente"
          :disabled="isFirst"
          @click="goTo(current - 1)"
        />
        <AppButton
          class="carousel__arrow carousel__arrow--next"
          icon="forward"
          icon-only
          size="sm"
          label="Image suivante"
          :disabled="isLast"
          @click="goTo(current + 1)"
        />
      </template>
    </div>
    <div class="carousel__footer">
      <p class="carousel__caption" aria-live="polite">
        {{ currentLabel }}
        <span v-if="hasSeveral" class="muted small">{{ position }}</span>
      </p>
      <div v-if="hasSeveral" class="carousel__dots">
        <button
          v-for="(slide, index) in slides"
          :key="slide.key"
          type="button"
          class="carousel__dot"
          :class="{ 'carousel__dot--active': index === current }"
          :aria-label="`Voir : ${slide.label}`"
          :aria-current="index === current || undefined"
          @click="goTo(index)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.carousel__viewport {
  position: relative;
}

.carousel__track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  border-radius: var(--radius-md);
}

.carousel__track::-webkit-scrollbar {
  display: none;
}

.carousel__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.carousel__arrow {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-raised);
}

.carousel__arrow:disabled {
  visibility: hidden;
}

.carousel__arrow--previous {
  left: var(--space-2);
}

.carousel__arrow--next {
  right: var(--space-2);
}

.carousel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.carousel__caption {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  font-weight: var(--weight-medium);
}

.carousel__dots {
  display: flex;
  gap: var(--space-1);
}

.carousel__dot {
  width: var(--tap-size-sm);
  height: var(--tap-size-sm);
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.carousel__dot::after {
  content: '';
  display: block;
  width: var(--space-2);
  height: var(--space-2);
  margin: auto;
  border-radius: var(--radius-pill);
  background: var(--color-border-strong);
  transition: background-color var(--duration-fast) var(--easing);
}

.carousel__dot--active::after {
  background: var(--color-accent-ink);
}

@media (prefers-reduced-motion: reduce) {
  .carousel__track {
    scroll-behavior: auto;
  }
}
</style>
