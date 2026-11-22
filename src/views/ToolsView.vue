<script setup lang="ts">
import { useRefillStore, REFILL_READY_NOTIFICATION } from '@/stores/refill'
import { useNotificationAccess } from '@/composables/useNotificationAccess'
import PageHeader from '@/components/ui/PageHeader.vue'
import RefillTimerCard from '@/components/tools/RefillTimerCard.vue'
import NotificationSettings from '@/components/tools/NotificationSettings.vue'

const refill = useRefillStore()
const notifications = useNotificationAccess()
</script>

<template>
  <div class="page">
    <PageHeader title="Outils" :back-to="{ name: 'home' }" />

    <RefillTimerCard
      :phase="refill.phase"
      :remaining-seconds="refill.remainingSeconds"
      :progress="refill.progress"
      :ends-at="refill.endsAt"
      :duration-minutes="refill.durationMinutes"
      @start="refill.start"
      @cancel="refill.cancel"
      @update:duration-minutes="refill.setDuration"
    />

    <NotificationSettings
      :access="notifications.access.value"
      :requesting="notifications.requesting.value"
      :test-failed="notifications.testFailed.value"
      @request="notifications.request"
      @test="notifications.sendTest(REFILL_READY_NOTIFICATION)"
    />
  </div>
</template>
