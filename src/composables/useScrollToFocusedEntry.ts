import { nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { entryAnchorId, focusedEntryId } from '@/router/sessionLinks'

export function useScrollToFocusedEntry() {
  const route = useRoute()
  onMounted(async () => {
    const entryId = focusedEntryId(route.query)
    if (!entryId) return
    await nextTick()
    document.getElementById(entryAnchorId(entryId))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
