<script setup lang="ts">
import { computed, ref } from 'vue'
import { describeMovement, equipmentLabel, movementEquipmentOptions, movementImageUrls, searchMovements, type Movement } from '@/domain/movements'
import EmptyState from '@/components/ui/EmptyState.vue'
import PickButton from '@/components/ui/PickButton.vue'
import FormField from '@/components/ui/FormField.vue'
import ExerciseThumb from '@/components/exercises/ExerciseThumb.vue'

const props = defineProps<{ movements: Movement[]; initialQuery: string; selectedId: string | null }>()
const emit = defineEmits<{ pick: [movementId: string] }>()

const query = ref(props.initialQuery)
const equipment = ref('')

const equipmentOptions = computed(() =>
  movementEquipmentOptions(props.movements).map((value) => ({ value, label: equipmentLabel(value) })),
)
const rows = computed(() =>
  searchMovements(props.movements, query.value, equipment.value || null).map((movement) => ({
    movement,
    thumb: movementImageUrls(movement)[0] ?? null,
    detail: describeMovement(movement),
    selected: movement.id === props.selectedId,
  })),
)
</script>

<template>
  <div class="stack">
    <div class="grid-2">
      <FormField v-slot="field" label="Recherche (en anglais)">
        <input :id="field.id" v-model="query" type="search" placeholder="leg press, curl, squat…" autocomplete="off" />
      </FormField>
      <FormField v-slot="field" label="Matériel">
        <select :id="field.id" v-model="equipment">
          <option value="">Tout</option>
          <option v-for="option in equipmentOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </FormField>
    </div>
    <EmptyState v-if="rows.length === 0" title="Aucun mouvement" message="Essaie un autre mot, en anglais : press, row, curl, squat…" />
    <ul v-else class="stack">
      <li v-for="row in rows" :key="row.movement.id">
        <PickButton :selected="row.selected" @pick="emit('pick', row.movement.id)">
          <ExerciseThumb :src="row.thumb" :alt="row.movement.name" size="sm" />
          <span class="pick__text">
            <span class="pick__name">{{ row.movement.name }}</span>
            <span class="muted small">{{ row.detail }}</span>
          </span>
        </PickButton>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.pick__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.pick__name {
  font-weight: var(--weight-semibold);
}
</style>
