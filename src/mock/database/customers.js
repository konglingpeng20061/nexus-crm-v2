const LEVEL_MAP = { A: '重点客户', B: '普通客户', C: '潜在客户' }
const STATUS_MAP = { active: 'active', potential: 'potential', inactive: 'inactive', at_risk: 'at_risk' }

function validLevel(level) {
  return Object.keys(LEVEL_MAP).includes(level)
}

function validStatus(status) {
  return Object.keys(STATUS_MAP).includes(status)
}

const VALID_INDUSTRIES = ['互联网', '制造业', '金融', '教育', '医疗', '零售', '物流']

function ownerMap(database) {
  return new Map(database.users.map(u => [u.id, u.name]))
}

function isValidOwner(database, userId) {
  if (!userId) return false
  const user = database.users.find(u => u.id === Number(userId))
  if (!user) return false
  if (user.status !== 'active') return false
  return ['admin', 'manager', 'sales'].includes(user.role)
}

export function queryCustomers(database, searchParams) {
  const keyword = (searchParams.keyword || '').trim().toLowerCase()
  const industry = searchParams.industry || ''
  const level = searchParams.level || ''
  const status = searchParams.status || ''
  const ownerId = searchParams.ownerId ? Number(searchParams.ownerId) : ''

  let list = [...database.customers]

  if (keyword) {
    list = list.filter(c =>
      c.name.toLowerCase().includes(keyword) ||
      (c.contactName || '').toLowerCase().includes(keyword) ||
      (c.contactPhone || '').includes(keyword)
    )
  }
  if (industry && VALID_INDUSTRIES.includes(industry)) {
    list = list.filter(c => c.industry === industry)
  }
  if (level) {
    list = list.filter(c => c.level === level)
  }
  if (status) {
    list = list.filter(c => c.status === status)
  }
  if (ownerId !== '') {
    list = list.filter(c => c.ownerId === ownerId)
  }

  list.sort((a, b) => {
    const da = new Date(b.updatedAt || 0).getTime()
    const db = new Date(a.updatedAt || 0).getTime()
    if (da !== db) return da - db
    return (a.name || '').localeCompare(b.name || '', 'zh')
  })

  const total = list.length
  const p = Math.max(1, Number(searchParams.page) || 1)
  const ps = Math.min(100, Math.max(1, Number(searchParams.pageSize) || 10))
  const start = (p - 1) * ps
  const paginatedList = list.slice(start, start + ps)

  const om = ownerMap(database)
  const result = paginatedList.map(c => ({
    ...c,
    ownerName: om.get(c.ownerId) || '未知',
    region: [c.province, c.city].filter(Boolean).join(' ')
  }))

  return { list: result, total, page: p, pageSize: ps }
}

export function getCustomerFilterOptions(database) {
  const customers = database.customers
  const industries = [...new Set(customers.map(c => c.industry).filter(Boolean))].sort()
  const levels = [...new Set(customers.map(c => c.level).filter(Boolean))]
  const statuses = [...new Set(customers.map(c => c.status).filter(Boolean))]
  const owners = database.users
    .filter(u => u.status === 'active' && ['admin', 'manager', 'sales'].includes(u.role))
    .map(u => ({ id: u.id, name: u.name }))

  return { industries, levels, statuses, owners }
}

export function getCustomerDetail(database, id) {
  const customer = database.customers.find(c => c.id === Number(id))
  if (!customer) return null

  const owner = database.users.find(u => u.id === customer.ownerId)
  const om = ownerMap(database)

  const contacts = [{
    name: customer.contactName || '',
    phone: customer.contactPhone || '',
    title: customer.contactTitle || '',
    email: customer.contactEmail || '',
    primary: true
  }].filter(c => c.name)

  const followRecords = database.follows
    .filter(f => f.customerId === customer.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(f => ({
      ...f,
      ownerName: om.get(f.ownerId) || '未知'
    }))

  return {
    ...customer,
    owner: owner ? {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      avatar: owner.avatar || '',
      role: owner.role,
      roleName: owner.roleName || ''
    } : null,
    contacts,
    followRecords,
    region: [customer.province, customer.city].filter(Boolean).join(' ')
  }
}

export function validateCustomerInput(database, input, excludeId) {
  const errors = []
  if (!input.name || !input.name.trim()) {
    errors.push({ field: 'name', message: '客户名称不能为空' })
  } else if (input.name.length > 100) {
    errors.push({ field: 'name', message: '客户名称不能超过100个字符' })
  } else {
    const duplicate = database.customers.find(c =>
      c.name === input.name.trim() && c.id !== excludeId
    )
    if (duplicate) {
      errors.push({ field: 'name', message: '客户名称已存在', code: 409 })
    }
  }

  if (!input.industry || !VALID_INDUSTRIES.includes(input.industry)) {
    errors.push({ field: 'industry', message: '请选择有效的行业' })
  }
  if (!input.level || !validLevel(input.level)) {
    errors.push({ field: 'level', message: '请选择有效的客户等级' })
  }
  if (!input.status || !validStatus(input.status)) {
    errors.push({ field: 'status', message: '请选择有效的客户状态' })
  }
  if (!isValidOwner(database, input.ownerId)) {
    errors.push({ field: 'ownerId', message: '请选择有效的负责人' })
  }
  if (!input.province) {
    errors.push({ field: 'province', message: '请选择省份' })
  }
  if (!input.city) {
    errors.push({ field: 'city', message: '请选择城市' })
  }
  if (!input.address || !input.address.trim()) {
    errors.push({ field: 'address', message: '详细地址不能为空' })
  }
  if (!input.source) {
    errors.push({ field: 'source', message: '请选择客户来源' })
  }
  if (!input.contactName || !input.contactName.trim()) {
    errors.push({ field: 'contactName', message: '联系人不能为空' })
  } else if (input.contactName.length > 30) {
    errors.push({ field: 'contactName', message: '联系人不能超过30个字符' })
  }
  if (!input.contactPhone || !input.contactPhone.trim()) {
    errors.push({ field: 'contactPhone', message: '手机号不能为空' })
  } else if (!/^1[3-9]\d{9}$/.test(input.contactPhone.trim())) {
    errors.push({ field: 'contactPhone', message: '手机号格式不正确' })
  }
  if (input.contactEmail && input.contactEmail.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail.trim())) {
      errors.push({ field: 'contactEmail', message: '邮箱格式不正确' })
    }
  }
  if (input.description && input.description.length > 500) {
    errors.push({ field: 'description', message: '客户描述不能超过500个字符' })
  }

  const conflict = errors.find(e => e.code === 409)
  return { valid: errors.length === 0, errors, conflictCode: conflict ? 409 : null }
}

export function normalizeCustomerInput(input) {
  return {
    name: (input.name || '').trim(),
    industry: input.industry || '',
    level: input.level || '',
    status: input.status || '',
    ownerId: Number(input.ownerId) || null,
    province: input.province || '',
    city: input.city || '',
    address: (input.address || '').trim(),
    source: input.source || '',
    contactName: (input.contactName || '').trim(),
    contactPhone: (input.contactPhone || '').trim(),
    contactTitle: (input.contactTitle || '').trim(),
    contactEmail: (input.contactEmail || '').trim(),
    description: (input.description || '').trim()
  }
}

export function getCustomerDeleteConflict(database, customerId) {
  const hasOpportunity = database.opportunities.some(o => o.customerId === Number(customerId))
  const hasContract = database.contracts.some(c => c.customerId === Number(customerId))
  const hasTicket = database.tickets.some(t => t.customerId === Number(customerId))
  const conflicts = []
  if (hasOpportunity) conflicts.push('关联商机')
  if (hasContract) conflicts.push('关联合同')
  if (hasTicket) conflicts.push('关联工单')
  return conflicts
}

export function isValidCustomerOwner(database, ownerId) {
  return isValidOwner(database, ownerId)
}

export function validateFollowRecordInput(input) {
  const errors = []
  const validMethods = ['phone', 'visit', 'wechat', 'email']
  if (!validMethods.includes(input.method)) {
    errors.push({ field: 'method', message: '请选择有效的跟进方式' })
  }
  if (!input.content || !input.content.trim()) {
    errors.push({ field: 'content', message: '跟进内容不能为空' })
  } else if (input.content.length > 500) {
    errors.push({ field: 'content', message: '跟进内容不能超过500个字符' })
  }
  if (!input.nextFollowAt) {
    errors.push({ field: 'nextFollowAt', message: '请选择下次跟进时间' })
  }
  return { valid: errors.length === 0, errors }
}
