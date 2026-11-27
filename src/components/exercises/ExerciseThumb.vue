<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = withDefaults(defineProps<{ src: string | null; alt: string; size?: 'sm' | 'md' | 'lg' | 'square' | 'wide' }>(), { size: 'md' })

const loaded = ref(false)
const failed = ref(false)

watch(
  () => props.src,
  () => {
    loaded.value = false
    failed.value = false
  },
)

const showsImage = computed(() => props.src !== null && !failed.value)
const loading = computed(() => showsImage.value && !loaded.value)
</script>

<template>
  <div class="thumb" :class="[`thumb--${size}`, { skeleton: loading }]" :aria-busy="loading || undefined">
    <img
      v-if="showsImage && src"
      :src="src"
      :alt="alt"
      loading="lazy"
      class="thumb__image"
      :class="{ 'thumb__image--loaded': loaded }"
      @load="loaded = true"
      @error="failed = true"
    />
    <AppIcon v-else name="dumbbell" />
  </div>
</template>

<style scoped>
.thumb {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  color: var(--color-text-faint);
}

.thumb__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: var(--space-1);
  object-fit: contain;
  mix-blend-mode: var(--image-blend);
  opacity: 0;
  transition: opacity var(--duration-medium) var(--easing);
}

.thumb__image--loaded {
  opacity: 1;
}

.thumb--sm {
  width: var(--thumb-size-sm);
  height: var(--thumb-size-sm);
}

.thumb--md {
  width: var(--thumb-size-md);
  height: var(--thumb-size-md);
}

.thumb--lg {
  width: 100%;
  height: var(--thumb-size-lg);
}

.thumb--square {
  width: 100%;
  aspect-ratio: 1;
}

.thumb--wide {
  width: 100%;
  aspect-ratio: var(--image-ratio-wide);
}
</style>
