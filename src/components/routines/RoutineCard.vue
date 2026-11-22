<script setup lang="ts">
import { computed } from 'vue'
import type { Exercise, Routine } from '@/domain/types'
import { countLabel } from '@/domain/numbers'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{ routine: Routine; exercisesById: ReadonlyMap<string, Exercise> }>()
defineEmits<{ start: [] }>()

const exerciseNames = computed(() =>
  props.routine.items
    .map((item) => props.exercisesById.get(item.exerciseId)?.name)
    .filter((name): name is string => Boolean(name))
    .join(' · '),
)
const itemCount = computed(() => countLabel(props.routine.items.length, 'exercice'))
</script>

<template>
  <article class="card stack">
    <div class="split">
      <div>
        <h2 class="section-title">{{ routine.name }}</h2>
        <p class="muted small">{{ itemCount }}</p>
      </div>
      <AppButton :to="{ name: 'routine-edit', params: { id: routine.id } }" variant="ghost" icon="edit" icon-only label="Modifier le parcours" />
    </div>
    <p v-if="exerciseNames" class="muted small">{{ exerciseNames }}</p>
    <AppButton variant="primary" icon="play" block @click="$emit('start')">Démarrer</AppButton>
  </article>
</template>
