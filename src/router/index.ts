import { createRouter, createWebHashHistory } from 'vue-router'
import './tabs'

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { tab: 'home', requiresProfile: true } },
    {
      path: '/exercices',
      name: 'exercises',
      component: () => import('@/views/ExercisesView.vue'),
      meta: { tab: 'exercises', requiresProfile: true },
    },
    {
      path: '/exercices/nouveau',
      name: 'exercise-new',
      component: () => import('@/views/ExerciseEditView.vue'),
      meta: { tab: 'exercises', requiresProfile: true },
    },
    {
      path: '/exercices/:id',
      name: 'exercise-edit',
      component: () => import('@/views/ExerciseEditView.vue'),
      props: true,
      meta: { tab: 'exercises', requiresProfile: true },
    },
    {
      path: '/parcours',
      name: 'routines',
      component: () => import('@/views/RoutinesView.vue'),
      meta: { tab: 'routines', requiresProfile: true },
    },
    {
      path: '/parcours/nouveau',
      name: 'routine-new',
      component: () => import('@/views/RoutineEditView.vue'),
      meta: { tab: 'routines', requiresProfile: true },
    },
    {
      path: '/parcours/:id',
      name: 'routine-edit',
      component: () => import('@/views/RoutineEditView.vue'),
      props: true,
      meta: { tab: 'routines', requiresProfile: true },
    },
    {
      path: '/seances',
      name: 'sessions',
      component: () => import('@/views/SessionsView.vue'),
      meta: { tab: 'sessions', requiresProfile: true },
    },
    {
      path: '/seances/:id',
      name: 'session',
      component: () => import('@/views/SessionEditView.vue'),
      props: true,
      meta: { tab: 'sessions', requiresProfile: true },
    },
    { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue'), meta: { tab: 'stats', requiresProfile: true } },
    { path: '/reglages', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
})
