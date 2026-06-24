import { fakerZH_CN as faker } from '@faker-js/faker'

faker.seed(2026)

// 角色定义
const roles = [
  {
    name: 'admin',
    label: '超级管理员',
    permissions: ['*']
  },
  {
    name: 'manager',
    label: '销售经理',
    permissions: [
      'dashboard:view',
      'customer:view',
      'customer:create',
      'opportunity:create',
      'contract:approve',
      'ticket:handle'
    ]
  },
  {
    name: 'sales',
    label: '销售代表',
    permissions: [
      'dashboard:view',
      'customer:view',
      'customer:create',
      'opportunity:create'
    ]
  },
  {
    name: 'support',
    label: '客服专员',
    permissions: [
      'dashboard:view',
      'customer:view',
      'ticket:handle'
    ]
  },
  {
    name: 'viewer',
    label: '访客',
    permissions: [
      'dashboard:view'
    ]
  }
]

// 菜单定义
const menus = [
  {
    path: '/dashboard',
    title: '首页工作台',
    shortLabel: '首页',
    icon: 'Monitor',
    roles: ['admin', 'manager', 'sales', 'support', 'viewer']
  },
  {
    path: '/customers',
    title: '客户管理',
    shortLabel: '客户',
    icon: 'User',
    roles: ['admin', 'manager', 'sales', 'support']
  },
  {
    path: '/opportunities',
    title: '商机管理',
    shortLabel: '商机',
    icon: 'TrendCharts',
    roles: ['admin', 'manager', 'sales']
  },
  {
    path: '/contracts',
    title: '合同管理',
    shortLabel: '合同',
    icon: 'Document',
    roles: ['admin', 'manager']
  },
  {
    path: '/tickets',
    title: '工单中心',
    shortLabel: '工单',
    icon: 'Tickets',
    roles: ['admin', 'manager', 'support']
  },
  {
    path: '/api-docs',
    title: '接口文档',
    shortLabel: '接口',
    icon: 'Notebook',
    roles: ['admin']
  }
]

// 5个固定演示账号 + 10个普通用户
const demoUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'Admin@2026',
    name: '系统管理员',
    email: 'admin@nexus-crm.com',
    phone: '13800000001',
    avatar: '',
    role: 'admin',
    roleName: '超级管理员',
    status: 'active',
    lastLoginAt: null
  },
  {
    id: 2,
    username: 'manager',
    password: 'Manager@2026',
    name: '张经理',
    email: 'manager@nexus-crm.com',
    phone: '13800000002',
    avatar: '',
    role: 'manager',
    roleName: '销售经理',
    status: 'active',
    lastLoginAt: null
  },
  {
    id: 3,
    username: 'sales',
    password: 'Sales@2026',
    name: '李销售',
    email: 'sales@nexus-crm.com',
    phone: '13800000003',
    avatar: '',
    role: 'sales',
    roleName: '销售代表',
    status: 'active',
    lastLoginAt: null
  },
  {
    id: 4,
    username: 'support',
    password: 'Support@2026',
    name: '王客服',
    email: 'support@nexus-crm.com',
    phone: '13800000004',
    avatar: '',
    role: 'support',
    roleName: '客服专员',
    status: 'active',
    lastLoginAt: null
  },
  {
    id: 5,
    username: 'viewer',
    password: 'Viewer@2026',
    name: '赵访客',
    email: 'viewer@nexus-crm.com',
    phone: '13800000005',
    avatar: '',
    role: 'viewer',
    roleName: '访客',
    status: 'active',
    lastLoginAt: null
  },
  {
    id: 6,
    username: 'disabled',
    password: 'Disabled@2026',
    name: '禁用账号',
    email: 'disabled@nexus-crm.com',
    phone: '13800000006',
    avatar: '',
    role: 'viewer',
    roleName: '访客',
    status: 'disabled',
    lastLoginAt: null
  }
]

// 额外生成10个普通用户
const extraUsers = Array.from({ length: 10 }, (_, i) => ({
  id: i + 7,
  username: faker.internet.username(),
  password: faker.internet.password({ length: 12, memorable: false }) + '@2026',
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  avatar: '',
  role: faker.helpers.arrayElement(['sales', 'support', 'viewer']),
  roleName: '',
  status: faker.helpers.arrayElement(['active', 'active', 'active', 'disabled']),
  lastLoginAt: null
})).map(user => {
  const role = roles.find(r => r.name === user.role)
  return { ...user, roleName: role ? role.label : '未知' }
})

const allUsers = [...demoUsers, ...extraUsers]
const activeUsers = allUsers.filter(u => u.status === 'active')
const salesUsers = activeUsers.filter(u => u.role === 'sales' || u.role === 'manager' || u.role === 'admin')
const supportUsers = activeUsers.filter(u => u.role === 'support' || u.role === 'admin')

// 客户数据 40-50 条
const customerStatuses = ['active', 'inactive', 'potential']
const customerLevels = ['A', 'B', 'C', 'D']
const customers = Array.from({ length: 45 }, (_, i) => {
  const status = faker.helpers.arrayElement(customerStatuses)
  const owner = faker.helpers.arrayElement(salesUsers)
  return {
    id: i + 1,
    name: faker.company.name(),
    contactName: faker.person.fullName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    address: faker.location.city() + faker.location.street(),
    level: faker.helpers.arrayElement(customerLevels),
    status,
    ownerId: owner.id,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent({ days: 90 }).toISOString()
  }
})

const activeCustomers = customers.filter(c => c.status === 'active')

// 商机阶段与状态
const opportunityStages = ['lead', 'qualification', 'proposal', 'negotiation', 'closed']
const opportunityStatuses = ['active', 'won', 'lost', 'paused']

const opportunities = Array.from({ length: 35 }, (_, i) => {
  const customer = faker.helpers.arrayElement(customers)
  const owner = faker.helpers.arrayElement(salesUsers)
  const stage = faker.helpers.arrayElement(opportunityStages)
  const status = stage === 'closed'
    ? faker.helpers.arrayElement(['won', 'lost'])
    : faker.helpers.arrayElement(['active', 'active', 'active', 'paused'])
  const amount = faker.number.int({ min: 50000, max: 2000000 })
  return {
    id: i + 1,
    title: faker.commerce.productName() + ' 项目',
    customerId: customer.id,
    ownerId: owner.id,
    stage,
    status,
    amount,
    expectedCloseDate: faker.date.future({ years: 1 }).toISOString(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 60 }).toISOString()
  }
})

// 合同数据 20-30 条
const contractStatuses = ['draft', 'signed', 'executing', 'completed', 'terminated']
const contracts = Array.from({ length: 25 }, (_, i) => {
  const customer = faker.helpers.arrayElement(customers)
  const opportunity = faker.helpers.arrayElement(opportunities)
  const owner = faker.helpers.arrayElement(salesUsers)
  const status = faker.helpers.arrayElement(contractStatuses)
  const amount = faker.number.int({ min: 100000, max: 5000000 })
  const signDate = faker.date.past({ years: 1 }).toISOString()
  const month = signDate.slice(0, 7)
  return {
    id: i + 1,
    code: 'HT' + new Date().getFullYear() + String(i + 1).padStart(4, '0'),
    customerId: customer.id,
    opportunityId: opportunity.id,
    ownerId: owner.id,
    status,
    amount,
    signDate,
    month,
    createdAt: signDate,
    updatedAt: faker.date.recent({ days: 60 }).toISOString()
  }
})

// 工单数据 25-35 条
const ticketStatuses = ['pending', 'processing', 'resolved', 'closed']
const ticketPriorities = ['low', 'medium', 'high', 'urgent']
const tickets = Array.from({ length: 30 }, (_, i) => {
  const customer = faker.helpers.arrayElement(customers)
  const assignee = faker.helpers.arrayElement(supportUsers)
  const status = faker.helpers.arrayElement(ticketStatuses)
  return {
    id: i + 1,
    code: 'GD' + new Date().getFullYear() + String(i + 1).padStart(4, '0'),
    title: faker.helpers.arrayElement(['系统使用咨询', '数据导入问题', '合同流程疑问', '客户信息变更', '权限申请', '报表导出问题']) + ' - ' + customer.name,
    customerId: customer.id,
    assigneeId: assignee.id,
    status,
    priority: faker.helpers.arrayElement(ticketPriorities),
    createdAt: faker.date.recent({ days: 90 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString()
  }
})

// 待办数据 8-12 条
const todoPriorities = ['low', 'medium', 'high']
const todoStatuses = ['pending', 'completed']
const todos = Array.from({ length: 10 }, (_, i) => {
  const customer = faker.helpers.arrayElement(customers)
  const owner = faker.helpers.arrayElement(activeUsers)
  const status = faker.helpers.arrayElement(todoStatuses)
  return {
    id: i + 1,
    title: faker.helpers.arrayElement(['回访客户', '发送报价单', '预约演示', '准备合同', '跟进付款', '更新客户资料']) + ' - ' + customer.name,
    customerId: customer.id,
    ownerId: owner.id,
    priority: faker.helpers.arrayElement(todoPriorities),
    status,
    dueAt: faker.date.soon({ days: 7 }).toISOString(),
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    updatedAt: faker.date.recent({ days: 10 }).toISOString()
  }
})

// 跟进数据 10 条
const followMethods = ['phone', 'visit', 'wechat', 'email']
const follows = Array.from({ length: 12 }, (_, i) => {
  const customer = faker.helpers.arrayElement(customers)
  const owner = faker.helpers.arrayElement(activeUsers)
  return {
    id: i + 1,
    customerId: customer.id,
    ownerId: owner.id,
    method: faker.helpers.arrayElement(followMethods),
    content: faker.helpers.arrayElement([
      '与客户确认了产品需求，客户表示下周安排内部评审。',
      '电话沟通了报价方案，客户对价格有异议，需要申请折扣。',
      '上门拜访关键决策人，现场演示了核心功能，反馈积极。',
      '微信发送了案例资料，客户已查阅并询问实施周期。',
      '邮件确认了合同条款，法务部门正在审核。'
    ]),
    nextFollowAt: faker.date.soon({ days: 14 }).toISOString(),
    createdAt: faker.date.recent({ days: 60 }).toISOString(),
    updatedAt: faker.date.recent({ days: 10 }).toISOString()
  }
})

export function generateSeedData() {
  faker.seed(2026)
  return {
    version: 4,
    seed: 2026,
    generatedAt: new Date().toISOString(),
    users: allUsers,
    roles,
    menus,
    sessions: [],
    customers,
    opportunities,
    contracts,
    tickets,
    todos,
    follows
  }
}
