<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

const props = defineProps<{ routineName: string; missingNames: string[]; busy: boolean; error: string | null }>()
const emit = defineEmits<{ apply: [] }>()

const title = computed(() => `Pas encore dans le parcours « ${props.routineName} »`)
const names = computed(() => props.missingNames.join(', '))
</script>

<template>
  <div class="card stack">
    <div>
      <p class="prompt__title">{{ title }}</p>
      <p class="muted small">{{ names }}</p>
    </div>
    <ErrorMessage v-if="error" :message="error" />
    <div>
      <AppButton size="sm" icon="refresh" :loading="busy" @click="emit('apply')">Mettre à jour le parcours</AppButton>
    </div>
  </div>
</template>

<style scoped>
.prompt__title {
  font-weight: var(--weight-semibold);
}
</style>
