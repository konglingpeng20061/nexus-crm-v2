// dashboard 聚合函数

export function createDashboardSummary(database) {
  const customerCount = database.customers.length
  const activeCustomerCount = database.customers.filter(c => c.status === 'active').length
  const activeOpportunities = database.opportunities.filter(o => o.status === 'active')
  const activeOpportunityCount = activeOpportunities.length
  const opportunityAmount = activeOpportunities.reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
  const contractAmount = database.contracts
    .filter(c => c.status !== 'terminated')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  const pendingTicketCount = database.tickets.filter(t => t.status === 'pending' || t.status === 'processing').length

  return {
    customerCount,
    activeCustomerCount,
    activeOpportunityCount,
    opportunityAmount,
    contractAmount,
    pendingTicketCount
  }
}

export function createSalesFunnel(database) {
  const stages = ['lead', 'qualification', 'proposal', 'negotiation', 'closed']
  const stageLabels = {
    lead: '线索',
    qualification: '验证',
    proposal: '提案',
    negotiation: '谈判',
    closed: '关闭'
  }

  return stages.map(stage => {
    const items = database.opportunities.filter(o => o.stage === stage)
    const count = items.length
    const amount = items.reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
    return {
      stage,
      stageName: stageLabels[stage],
      count,
      amount
    }
  })
}

export function createContractTrend(database) {
  const now = new Date()
  const months = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toISOString().slice(0, 7))
  }

  return months.map(month => {
    const items = database.contracts.filter(c => c.month === month && c.status !== 'terminated')
    const count = items.length
    const amount = items.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
    return {
      month,
      monthName: month.replace('-', '年') + '月',
      count,
      amount
    }
  })
}

export function createTicketStatusDistribution(database) {
  const statuses = ['pending', 'processing', 'resolved', 'closed']
  const statusLabels = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  const total = database.tickets.length || 1

  return statuses.map(status => {
    const count = database.tickets.filter(t => t.status === status).length
    return {
      status,
      statusName: statusLabels[status],
      count,
      ratio: Number(((count / total) * 100).toFixed(2))
    }
  })
}

export function getCustomerOptions(database) {
  return database.customers.map(c => ({
    id: c.id,
    name: c.name,
    level: c.level,
    status: c.status
  }))
}

export function getTodos(database) {
  return [...database.todos]
    .sort((a, b) => new Date(b.dueAt) - new Date(a.dueAt))
    .map(t => enrichActivity(database, t, 'todo'))
}

export function getRecentFollows(database) {
  return [...database.follows]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(f => enrichActivity(database, f, 'follow'))
}

function enrichActivity(database, item, type) {
  const customer = database.customers.find(c => c.id === item.customerId)
  const owner = database.users.find(u => u.id === item.ownerId)
  return {
    ...item,
    customerName: customer ? customer.name : '未知客户',
    ownerName: owner ? owner.name : '未知负责人'
  }
}
