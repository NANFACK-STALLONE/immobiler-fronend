/**
 * Vue Router — Navigation guards + routes
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchView.vue')
  },
  {
    path: '/properties/:id',
    name: 'PropertyDetail',
    component: () => import('@/views/PropertyDetailView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/properties/new',
    name: 'PropertyCreate',
    component: () => import('@/views/PropertyFormView.vue'),
    meta: { requiresAuth: true, requiresSeller: true }
  },
  {
    path: '/properties/:id/edit',
    name: 'PropertyEdit',
    component: () => import('@/views/PropertyFormView.vue'),
    meta: { requiresAuth: true, requiresSeller: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/AdminUsersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    // Catch all 404
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

// ── Navigation Guards ──────────────────────────────────────────────────────
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresSeller && !auth.isSeller) {
    return next({ name: 'Dashboard' })
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({ name: 'Dashboard' })
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
