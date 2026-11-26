<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { machineThumbnailUrl } from '@/domain/machines'
import { usePressAndHold } from '@/composables/usePressAndHold'
import { preloadImage } from '@/services/imagePreload'
import AppIcon from '@/components/ui/AppIcon.vue'
import ExerciseThumb from './ExerciseThumb.vue'

const ZOOMED_WIDTH = 1600

const props = withDefaults(defineProps<{ src: string | null; alt: string; size?: 'sm' | 'md' | 'lg' | 'square' }>(), {
  size: 'md',
})

const { active, press, release, pressKey } = usePressAndHold()
const zoomedSrc = computed(() => machineThumbnailUrl(props.src, ZOOMED_WIDTH) ?? '')
const sharpLoaded = ref(false)

watch(zoomedSrc, () => {
  sharpLoaded.value = false
})

function startPress(event: PointerEvent) {
  preloadImage(zoomedSrc.value)
  press(event)
}

function startKeyPress(event: KeyboardEvent) {
  preloadImage(zoomedSrc.value)
  pressKey(event)
}
const zoomLabel = computed(() => `Garder appuyé pour agrandir la photo : ${props.alt}`)
const block = computed(() => props.size === 'lg' || props.size === 'square')
</script>

<template>
  <template v-if="src">
    <button
      type="button"
      class="zoom"
      :class="{ 'zoom--block': block }"
      :aria-label="zoomLabel"
      title="Garder appuyé pour agrandir"
      @pointerdown="startPress"
      @pointerup="release"
      @pointercancel="release"
      @lostpointercapture="release"
      @keydown.space.prevent="startKeyPress"
      @keydown.enter.prevent="startKeyPress"
      @keyup.space="release"
      @keyup.enter="release"
      @blur="release"
      @contextmenu.prevent
    >
      <ExerciseThumb :src="src" :alt="alt" :size="size" />
    </button>
    <Teleport to="body">
      <div v-if="active" class="zoomed" aria-hidden="true">
        <div class="zoomed__frame">
          <img :src="src" alt="" class="zoomed__image" />
          <img
            :src="zoomedSrc"
            alt=""
            class="zoomed__image zoomed__image--sharp"
            :class="{ 'zoomed__image--loaded': sharpLoaded }"
            @load="sharpLoaded = true"
          />
          <span v-if="!sharpLoaded" class="zoomed__loading">
            <AppIcon name="refresh" class="is-spinning" />
          </span>
        </div>
      </div>
    </Teleport>
  </template>
  <ExerciseThumb v-else :src="src" :alt="alt" :size="size" />
</template>

<style scoped>
.zoom {
  display: block;
  flex: none;
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background: none;
  cursor: zoom-in;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.zoom :deep(img) {
  pointer-events: none;
}

.zoom--block {
  width: 100%;
}

.zoomed {
  position: fixed;
  inset: 0;
  z-index: var(--z-dialog);
  padding: var(--space-4);
  background: var(--color-overlay);
  pointer-events: none;
}

.zoomed__frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-surface-sunken);
}

.zoomed__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: var(--image-blend);
}

.zoomed__image--sharp {
  opacity: 0;
  transition: opacity var(--duration-medium) var(--easing);
}

.zoomed__image--loaded {
  opacity: 1;
}

.zoomed__loading {
  position: absolute;
  inset-block-end: var(--space-3);
  inset-inline-end: var(--space-3);
  display: grid;
  place-items: center;
  width: var(--tap-size-sm);
  height: var(--tap-size-sm);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text-muted);
  box-shadow: var(--shadow-raised);
}
</style>
