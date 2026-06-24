import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/Layout.vue'
import { getToken } from '@/utils/storage'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '首页工作台', roles: ['admin', 'manager', 'sales', 'support', 'viewer'] }
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/common/ModulePlaceholderView.vue'),
        meta: { title: '客户管理', roles: ['admin', 'manager', 'sales', 'support'] }
      },
      {
        path: 'opportunities',
        name: 'Opportunities',
        component: () => import('@/views/common/ModulePlaceholderView.vue'),
        meta: { title: '商机管理', roles: ['admin', 'manager', 'sales'] }
      },
      {
        path: 'contracts',
        name: 'Contracts',
        component: () => import('@/views/common/ModulePlaceholderView.vue'),
        meta: { title: '合同管理', roles: ['admin', 'manager'] }
      },
      {
        path: 'tickets',
        name: 'Tickets',
        component: () => import('@/views/common/ModulePlaceholderView.vue'),
        meta: { title: '工单中心', roles: ['admin', 'manager', 'support'] }
      },
      {
        path: 'api-docs',
        name: 'ApiDocs',
        component: () => import('@/views/api-docs/ApiDocsView.vue'),
        meta: { title: '接口文档', roles: ['admin'] }
      },
      {
        path: 'forbidden',
        name: 'Forbidden',
        component: () => import('@/views/error/ForbiddenView.vue'),
        meta: { title: '403 禁止访问', public: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '404 页面不存在', public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  // 公开页面直接放行
  if (to.meta.public) {
    return next()
  }

  const token = getToken()
  const userStore = useUserStore()

  // 已登录访问登录页 -> 跳转工作台
  if (to.name === 'Login') {
    if (token) {
      return next('/dashboard')
    }
    return next()
  }

  // 已登录但访问需要登录的页面时，确保用户态已初始化
  if (token && !userStore.initialized) {
    try {
      await userStore.restoreSession()
    } catch {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }

  // 需要登录但无 Token -> 跳转登录页
  if (to.meta.requiresAuth && !token) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 角色限制检查
  if (to.meta.roles) {
    const userRole = userStore.user?.role
    if (userRole && !to.meta.roles.includes(userRole)) {
      return next('/forbidden')
    }
  }

  next()
})

export default router