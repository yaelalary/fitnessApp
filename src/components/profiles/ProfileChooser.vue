<script setup lang="ts">
import type { Profile } from '@/domain/types'
import AppIcon from '@/components/ui/AppIcon.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import ProfileNameForm from './ProfileNameForm.vue'

withDefaults(defineProps<{ profiles: Profile[]; busy?: boolean; error?: string | null }>(), { busy: false, error: null })

defineEmits<{ select: [profileId: string]; create: [name: string] }>()
</script>

<template>
  <section class="stack-lg">
    <div class="stack">
      <h1>Qui s’entraîne ?</h1>
      <p class="muted">Chaque profil a ses propres exercices, parcours, séances et statistiques.</p>
    </div>
    <ul v-if="profiles.length > 0" class="stack">
      <li v-for="profile in profiles" :key="profile.id">
        <button type="button" class="card card-link profile" @click="$emit('select', profile.id)">
          <span class="profile__avatar"><AppIcon name="user" /></span>
          <span class="section-title">{{ profile.name }}</span>
        </button>
      </li>
    </ul>
    <div class="stack">
      <h2 class="section-title">Nouveau profil</h2>
      <ProfileNameForm submit-label="Créer" :others="profiles" :busy="busy" @submit="$emit('create', $event)" />
      <ErrorMessage v-if="error" :message="error" />
    </div>
  </section>
</template>

<style scoped>
.profile {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.profile__avatar {
  display: grid;
  place-items: center;
  width: var(--tap-size);
  height: var(--tap-size);
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-on-accent);
}
</style>
