<script setup lang="ts">
import { computed } from 'vue'
import type { Profile } from '@/domain/types'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{ profiles: Profile[]; activeProfileId: string | null; synced: boolean }>()
const emit = defineEmits<{ 'switch-profile': [profileId: string] }>()

const storageLabel = computed(() => (props.synced ? 'Synchronisé sur GitHub Gist' : 'Enregistré sur cet appareil uniquement'))
const canSwitch = computed(() => props.profiles.length > 0 && props.activeProfileId !== null)

function onSwitch(event: Event) {
  emit('switch-profile', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <header class="header">
    <RouterLink :to="{ name: 'home' }" class="header__brand">Carnet muscu</RouterLink>
    <div class="cluster header__tools">
      <span class="header__storage" :title="storageLabel">
        <AppIcon :name="synced ? 'cloud' : 'device'" :label="storageLabel" />
      </span>
      <select v-if="canSwitch" class="header__profile" :value="activeProfileId" aria-label="Profil actif" @change="onSwitch">
        <option v-for="profile in profiles" :key="profile.id" :value="profile.id">{{ profile.name }}</option>
      </select>
      <slot />
      <AppButton :to="{ name: 'settings' }" variant="ghost" icon="settings" icon-only label="Réglages" />
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  height: var(--header-height);
  padding: 0 var(--space-2) 0 var(--space-4);
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-bg);
}

.header__brand {
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  text-decoration: none;
  white-space: nowrap;
}

.header__tools {
  flex-wrap: nowrap;
  gap: var(--space-1);
  min-width: 0;
}

.header__storage {
  display: inline-flex;
  color: var(--color-text-faint);
}

.header__profile {
  width: auto;
  min-width: 0;
  max-width: 10rem;
  min-height: var(--tap-size-sm);
  font-weight: var(--weight-semibold);
}
</style>
