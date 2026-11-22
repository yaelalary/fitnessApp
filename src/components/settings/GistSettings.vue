<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FormField from '@/components/ui/FormField.vue'

const props = withDefaults(
  defineProps<{ connected: boolean; gistId: string; token: string; busy?: boolean; error?: string | null }>(),
  { busy: false, error: null },
)

const emit = defineEmits<{ connect: [gistId: string, token: string]; create: [token: string]; disconnect: [] }>()

const gistIdDraft = ref(props.gistId)
const tokenDraft = ref(props.token)

const hasToken = computed(() => tokenDraft.value.trim() !== '')
const canConnect = computed(() => hasToken.value && gistIdDraft.value.trim() !== '')
const gistUrl = computed(() => `https://gist.github.com/${props.gistId}`)
</script>

<template>
  <div v-if="connected" class="stack">
    <p>
      Données synchronisées sur le gist
      <a :href="gistUrl" target="_blank" rel="noopener">{{ gistId }}</a>.
    </p>
    <p class="muted small">Sur un autre téléphone, saisis le même identifiant de gist et un jeton pour retrouver les données.</p>
    <div class="cluster">
      <AppButton icon="close" :loading="busy" @click="emit('disconnect')">Déconnecter cet appareil</AppButton>
    </div>
    <ErrorMessage v-if="error" :message="error" />
  </div>

  <form v-else class="stack" novalidate @submit.prevent="emit('connect', gistIdDraft, tokenDraft)">
    <p class="muted small">
      Les données restent sur cet appareil tant qu’aucun gist n’est configuré. Crée un jeton GitHub avec le droit « gist »
      sur <a href="https://github.com/settings/tokens/new?scopes=gist&description=Carnet%20muscu" target="_blank" rel="noopener">github.com/settings/tokens</a>.
    </p>
    <FormField v-slot="field" label="Jeton GitHub" hint="Il est enregistré seulement dans ce navigateur.">
      <input
        :id="field.id"
        v-model="tokenDraft"
        type="password"
        autocomplete="off"
        spellcheck="false"
        placeholder="ghp_…"
        :aria-describedby="field.describedBy"
      />
    </FormField>
    <FormField v-slot="field" label="Identifiant du gist" hint="Laisse vide pour en créer un avec tes données actuelles.">
      <input
        :id="field.id"
        v-model="gistIdDraft"
        type="text"
        autocomplete="off"
        spellcheck="false"
        :aria-describedby="field.describedBy"
      />
    </FormField>
    <div class="cluster">
      <AppButton type="submit" variant="primary" icon="cloud" :disabled="!canConnect" :loading="busy">Connecter</AppButton>
      <AppButton icon="plus" :disabled="!hasToken || busy" @click="emit('create', tokenDraft)">Créer un gist</AppButton>
    </div>
    <ErrorMessage v-if="error" :message="error" />
  </form>
</template>
