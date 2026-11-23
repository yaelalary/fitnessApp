import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import Sortable from 'sortablejs'

export interface SortableOptions {
  handle: string
  onMove: (fromIndex: number, toIndex: number) => void
}

const ANIMATION_MS = 150
const SCROLL_SENSITIVITY_PX = 96
const DRAG_TOLERANCE_PX = 4

export function useSortable(container: Ref<HTMLElement | null>, options: SortableOptions) {
  let sortable: Sortable | null = null
  let originalNextSibling: Node | null = null

  onMounted(() => {
    if (!container.value) return
    sortable = Sortable.create(container.value, {
      handle: options.handle,
      animation: ANIMATION_MS,
      forceFallback: true,
      fallbackTolerance: DRAG_TOLERANCE_PX,
      scrollSensitivity: SCROLL_SENSITIVITY_PX,
      ghostClass: 'is-sorting-ghost',
      dragClass: 'is-sorting-drag',
      onStart: ({ item }) => {
        originalNextSibling = item.nextSibling
      },
      onEnd: ({ from, item, oldIndex, newIndex }) => {
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
        from.insertBefore(item, originalNextSibling)
        options.onMove(oldIndex, newIndex)
      },
    })
  })

  onBeforeUnmount(() => {
    sortable?.destroy()
    sortable = null
  })
}
