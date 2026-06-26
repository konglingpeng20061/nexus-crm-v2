export const OPPORTUNITY_STAGES = [
  { value: 'lead', label: '初步接触', probability: 10, terminal: false },
  { value: 'qualified', label: '需求确认', probability: 30, terminal: false },
  { value: 'proposal', label: '方案报价', probability: 50, terminal: false },
  { value: 'negotiation', label: '合同谈判', probability: 75, terminal: false },
  { value: 'won', label: '已成交', probability: 100, terminal: true },
  { value: 'lost', label: '已流失', probability: 0, terminal: true }
]

const STAGE_TRANSITIONS = {
  lead: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['negotiation', 'lost'],
  negotiation: ['won', 'lost'],
  won: [],
  lost: []
}

const REFERENCE_DATE = new Date('2026-06-25T12:00:00.000Z')

function getStageConfig(stage) {
  return OPPORTUNITY_STAGES.find(s => s.value === stage)
}

export function getAllowedStageTransitions(stage) {
  return STAGE_TRANSITIONS[stage] || []
}

function ownerMap(database) {
  return new Map(database.users.map(u => [u.id, u.name]))
}

function customerMap(database) {
  return new Map(database.customers.map(c => [c.id, c.name]))
}

export function withOpportunityRelations(database, list) {
  const om = ownerMap(database)
  const cm = customerMap(database)
  return list.map(o => ({
    ...o,
    customerName: cm.get(o.customerId) || '未知',
    ownerName: om.get(o.ownerId) || '未知',
    overdue: !getStageConfig(o.stage)?.terminal && new Date(o.expectedCloseDate) < REFERENCE_DATE
  }))
}

function applySearchParams(list, params) {
  const keyword = (params.keyword || '').trim().toLowerCase()
  const stage = params.stage || ''
  const ownerId = params.ownerId ? Number(params.ownerId) : ''
  const expectedCloseStart = params.expectedCloseStart || ''
  const expectedCloseEnd = params.expectedCloseEnd || ''

  if (keyword) {
    list = list.filter(o =>
      o.name.toLowerCase().includes(keyword) ||
      (o.customerName || '').toLowerCase().includes(keyword)
    )
  }
  if (stage && OPPORTUNITY_STAGES.some(s => s.value === stage)) {
    list = list.filter(o => o.stage === stage)
  }
  if (ownerId !== '') {
    list = list.filter(o => o.ownerId === ownerId)
  }
  if (expectedCloseStart) {
    const start = new Date(expectedCloseStart)
    if (!isNaN(start.getTime())) {
      list = list.filter(o => new Date(o.expectedCloseDate) >= start)
    }
  }
  if (expectedCloseEnd) {
    const end = new Date(expectedCloseEnd)
    if (!isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999)
      list = list.filter(o => new Date(o.expectedCloseDate) <= end)
    }
  }
  return list
}

export function queryOpportunities(database, searchParams) {
  let list = withOpportunityRelations(database, database.opportunities)
  list = applySearchParams(list, searchParams)

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
  return { list: list.slice(start, start + ps), total, page: p, pageSize: ps }
}

export function createOpportunityStatistics(database, searchParams) {
  let list = withOpportunityRelations(database, database.opportunities)
  list = applySearchParams(list, searchParams)

  const totalCount = list.length
  const totalAmount = list.reduce((s, o) => s + (Number(o.amount) || 0), 0)
  const wonList = list.filter(o => o.stage === 'won')
  const wonAmount = wonList.reduce((s, o) => s + (Number(o.amount) || 0), 0)
  const activeList = list.filter(o => !getStageConfig(o.stage)?.terminal)
  const averageProbability = activeList.length
    ? Math.round(activeList.reduce((s, o) => s + (o.probability || 0), 0) / activeList.length)
    : 0
  const overdueCount = list.filter(
    o => !getStageConfig(o.stage)?.terminal && new Date(o.expectedCloseDate) < REFERENCE_DATE
  ).length

  const byStage = OPPORTUNITY_STAGES.map(s => {
    const items = list.filter(o => o.stage === s.value)
    return {
      stage: s.value,
      label: s.label,
      probability: s.probability,
      count: items.length,
      amount: items.reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
    }
  })

  return { totalCount, totalAmount, wonAmount, averageProbability, overdueCount, byStage }
}

export function getOpportunityDetail(database, id) {
  const opportunity = database.opportunities.find(o => o.id === Number(id))
  if (!opportunity) return null

  const customer = database.customers.find(c => c.id === opportunity.customerId)
  const owner = database.users.find(u => u.id === opportunity.ownerId)
  const om = ownerMap(database)
  const stageConfig = getStageConfig(opportunity.stage)

  const stageRecords = (database.opportunityStageRecords || [])
    .filter(r => r.opportunityId === opportunity.id)
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
    .map(r => ({ ...r, changedByName: om.get(r.changedBy) || '未知' }))

  return {
    ...opportunity,
    customerName: customer ? customer.name : '未知',
    ownerName: owner ? owner.name : '未知',
    probability: stageConfig ? stageConfig.probability : 0,
    overdue: !stageConfig?.terminal && new Date(opportunity.expectedCloseDate) < REFERENCE_DATE,
    customer: customer ? { id: customer.id, name: customer.name, level: customer.level, status: customer.status } : null,
    owner: owner ? { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone, avatar: owner.avatar || '', role: owner.role, roleName: owner.roleName || '' } : null,
    stageRecords
  }
}

export function validateOpportunityInput(database, input) {
  const errors = []

  if (!input.name || !input.name.trim()) {
    errors.push({ field: 'name', message: '商机名称不能为空' })
  } else if (input.name.length > 100) {
    errors.push({ field: 'name', message: '商机名称不能超过100个字符' })
  }

  if (!input.customerId) {
    errors.push({ field: 'customerId', message: '请选择客户' })
  } else {
    const customer = database.customers.find(c => c.id === Number(input.customerId))
    if (!customer) errors.push({ field: 'customerId', message: '客户不存在' })
  }

  if (!input.ownerId) {
    errors.push({ field: 'ownerId', message: '请选择负责人' })
  } else {
    const user = database.users.find(u => u.id === Number(input.ownerId))
    if (!user || user.status !== 'active' || !['admin', 'manager', 'sales'].includes(user.role)) {
      errors.push({ field: 'ownerId', message: '请选择有效的负责人' })
    }
  }

  const stage = input.stage || ''
  if (!stage || !OPPORTUNITY_STAGES.some(s => s.value === stage)) {
    errors.push({ field: 'stage', message: '请选择有效的销售阶段' })
  }

  const amount = Number(input.amount)
  if (!amount || !Number.isInteger(amount) || amount <= 0) {
    errors.push({ field: 'amount', message: '金额必须是大于0的整数' })
  } else if (amount > 99999999) {
    errors.push({ field: 'amount', message: '金额不能超过99,999,999' })
  }

  if (!input.expectedCloseDate) {
    errors.push({ field: 'expectedCloseDate', message: '请选择预计成交日期' })
  } else if (isNaN(new Date(input.expectedCloseDate).getTime())) {
    errors.push({ field: 'expectedCloseDate', message: '日期格式无效' })
  }

  if (input.nextStep && input.nextStep.length > 200) {
    errors.push({ field: 'nextStep', message: '下一步计划不能超过200个字符' })
  }
  if (input.description && input.description.length > 500) {
    errors.push({ field: 'description', message: '描述不能超过500个字符' })
  }

  const stageConfig = getStageConfig(stage)
  if (stageConfig && !stageConfig.terminal && !input.nextStep?.trim()) {
    errors.push({ field: 'nextStep', message: '活跃阶段的商机必须填写下一步计划' })
  }

  return { valid: errors.length === 0, errors }
}

export function normalizeOpportunityInput(input) {
  const stage = input.stage || 'lead'
  return {
    name: (input.name || '').trim(),
    customerId: Number(input.customerId),
    ownerId: Number(input.ownerId),
    stage,
    amount: Number(input.amount) || 0,
    probability: getStageConfig(stage)?.probability || 0,
    expectedCloseDate: input.expectedCloseDate || '',
    nextStep: (input.nextStep || '').trim(),
    description: (input.description || '').trim()
  }
}

export function validateStageTransition(opportunity, input) {
  const errors = []
  const toStage = input.stage || ''
  const stageConfig = getStageConfig(toStage)

  if (!stageConfig) {
    errors.push({ field: 'stage', message: '目标阶段无效' })
    return { valid: false, errors }
  }

  const allowed = STAGE_TRANSITIONS[opportunity.stage] || []
  if (!allowed.includes(toStage)) {
    const fromLabel = getStageConfig(opportunity.stage)?.label || opportunity.stage
    errors.push({ field: 'stage', message: `不允许从${fromLabel}流转到${stageConfig.label}`, code: 409 })
    return { valid: false, errors }
  }

  if (!stageConfig.terminal && !input.nextStep?.trim()) {
    errors.push({ field: 'nextStep', message: '活跃阶段必须填写下一步计划' })
  }
  if (input.nextStep && input.nextStep.length > 200) {
    errors.push({ field: 'nextStep', message: '下一步计划不能超过200个字符' })
  }
  if (input.note && input.note.length > 500) {
    errors.push({ field: 'note', message: '说明不能超过500个字符' })
  }

  return { valid: errors.length === 0, errors, conflictCode: errors.find(e => e.code === 409)?.code }
}

export function createOpportunityBoard(database) {
  const enriched = withOpportunityRelations(database, database.opportunities)
  enriched.sort((a, b) => new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime())

  return OPPORTUNITY_STAGES.map(s => {
    const items = enriched.filter(o => o.stage === s.value)
    return {
      stage: s.value,
      label: s.label,
      probability: s.probability,
      count: items.length,
      amount: items.reduce((sum, o) => sum + (Number(o.amount) || 0), 0),
      opportunities: items
    }
  })
}
