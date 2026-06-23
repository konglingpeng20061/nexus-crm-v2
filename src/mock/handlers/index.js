import { http, HttpResponse } from 'msw'
import { read, update, reset } from '../database/store'

function successResponse(data) {
  return HttpResponse.json({ code: 0, message: '操作成功', data })
}

function errorResponse(code, message, status = 200) {
  return HttpResponse.json({ code, message, data: null }, { status })
}

function generateToken() {
  return 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function getTokenFromHeader(request) {
  const auth = request.headers.get('Authorization') || ''
  return auth.replace('Bearer ', '')
}

function getUserByToken(token) {
  const data = read()
  const session = data.sessions.find(s => s.token === token)
  if (!session) return null
  return data.users.find(u => u.id === session.userId)
}

export const handlers = [
  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json()
    const { username, password } = body

    const data = read()
    const user = data.users.find(u => u.username === username)

    if (!user) {
      return errorResponse(401, '账号或密码错误')
    }

    if (user.password !== password) {
      return errorResponse(401, '账号或密码错误')
    }

    if (user.status === 'disabled') {
      return errorResponse(403, '账号已被禁用，请联系管理员')
    }

    const token = generateToken()
    const now = new Date().toISOString()

    update(prev => {
      const updatedUsers = prev.users.map(u =>
        u.id === user.id ? { ...u, lastLoginAt: now } : u
      )
      return {
        ...prev,
        users: updatedUsers,
        sessions: [...prev.sessions, { token, userId: user.id, createdAt: now }]
      }
    })

    const { password: _, ...safeUser } = user
    return successResponse({
      token,
      user: { ...safeUser, lastLoginAt: now }
    })
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', ({ request }) => {
    const token = getTokenFromHeader(request)
    update(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.token !== token)
    }))
    return successResponse(null)
  }),

  // GET /api/auth/profile
  http.get('/api/auth/profile', ({ request }) => {
    const token = getTokenFromHeader(request)
    const user = getUserByToken(token)
    if (!user) {
      return errorResponse(401, '未登录或 Token 已过期')
    }
    const { password: _, ...safeUser } = user
    return successResponse(safeUser)
  }),

  // GET /api/auth/routes
  http.get('/api/auth/routes', ({ request }) => {
    const token = getTokenFromHeader(request)
    const user = getUserByToken(token)
    if (!user) {
      return errorResponse(401, '未登录或 Token 已过期')
    }
    const data = read()
    const routes = data.menus.filter(m => m.roles.includes(user.role))
    return successResponse(routes)
  }),

  // GET /api/auth/permissions
  http.get('/api/auth/permissions', ({ request }) => {
    const token = getTokenFromHeader(request)
    const user = getUserByToken(token)
    if (!user) {
      return errorResponse(401, '未登录或 Token 已过期')
    }
    const data = read()
    const role = data.roles.find(r => r.name === user.role)
    return successResponse(role ? role.permissions : [])
  }),

  // GET /api/health
  http.get('/api/health', () => {
    const data = read()
    return successResponse({
      status: 'healthy',
      version: data.version,
      seed: data.seed,
      users: data.users.length,
      generatedAt: data.generatedAt
    })
  }),

  // POST /api/mock/reset
  http.post('/api/mock/reset', () => {
    const data = reset()
    return successResponse({
      version: data.version,
      seed: data.seed,
      users: data.users.length,
      generatedAt: data.generatedAt
    })
  }),

  // GET /api/mock/error
  http.get('/api/mock/error', () => {
    return errorResponse(500, '服务器内部错误', 500)
  }),

  // ALL /api/* - 404
  http.all('/api/*', ({ request }) => {
    return errorResponse(404, `接口 ${request.method} ${new URL(request.url).pathname} 不存在`, 404)
  })
]