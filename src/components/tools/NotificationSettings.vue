<script setup lang="ts">
import { computed } from 'vue'
import type { NotificationAccess } from '@/services/notifications'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

const props = defineProps<{ access: NotificationAccess; requesting: boolean; testFailed: boolean }>()
const emit = defineEmits<{ request: []; test: [] }>()

const MESSAGES: Record<NotificationAccess, string> = {
  unsupported:
    'Ce navigateur ne permet pas les notifications ici. Sur iPhone, ajoute d’abord l’app à l’écran d’accueil (Partager → Sur l’écran d’accueil), puis ouvre-la depuis son icône.',
  default: 'Active-les pour être prévenu sur le téléphone quand la gourde peut être remplie.',
  granted: 'Activées sur cet appareil.',
  denied: 'Bloquées pour cette page. Autorise-les dans les réglages du navigateur, puis recharge l’app.',
}

const message = computed(() => MESSAGES[props.access])
const canRequest = computed(() => props.access === 'default')
const canTest = computed(() => props.access === 'granted')
const hasActions = computed(() => canRequest.value || canTest.value)
</script>

<template>
  <section class="card stack">
    <h2 class="section-title cluster">
      <AppIcon name="bell" />
      Notifications
    </h2>
    <p>{{ message }}</p>
    <p class="muted small">
      La notification arrive si l’app est restée ouverte en arrière-plan, écran verrouillé compris. Si le téléphone l’a
      fermée entre-temps, l’alerte s’affiche dès que tu la rouvres.
    </p>
    <div v-if="hasActions" class="cluster">
      <AppButton v-if="canRequest" variant="primary" icon="bell" :loading="requesting" @click="emit('request')">
        Activer les notifications
      </AppButton>
      <AppButton v-if="canTest" icon="bell" @click="emit('test')">Envoyer une notification de test</AppButton>
    </div>
    <ErrorMessage v-if="testFailed" message="La notification n’a pas pu être affichée sur cet appareil." />
  </section>
</template>
