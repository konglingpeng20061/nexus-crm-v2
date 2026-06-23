export function hasPermission(permissions, permission) {
  if (!permission) return true
  return permissions.includes('*') || permissions.includes(permission)
}

export function hasAnyPermission(permissions, requiredPermissions) {
  return requiredPermissions.some(permission => hasPermission(permissions, permission))
}