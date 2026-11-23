import type { IconName } from '@/components/ui/icons'

export type TabId = 'home' | 'routines' | 'exercises' | 'sessions' | 'stats'

export interface NavTab {
  id: TabId
  routeName: string
  label: string
  icon: IconName
}

export const NAV_TABS: NavTab[] = [
  { id: 'home', routeName: 'home', label: 'Accueil', icon: 'home' },
  { id: 'exercises', routeName: 'exercises', label: 'Exercices', icon: 'dumbbell' },
  { id: 'routines', routeName: 'routines', label: 'Parcours', icon: 'route' },
  { id: 'sessions', routeName: 'sessions', label: 'Historique', icon: 'history' },
  { id: 'stats', routeName: 'stats', label: 'Stats', icon: 'chart' },
]

declare module 'vue-router' {
  interface RouteMeta {
    tab?: TabId
    requiresProfile?: boolean
    standalone?: boolean
  }
}
