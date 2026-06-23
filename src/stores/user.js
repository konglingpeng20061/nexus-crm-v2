import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi, getProfile, getAuthRoutes, getPermissions } from '@/api/auth'
import {
  getToken, setToken, clearAuthStorage,
  getStoredUser, setStoredUser,
  getStoredMenus, setStoredMenus,
  getStoredPermissions, setStoredPermissions
} from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const user = ref(getStoredUser())
  const menus = ref(getStoredMenus())
  const permissions = ref(getStoredPermissions())
  const initialized = ref(false)

  async function login(credentials) {
    const res = await loginApi(credentials)
    token.value = res.token
    setToken(res.token)
    user.value = res.user
    setStoredUser(res.user)

    const [routes, perms] = await Promise.all([
      getAuthRoutes(),
      getPermissions()
    ])
    menus.value = routes
    setStoredMenus(routes)
    permissions.value = perms
    setStoredPermissions(perms)
    initialized.value = true
  }

  async function restoreSession() {
    if (initialized.value && user.value) return
    try {
      const profile = await getProfile()
      user.value = profile
      setStoredUser(profile)

      const [routes, perms] = await Promise.all([
        getAuthRoutes(),
        getPermissions()
      ])
      menus.value = routes
      setStoredMenus(routes)
      permissions.value = perms
      setStoredPermissions(perms)
      initialized.value = true
    } catch {
      clearSession()
      throw new Error('会话恢复失败')
    }
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {
      // 即使服务端退出失败，也清理本地状态
    } finally {
      clearSession()
    }
  }

  function clearSession() {
    token.value = null
    user.value = null
    menus.value = []
    permissions.value = []
    initialized.value = false
    clearAuthStorage()
  }

  function hasPermission(code) {
    if (!code) return true
    return permissions.value.includes('*') || permissions.value.includes(code)
  }

  function hasAnyPermission(codes) {
    return codes.some(code => hasPermission(code))
  }

  return {
    token, user, menus, permissions, initialized,
    login, restoreSession, logout, clearSession,
    hasPermission, hasAnyPermission
  }
})