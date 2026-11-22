<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

withDefaults(defineProps<{ src: string | null; alt: string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
</script>

<template>
  <div class="thumb" :class="`thumb--${size}`">
    <img v-if="src" :src="src" :alt="alt" loading="lazy" />
    <AppIcon v-else name="dumbbell" />
  </div>
</template>

<style scoped>
.thumb {
  display: grid;
  place-items: center;
  flex: none;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  color: var(--color-text-faint);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
</style>
