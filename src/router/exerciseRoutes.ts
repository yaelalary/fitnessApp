import type { LocationQueryRaw, RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import type { CategoryId } from '@/domain/types'
import { isCategoryId } from '@/domain/categories'

const CATEGORY_QUERY_KEY = 'type'

function categoryQuery(category: CategoryId | null): LocationQueryRaw {
  return category ? { [CATEGORY_QUERY_KEY]: category } : {}
}

export function categoryFromRoute(route: RouteLocationNormalizedLoaded): CategoryId | null {
  const value = route.query[CATEGORY_QUERY_KEY]
  return isCategoryId(value) ? value : null
}

export function exerciseListRoute(category: CategoryId | null): RouteLocationRaw {
  return { name: 'exercises', query: categoryQuery(category) }
}

export function newExerciseRoute(category: CategoryId | null): RouteLocationRaw {
  return { name: 'exercise-new', query: categoryQuery(category) }
}

export function editExerciseRoute(exerciseId: string, category: CategoryId | null): RouteLocationRaw {
  return { name: 'exercise-edit', params: { id: exerciseId }, query: categoryQuery(category) }
}
