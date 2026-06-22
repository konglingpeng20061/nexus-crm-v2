import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/Layout.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '首页工作台' }
      },
      {
        path: 'api-docs',
        name: 'ApiDocs',
        component: () => import('@/views/api-docs/ApiDocsView.vue'),
        meta: { title: '接口文档' }
      },
      {
        path: 'forbidden',
        name: 'Forbidden',
        component: () => import('@/views/error/ForbiddenView.vue'),
        meta: { title: '403 禁止访问' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '404 页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router