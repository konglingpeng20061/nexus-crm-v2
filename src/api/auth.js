import request from './request'

export function login(credentials) {
  return request.post('/auth/login', credentials)
}

export function logout() {
  return request.post('/auth/logout')
}

export function getProfile() {
  return request.get('/auth/profile')
}

export function getAuthRoutes() {
  return request.get('/auth/routes')
}

export function getPermissions() {
  return request.get('/auth/permissions')
}