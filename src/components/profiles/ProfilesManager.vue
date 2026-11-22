<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Profile } from '@/domain/types'
import { removeById } from '@/domain/collections'
import AppButton from '@/components/ui/AppButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import ProfileNameForm from './ProfileNameForm.vue'

const props = withDefaults(
  defineProps<{ profiles: Profile[]; activeProfileId: string | null; busy?: boolean; error?: string | null }>(),
  { busy: false, error: null },
)

const emit = defineEmits<{ create: [name: string]; rename: [profileId: string, name: string]; remove: [profile: Profile] }>()

const renamingId = ref<string | null>(null)

const rows = computed(() =>
  props.profiles.map((profile) => ({
    profile,
    others: removeById(props.profiles, profile.id),
    isActive: profile.id === props.activeProfileId,
    isRenaming: profile.id === renamingId.value,
  })),
)

function rename(profileId: string, name: string) {
  emit('rename', profileId, name)
  renamingId.value = null
}
</script>

<template>
  <div class="stack">
    <ul class="stack">
      <li v-for="row in rows" :key="row.profile.id" class="card stack">
        <ProfileNameForm
          v-if="row.isRenaming"
          :initial-name="row.profile.name"
          submit-label="Renommer"
          :others="row.others"
          :busy="busy"
          @submit="rename(row.profile.id, $event)"
        />
        <div v-else class="split">
          <div>
            <p class="section-title">{{ row.profile.name }}</p>
            <p v-if="row.isActive" class="muted small">Profil actif sur cet appareil</p>
          </div>
          <div class="cluster">
            <AppButton size="sm" variant="ghost" icon="edit" icon-only :label="`Renommer ${row.profile.name}`" @click="renamingId = row.profile.id" />
            <AppButton size="sm" variant="ghost" icon="trash" icon-only :label="`Supprimer ${row.profile.name}`" @click="emit('remove', row.profile)" />
          </div>
        </div>
      </li>
    </ul>
    <ProfileNameForm submit-label="Ajouter" :others="profiles" :busy="busy" @submit="emit('create', $event)" />
    <ErrorMessage v-if="error" :message="error" />
  </div>
</template>
