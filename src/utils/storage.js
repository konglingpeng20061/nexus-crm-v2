const TOKEN_KEY = 'nexus-crm-token'
const USER_KEY = 'nexus-crm-user'
const MENUS_KEY = 'nexus-crm-menus'
const PERMISSIONS_KEY = 'nexus-crm-permissions'

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getStoredUser() {
  return safeParse(localStorage.getItem(USER_KEY))
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredMenus() {
  return safeParse(localStorage.getItem(MENUS_KEY)) || []
}

export function setStoredMenus(menus) {
  localStorage.setItem(MENUS_KEY, JSON.stringify(menus))
}

export function getStoredPermissions() {
  return safeParse(localStorage.getItem(PERMISSIONS_KEY)) || []
}

export function setStoredPermissions(permissions) {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(MENUS_KEY)
  localStorage.removeItem(PERMISSIONS_KEY)
}