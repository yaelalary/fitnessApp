<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'sm'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    to?: RouteLocationRaw
    type?: 'button' | 'submit'
    icon?: IconName
    iconOnly?: boolean
    label?: string
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  { variant: 'secondary', size: 'md', type: 'button', iconOnly: false, label: '', disabled: false, loading: false, block: false },
)

defineEmits<{ click: [event: MouseEvent] }>()

const isLink = computed(() => props.to !== undefined && !props.disabled)
const isBusy = computed(() => props.loading || props.disabled)
const classes = computed(() => [
  'button',
  `button--${props.variant}`,
  `button--${props.size}`,
  { 'button--icon-only': props.iconOnly, 'button--block': props.block },
])
</script>

<template>
  <RouterLink v-if="isLink && to" :to="to" :class="classes" :aria-label="iconOnly ? label : undefined">
    <AppIcon v-if="icon" :name="icon" />
    <span v-if="!iconOnly"><slot>{{ label }}</slot></span>
  </RouterLink>
  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="isBusy"
    :aria-busy="loading || undefined"
    :aria-label="iconOnly ? label : undefined"
    @click="$emit('click', $event)"
  >
    <AppIcon v-if="icon" :name="loading ? 'refresh' : icon" :class="{ 'is-spinning': loading }" />
    <span v-if="!iconOnly"><slot>{{ label }}</slot></span>
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--tap-size);
  padding: 0 var(--space-4);
  border: var(--border-width) solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  font-size: var(--text-md);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--easing),
    border-color var(--duration-fast) var(--easing),
    transform var(--duration-fast) var(--easing);
}

.button:active:not(:disabled) {
  transform: scale(0.97);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button--sm {
  min-height: var(--tap-size-sm);
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
}

.button--icon-only {
  width: var(--tap-size);
  padding: 0;
}

.button--sm.button--icon-only {
  width: var(--tap-size-sm);
}

.button--block {
  width: 100%;
}

.button--primary {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.button--primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.button--secondary {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.button--secondary:hover:not(:disabled) {
  border-color: var(--color-text-muted);
}

.button--ghost {
  background: transparent;
  color: var(--color-text-muted);
}

.button--ghost:hover:not(:disabled) {
  background: var(--color-surface-sunken);
  color: var(--color-text);
}

.button--danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
</style>
