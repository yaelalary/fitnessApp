<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="chart" role="img" :aria-label="label">
    <slot />
  </div>
</template>

<style scoped>
.chart {
  position: relative;
  height: var(--chart-height);
}
</style>
