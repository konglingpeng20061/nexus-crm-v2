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
import {
  queryCustomers,
  getCustomerFilterOptions,
  getCustomerDetail,
  validateCustomerInput,
  normalizeCustomerInput,
  getCustomerDeleteConflict,
  isValidCustomerOwner,
  validateFollowRecordInput
} from '../database/customers'
import {
  OPPORTUNITY_STAGES,
  queryOpportunities,
  createOpportunityStatistics,
  getOpportunityDetail,
  validateOpportunityInput,
  normalizeOpportunityInput,
  validateStageTransition,
  getAllowedStageTransitions,
  createOpportunityBoard
} from '../database/opportunities'

function successResponse(data) {
  return HttpResponse.json({ code: 0, message: '操作成功', data })
}

function errorResponse(code, message, status = 200) {
  return HttpResponse.json({ code, message, data: null }, { status })
}

function generateToken(userId) {
  return `nexus_${userId}_${Math.random().toString(36).substring(2, 10)}`
}

function getTokenFromHeader(request) {
  const auth = request.headers.get('Authorization') || ''
  return auth.replace('Bearer ', '')
}

function extractUserIdFromToken(token) {
  if (!token) return null
  if (token.startsWith('nexus_')) {
    const parts = token.split('_')
    const id = parts[1] ? Number(parts[1]) : NaN
    return Number.isFinite(id) ? id : null
  }
  return null
}

function getUserByToken(token) {
  const data = read()
  const session = data.sessions.find(s => s.token === token)
  if (session) {
    return data.users.find(u => u.id === session.userId)
  }
  const userId = extractUserIdFromToken(token)
  if (userId) {
    return data.users.find(u => u.id === userId)
  }
  return null
}

function requireAuth(request) {
  const token = getTokenFromHeader(request)
  const user = getUserByToken(token)
  if (!user) return { error: errorResponse(401, '未登录或 Token 已过期') }
  return { user }
}

function checkPermission(user, permission) {
  const data = read()
  const role = data.roles.find(r => r.name === user.role)
  if (!role) return false
  return role.permissions.includes('*') || role.permissions.includes(permission)
}

function requirePermission(request, permission) {
  const auth = requireAuth(request)
  if (auth.error) return { error: auth.error }
  if (!checkPermission(auth.user, permission)) {
    return { error: errorResponse(403, '没有权限执行此操作') }
  }
  return { user: auth.user }
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

    const token = generateToken(user.id)
    const now = new Date().toISOString()

    update(prev => {
      const updatedUsers = prev.users.map(u =>
        u.id === user.id ? { ...u, lastLoginAt: now } : u
      )
      const cleanedSessions = prev.sessions.filter(s => s.userId !== user.id)
      return {
        ...prev,
        users: updatedUsers,
        sessions: [...cleanedSessions, { token, userId: user.id, createdAt: now }]
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

  // GET /api/customers/options
  http.get('/api/customers/options', ({ request }) => {
    const perm = requirePermission(request, 'customer:view')
    if (perm.error) return perm.error

    const data = read()
    return successResponse(getCustomerFilterOptions(data))
  }),

  // GET /api/customers
  http.get('/api/customers', ({ request }) => {
    const perm = requirePermission(request, 'customer:view')
    if (perm.error) return perm.error

    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const data = read()
    return successResponse(queryCustomers(data, params))
  }),

  // POST /api/customers
  http.post('/api/customers', async ({ request }) => {
    const perm = requirePermission(request, 'customer:create')
    if (perm.error) return perm.error

    const body = await request.json()
    const data = read()

    const validation = validateCustomerInput(data, body)
    if (!validation.valid) {
      const status = validation.conflictCode || 400
      const firstError = validation.errors[0]
      return errorResponse(status, firstError.message)
    }

    const normalized = normalizeCustomerInput(body)
    const now = new Date().toISOString()
    const maxId = data.customers.length ? Math.max(...data.customers.map(c => c.id)) : 0

    const newCustomer = {
      ...normalized,
      id: maxId + 1,
      lastFollowAt: null,
      createdAt: now,
      updatedAt: now
    }

    update(prev => ({
      ...prev,
      customers: [...prev.customers, newCustomer]
    }))

    const om = new Map(data.users.map(u => [u.id, u.name]))
    const result = {
      ...newCustomer,
      ownerName: om.get(newCustomer.ownerId) || '未知',
      region: [newCustomer.province, newCustomer.city].filter(Boolean).join(' ')
    }

    return successResponse(result)
  }),

  // GET /api/customers/:id
  http.get('/api/customers/:id', ({ request, params }) => {
    const perm = requirePermission(request, 'customer:view')
    if (perm.error) return perm.error

    const data = read()
    const detail = getCustomerDetail(data, params.id)
    if (!detail) {
      return errorResponse(404, '客户不存在或已删除', 404)
    }
    return successResponse(detail)
  }),

  // PUT /api/customers/:id
  http.put('/api/customers/:id', async ({ request, params }) => {
    const perm = requirePermission(request, 'customer:edit')
    if (perm.error) return perm.error

    const id = Number(params.id)
    const body = await request.json()
    const data = read()

    const customer = data.customers.find(c => c.id === id)
    if (!customer) {
      return errorResponse(404, '客户不存在或已删除', 404)
    }

    if (!checkPermission(perm.user, 'customer:assign')) {
      if (body.ownerId !== undefined && Number(body.ownerId) !== customer.ownerId) {
        return errorResponse(403, '没有权限修改客户负责人', 403)
      }
      body.ownerId = customer.ownerId
    }

    const merged = { ...customer, ...body, id: customer.id, createdAt: customer.createdAt, lastFollowAt: customer.lastFollowAt }

    const validation = validateCustomerInput(data, merged, customer.id)
    if (!validation.valid) {
      const status = validation.conflictCode || 400
      const firstError = validation.errors[0]
      return errorResponse(status, firstError.message)
    }

    const normalized = normalizeCustomerInput(merged)
    const now = new Date().toISOString()

    update(prev => ({
      ...prev,
      customers: prev.customers.map(c =>
        c.id === id ? { ...c, ...normalized, id: c.id, createdAt: c.createdAt, lastFollowAt: c.lastFollowAt, updatedAt: now } : c
      )
    }))

    const updatedData = read()
    const detail = getCustomerDetail(updatedData, id)
    return successResponse(detail)
  }),

  // DELETE /api/customers/:id
  http.delete('/api/customers/:id', ({ request, params }) => {
    const perm = requirePermission(request, 'customer:delete')
    if (perm.error) return perm.error

    const id = Number(params.id)
    const data = read()

    const customer = data.customers.find(c => c.id === id)
    if (!customer) {
      return errorResponse(404, '客户不存在或已删除', 404)
    }

    const conflicts = getCustomerDeleteConflict(data, id)
    if (conflicts.length > 0) {
      return errorResponse(409, `该客户存在${conflicts.join('、')}，无法删除`, 409)
    }

    update(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id),
      follows: prev.follows.filter(f => f.customerId !== id),
      todos: prev.todos.filter(t => t.customerId !== id)
    }))

    return successResponse(null)
  }),

  // POST /api/customers/:id/follows
  http.post('/api/customers/:id/follows', async ({ request, params }) => {
    const perm = requirePermission(request, 'customer:follow')
    if (perm.error) return perm.error

    const id = Number(params.id)
    const body = await request.json()

    const validation = validateFollowRecordInput(body)
    if (!validation.valid) {
      return errorResponse(400, validation.errors[0].message, 400)
    }

    const data = read()
    const customer = data.customers.find(c => c.id === id)
    if (!customer) {
      return errorResponse(404, '客户不存在或已删除', 404)
    }

    const now = new Date().toISOString()
    const maxId = data.follows.length ? Math.max(...data.follows.map(f => f.id)) : 0

    const newFollow = {
      id: maxId + 1,
      customerId: id,
      ownerId: perm.user.id,
      method: body.method,
      content: body.content,
      nextFollowAt: body.nextFollowAt,
      createdAt: now,
      updatedAt: now
    }

    update(prev => ({
      ...prev,
      follows: [...prev.follows, newFollow],
      customers: prev.customers.map(c =>
        c.id === id ? { ...c, lastFollowAt: now, updatedAt: now } : c
      )
    }))

    const updatedData = read()
    const detail = getCustomerDetail(updatedData, id)
    return successResponse(detail)
  }),

  // PUT /api/customers/:id/owner
  http.put('/api/customers/:id/owner', async ({ request, params }) => {
    const perm = requirePermission(request, 'customer:assign')
    if (perm.error) return perm.error

    const id = Number(params.id)
    const body = await request.json()

    const data = read()
    const customer = data.customers.find(c => c.id === id)
    if (!customer) {
      return errorResponse(404, '客户不存在或已删除', 404)
    }

    const newOwnerId = Number(body.ownerId)
    if (!isValidCustomerOwner(data, newOwnerId)) {
      return errorResponse(400, '无效的负责人，负责人必须是激活的超级管理员、销售经理或销售代表', 400)
    }

    const now = new Date().toISOString()
    update(prev => ({
      ...prev,
      customers: prev.customers.map(c =>
        c.id === id ? { ...c, ownerId: newOwnerId, updatedAt: now } : c
      )
    }))

    const updatedData = read()
    const detail = getCustomerDetail(updatedData, id)
    return successResponse(detail)
  }),

  // GET /api/opportunities/statistics
  http.get('/api/opportunities/statistics', ({ request }) => {
    const perm = requirePermission(request, 'opportunity:view')
    if (perm.error) return perm.error

    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const data = read()
    return successResponse(createOpportunityStatistics(data, params))
  }),

  // GET /api/opportunities/board
  http.get('/api/opportunities/board', ({ request }) => {
    const perm = requirePermission(request, 'opportunity:view')
    if (perm.error) return perm.error

    const data = read()
    return successResponse(createOpportunityBoard(data))
  }),

  // GET /api/opportunities
  http.get('/api/opportunities', ({ request }) => {
    const perm = requirePermission(request, 'opportunity:view')
    if (perm.error) return perm.error

    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const data = read()
    return successResponse(queryOpportunities(data, params))
  }),

  // POST /api/opportunities
  http.post('/api/opportunities', async ({ request }) => {
    const perm = requirePermission(request, 'opportunity:create')
    if (perm.error) return perm.error

    const body = await request.json()
    const data = read()

    const validation = validateOpportunityInput(data, body)
    if (!validation.valid) {
      return errorResponse(400, validation.errors[0].message, 400)
    }

    const normalized = normalizeOpportunityInput(body)
    const now = new Date().toISOString()

    update(prev => {
      const maxId = prev.opportunities.length ? Math.max(...prev.opportunities.map(o => o.id)) : 0
      const maxSrId = (prev.opportunityStageRecords || []).length ? Math.max(...prev.opportunityStageRecords.map(r => r.id)) : 0

      const newOp = {
        ...normalized,
        id: maxId + 1,
        createdAt: now,
        updatedAt: now
      }

      const initialRecord = {
        id: maxSrId + 1,
        opportunityId: maxId + 1,
        fromStage: null,
        toStage: normalized.stage,
        changedBy: perm.user.id,
        note: '创建商机',
        changedAt: now
      }

      return {
        ...prev,
        opportunities: [...prev.opportunities, newOp],
        opportunityStageRecords: [...(prev.opportunityStageRecords || []), initialRecord]
      }
    })

    const updatedData = read()
    const detail = getOpportunityDetail(updatedData, maxId ? maxId + 1 : 1)
    return successResponse(detail)
  }),

  // GET /api/opportunities/:id
  http.get('/api/opportunities/:id', ({ request, params }) => {
    const perm = requirePermission(request, 'opportunity:view')
    if (perm.error) return perm.error

    const data = read()
    const detail = getOpportunityDetail(data, params.id)
    if (!detail) return errorResponse(404, '商机不存在或已删除', 404)
    return successResponse(detail)
  }),

  // PUT /api/opportunities/:id
  http.put('/api/opportunities/:id', async ({ request, params }) => {
    const perm = requirePermission(request, 'opportunity:edit')
    if (perm.error) return perm.error

    const id = Number(params.id)
    const body = await request.json()
    const data = read()

    const opportunity = data.opportunities.find(o => o.id === id)
    if (!opportunity) return errorResponse(404, '商机不存在或已删除', 404)

    // 强制使用原商机阶段，防止绕过阶段状态机
    body.stage = opportunity.stage
    const merged = { ...opportunity, ...body, id: opportunity.id, createdAt: opportunity.createdAt }

    const validation = validateOpportunityInput(data, merged)
    if (!validation.valid) {
      return errorResponse(400, validation.errors[0].message, 400)
    }

    const normalized = normalizeOpportunityInput(merged)
    const now = new Date().toISOString()

    update(prev => ({
      ...prev,
      opportunities: prev.opportunities.map(o =>
        o.id === id ? { ...o, ...normalized, id: o.id, createdAt: o.createdAt, updatedAt: now } : o
      )
    }))

    const updatedData = read()
    const detail = getOpportunityDetail(updatedData, id)
    return successResponse(detail)
  }),

  // DELETE /api/opportunities/:id
  http.delete('/api/opportunities/:id', ({ request, params }) => {
    const perm = requirePermission(request, 'opportunity:delete')
    if (perm.error) return perm.error

    const id = Number(params.id)
    const data = read()

    const opportunity = data.opportunities.find(o => o.id === id)
    if (!opportunity) return errorResponse(404, '商机不存在或已删除', 404)

    update(prev => ({
      ...prev,
      opportunities: prev.opportunities.filter(o => o.id !== id),
      opportunityStageRecords: (prev.opportunityStageRecords || []).filter(r => r.opportunityId !== id)
    }))

    return successResponse(null)
  }),

  // PATCH /api/opportunities/:id/stage
  http.patch('/api/opportunities/:id/stage', async ({ request, params }) => {
    const perm = requirePermission(request, 'opportunity:stage')
    if (perm.error) return perm.error

    const id = Number(params.id)
    const body = await request.json()
    const data = read()

    const opportunity = data.opportunities.find(o => o.id === id)
    if (!opportunity) return errorResponse(404, '商机不存在或已删除', 404)

    const validation = validateStageTransition(opportunity, body)
    if (!validation.valid) {
      const status = validation.conflictCode || 400
      return errorResponse(status, validation.errors[0].message, status)
    }

    const now = new Date().toISOString()

    update(prev => {
      const targetStage = body.stage
      const stageConfig = OPPORTUNITY_STAGES.find(s => s.value === targetStage)
      const probability = stageConfig ? stageConfig.probability : 0
      const nextStep = stageConfig?.terminal ? '' : (body.nextStep || '').trim()
      const records = prev.opportunityStageRecords || []
      const maxSrId = records.length ? Math.max(...records.map(r => r.id)) : 0

      return {
        ...prev,
        opportunities: prev.opportunities.map(o =>
          o.id === id ? {
            ...o,
            stage: targetStage,
            probability,
            nextStep,
            updatedAt: now
          } : o
        ),
        opportunityStageRecords: [...records, {
          id: maxSrId + 1,
          opportunityId: id,
          fromStage: opportunity.stage,
          toStage: targetStage,
          changedBy: perm.user.id,
          note: body.note || '',
          changedAt: now
        }]
      }
    })

    const updatedData = read()
    const detail = getOpportunityDetail(updatedData, id)
    return successResponse(detail)
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
