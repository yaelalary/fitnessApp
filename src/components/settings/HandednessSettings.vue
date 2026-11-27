<script setup lang="ts">
import { HANDEDNESS_LABELS, HANDEDNESS_ORDER, type Handedness } from '@/domain/handedness'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl.vue'

const handedness = defineModel<Handedness>({ required: true })

const options: SegmentOption<Handedness>[] = HANDEDNESS_ORDER.map((value) => ({ value, label: HANDEDNESS_LABELS[value] }))
</script>

<template>
  <div class="stack">
    <SegmentedControl v-model="handedness" :options="options" label="Main utilisée pour réordonner" />
    <p class="muted small">La poignée pour déplacer les exercices d’un parcours ou d’une séance se place du côté de ta main.</p>
  </div>
</template>
