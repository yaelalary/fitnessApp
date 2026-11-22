import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useThemeTokens<Name extends string>(names: readonly Name[]) {
  const tokens = ref({} as Record<Name, string>)

  function read() {
    const styles = getComputedStyle(document.documentElement)
    tokens.value = Object.fromEntries(names.map((name) => [name, styles.getPropertyValue(name).trim()])) as Record<Name, string>
  }

  const query = window.matchMedia('(prefers-color-scheme: dark)')

  onMounted(() => {
    read()
    query.addEventListener('change', read)
  })

  onBeforeUnmount(() => query.removeEventListener('change', read))

  return tokens
}
