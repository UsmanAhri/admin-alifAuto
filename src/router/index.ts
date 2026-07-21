import { createRouter, createWebHistory } from 'vue-router'
import type { Role } from '@/types'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    roles?: Role[]
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      children: [
        { path: '', redirect: '/vehicles' },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/pages/UsersPage.vue'),
          meta: { roles: ['administrator'] },
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('@/pages/LogsPage.vue'),
          meta: { roles: ['administrator'] },
        },
        {
          path: 'menu',
          name: 'menu',
          component: () => import('@/pages/MenuPage.vue'),
          meta: { roles: ['administrator', 'manager'] },
        },
        {
          path: 'news',
          name: 'news',
          component: () => import('@/pages/NewsPage.vue'),
          meta: { roles: ['administrator', 'manager'] },
        },
        {
          path: 'characteristics',
          name: 'characteristics',
          component: () => import('@/pages/CharacteristicsPage.vue'),
          meta: { roles: ['administrator', 'manager'] },
        },
        {
          path: 'vehicles',
          name: 'vehicles',
          component: () => import('@/pages/VehiclesPage.vue'),
          meta: { roles: ['administrator', 'manager', 'partner'] },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/pages/OrdersPage.vue'),
          meta: { roles: ['administrator', 'manager', 'partner'] },
        },
        {
          path: 'import',
          name: 'import',
          component: () => import('@/pages/ImportPage.vue'),
          meta: { roles: ['administrator'] },
        },
        {
          path: 'export',
          name: 'export',
          component: () => import('@/pages/ExportPage.vue'),
          meta: { roles: ['administrator', 'manager'] },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.name === 'login') {
    return auth.isAuthenticated ? '/' : true
  }

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      auth.clear()
      return { name: 'login' }
    }
  }

  if (to.meta.roles && (!auth.role || !to.meta.roles.includes(auth.role))) {
    return '/'
  }

  return true
})

export default router
