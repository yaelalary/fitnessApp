<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import { NAV_TABS } from '@/router/tabs'

const route = useRoute()

const items = computed(() => NAV_TABS.map((tab) => ({ ...tab, active: route.meta.tab === tab.id })))
</script>

<template>
  <nav class="nav" aria-label="Navigation principale">
    <RouterLink
      v-for="item in items"
      :key="item.id"
      :to="{ name: item.routeName }"
      class="nav__link"
      :class="{ 'nav__link--active': item.active }"
      :aria-current="item.active ? 'page' : undefined"
    >
      <AppIcon :name="item.icon" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.nav {
  position: fixed;
  inset: auto 0 0;
  z-index: var(--z-nav);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  height: calc(var(--nav-height) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-surface);
}

.nav__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  text-decoration: none;
}

.nav__link--active {
  color: var(--color-text);
}

.nav__link--active .icon {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-on-accent);
  box-sizing: content-box;
}
</style>
