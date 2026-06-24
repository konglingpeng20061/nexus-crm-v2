import { http, HttpResponse } from 'msw'
import { read, update, reset } from '../database/store'
import {
  createDashboardSummary,
  createSalesFunnel,
  createContractTrend,
  createTicketStatusDistribution,
  getCustomerOptions,
  getTodos,
  getRecentFollows
} from '../database/dashboard'

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

function requireAuth(request) {
  const token = getTokenFromHeader(request)
  const user = getUserByToken(token)
  if (!user) return { error: errorResponse(401, '未登录或 Token 已过期') }
  return { user }
}

function getScenario(request) {
  const url = new URL(request.url)
  return url.searchParams.get('scenario') || ''
}

function handleScenario(scenario) {
  if (scenario === 'empty') {
    return successResponse({
      customerCount: 0,
      activeCustomerCount: 0,
      activeOpportunityCount: 0,
      opportunityAmount: 0,
      contractAmount: 0,
      pendingTicketCount: 0
    })
  }
  if (scenario === 'error') {
    return errorResponse(500, '服务器内部错误', 500)
  }
  return null
}

function canModify(user, record) {
  return user.role === 'admin' || record.ownerId === user.id
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

  // GET /api/dashboard/summary
  http.get('/api/dashboard/summary', ({ request }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const scenario = getScenario(request)
    const handled = handleScenario(scenario)
    if (handled) return handled

    const data = read()
    return successResponse(createDashboardSummary(data))
  }),

  // GET /api/dashboard/customers
  http.get('/api/dashboard/customers', ({ request }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const data = read()
    return successResponse(getCustomerOptions(data))
  }),

  // GET /api/dashboard/todos
  http.get('/api/dashboard/todos', ({ request }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const scenario = getScenario(request)
    if (scenario === 'error') return errorResponse(500, '服务器内部错误', 500)

    const data = read()
    if (scenario === 'empty') return successResponse([])
    return successResponse(getTodos(data))
  }),

  // POST /api/dashboard/todos
  http.post('/api/dashboard/todos', async ({ request }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const body = await request.json()
    const now = new Date().toISOString()

    update(prev => {
      const maxId = prev.todos.length ? Math.max(...prev.todos.map(t => t.id)) : 0
      const newTodo = {
        id: maxId + 1,
        title: body.title,
        customerId: body.customerId,
        ownerId: auth.user.id,
        priority: body.priority || 'medium',
        status: body.status || 'pending',
        dueAt: body.dueAt,
        createdAt: now,
        updatedAt: now
      }
      return { ...prev, todos: [...prev.todos, newTodo] }
    })

    return successResponse(null)
  }),

  // PUT /api/dashboard/todos/:id
  http.put('/api/dashboard/todos/:id', async ({ request, params }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const id = Number(params.id)
    const body = await request.json()
    const data = read()
    const todo = data.todos.find(t => t.id === id)
    if (!todo) return errorResponse(404, '待办不存在')
    if (!canModify(auth.user, todo)) return errorResponse(403, '没有权限修改该待办')

    update(prev => ({
      ...prev,
      todos: prev.todos.map(t => t.id === id ? {
        ...t,
        ...(body.title !== undefined && { title: body.title }),
        ...(body.customerId !== undefined && { customerId: body.customerId }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.dueAt !== undefined && { dueAt: body.dueAt }),
        updatedAt: new Date().toISOString()
      } : t)
    }))

    return successResponse(null)
  }),

  // DELETE /api/dashboard/todos/:id
  http.delete('/api/dashboard/todos/:id', ({ request, params }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const id = Number(params.id)
    const data = read()
    const todo = data.todos.find(t => t.id === id)
    if (!todo) return errorResponse(404, '待办不存在')
    if (!canModify(auth.user, todo)) return errorResponse(403, '没有权限删除该待办')

    update(prev => ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== id)
    }))

    return successResponse(null)
  }),

  // GET /api/dashboard/recent-follows
  http.get('/api/dashboard/recent-follows', ({ request }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const scenario = getScenario(request)
    if (scenario === 'error') return errorResponse(500, '服务器内部错误', 500)

    const data = read()
    if (scenario === 'empty') return successResponse([])
    return successResponse(getRecentFollows(data))
  }),

  // POST /api/dashboard/recent-follows
  http.post('/api/dashboard/recent-follows', async ({ request }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const body = await request.json()
    const now = new Date().toISOString()

    update(prev => {
      const maxId = prev.follows.length ? Math.max(...prev.follows.map(f => f.id)) : 0
      const newFollow = {
        id: maxId + 1,
        customerId: body.customerId,
        ownerId: auth.user.id,
        method: body.method,
        content: body.content,
        nextFollowAt: body.nextFollowAt,
        createdAt: now,
        updatedAt: now
      }
      return { ...prev, follows: [...prev.follows, newFollow] }
    })

    return successResponse(null)
  }),

  // PUT /api/dashboard/recent-follows/:id
  http.put('/api/dashboard/recent-follows/:id', async ({ request, params }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const id = Number(params.id)
    const body = await request.json()
    const data = read()
    const follow = data.follows.find(f => f.id === id)
    if (!follow) return errorResponse(404, '跟进记录不存在')
    if (!canModify(auth.user, follow)) return errorResponse(403, '没有权限修改该跟进记录')

    update(prev => ({
      ...prev,
      follows: prev.follows.map(f => f.id === id ? {
        ...f,
        ...(body.customerId !== undefined && { customerId: body.customerId }),
        ...(body.method !== undefined && { method: body.method }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.nextFollowAt !== undefined && { nextFollowAt: body.nextFollowAt }),
        updatedAt: new Date().toISOString()
      } : f)
    }))

    return successResponse(null)
  }),

  // GET /api/dashboard/charts/sales-funnel
  http.get('/api/dashboard/charts/sales-funnel', ({ request }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const scenario = getScenario(request)
    if (scenario === 'error') return errorResponse(500, '服务器内部错误', 500)

    const data = read()
    if (scenario === 'empty') return successResponse([])
    if (scenario === 'partial') {
      const result = createSalesFunnel(data)
      return successResponse(result.map((item, index) => index % 2 === 0 ? { ...item, amount: undefined } : item))
    }
    return successResponse(createSalesFunnel(data))
  }),

  // GET /api/dashboard/charts/contract-trend
  http.get('/api/dashboard/charts/contract-trend', ({ request }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const scenario = getScenario(request)
    if (scenario === 'error') return errorResponse(500, '服务器内部错误', 500)

    const data = read()
    if (scenario === 'empty') return successResponse([])
    if (scenario === 'partial') {
      const result = createContractTrend(data)
      return successResponse(result.map((item, index) => index % 2 === 0 ? { ...item, amount: undefined } : item))
    }
    return successResponse(createContractTrend(data))
  }),

  // GET /api/dashboard/charts/ticket-status
  http.get('/api/dashboard/charts/ticket-status', ({ request }) => {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const scenario = getScenario(request)
    if (scenario === 'error') return errorResponse(500, '服务器内部错误', 500)

    const data = read()
    if (scenario === 'empty') return successResponse([])
    if (scenario === 'partial') {
      const result = createTicketStatusDistribution(data)
      return successResponse(result.map((item, index) => index % 2 === 0 ? { ...item, count: undefined } : item))
    }
    return successResponse(createTicketStatusDistribution(data))
  }),

  // GET /api/health
  http.get('/api/health', () => {
    const data = read()
    return successResponse({
      status: 'healthy',
      version: data.version,
      seed: data.seed,
      users: data.users.length,
      customers: data.customers?.length || 0,
      opportunities: data.opportunities?.length || 0,
      contracts: data.contracts?.length || 0,
      tickets: data.tickets?.length || 0,
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
