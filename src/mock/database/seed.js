import { fakerZH_CN as faker } from '@faker-js/faker'

faker.seed(2026)

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
      'customer:edit',
      'customer:delete',
      'customer:assign',
      'customer:follow',
      'opportunity:view',
      'opportunity:create',
      'opportunity:edit',
      'opportunity:stage',
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
      'customer:edit',
      'customer:follow',
      'opportunity:view',
      'opportunity:create',
      'opportunity:edit',
      'opportunity:stage'
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
const validOwners = activeUsers.filter(u => ['admin', 'manager', 'sales'].includes(u.role))

const industries = ['互联网', '制造业', '金融', '教育', '医疗', '零售', '物流']
const levels = ['A', 'B', 'C']
const statuses = ['active', 'potential', 'inactive', 'at_risk']
const sources = ['线上注册', '客户推荐', '市场活动', '电话拜访', '官网咨询', '渠道合作']
const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '山东省']
const cityMap = {
  '北京市': ['朝阳区', '海淀区', '西城区', '东城区'],
  '上海市': ['浦东新区', '徐汇区', '静安区', '长宁区'],
  '广东省': ['深圳市', '广州市', '东莞市', '佛山市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市'],
  '四川省': ['成都市', '绵阳市', '德阳市', '宜宾市'],
  '湖北省': ['武汉市', '宜昌市', '襄阳市', '荆州市'],
  '山东省': ['济南市', '青岛市', '烟台市', '潍坊市']
}

const followMethods = ['phone', 'visit', 'wechat', 'email']
const followContents = [
  '与客户确认了产品需求，客户表示下周安排内部评审。',
  '电话沟通了报价方案，客户对价格有异议，需要申请折扣。',
  '上门拜访关键决策人，现场演示了核心功能，反馈积极。',
  '微信发送了案例资料，客户已查阅并询问实施周期。',
  '邮件确认了合同条款，法务部门正在审核。',
  '沟通了实施计划和时间节点，客户基本认可方案。',
  '电话回访了解使用情况，客户反馈了一些优化建议。',
  '邀请参加产品培训会，客户表示会安排人员参加。'
]

const customers = []
const customerFollows = []
let customerIdCounter = 0
let followIdCounter = 0

for (let i = 0; i < 48; i++) {
  customerIdCounter++
  const id = customerIdCounter
  const cid = 'CUS-' + String(id).padStart(8, '0')
  const industry = faker.helpers.arrayElement(industries)
  const level = faker.helpers.arrayElement(levels)
  const status = faker.helpers.arrayElement(statuses)
  const owner = faker.helpers.arrayElement(validOwners)
  const province = faker.helpers.arrayElement(provinces)
  const city = faker.helpers.arrayElement(cityMap[province])

  const createdAt = faker.date.between({ from: '2024-01-01', to: '2025-12-31' }).toISOString()

  const customer = {
    id,
    name: faker.company.name(),
    industry,
    level,
    status,
    ownerId: owner.id,
    province,
    city,
    address: faker.location.streetAddress(),
    source: faker.helpers.arrayElement(sources),
    contactName: faker.person.fullName(),
    contactPhone: '1' + faker.helpers.arrayElement(['38', '39', '58', '86', '35']) + faker.string.numeric({ length: 8 }),
    contactTitle: faker.person.jobTitle(),
    contactEmail: faker.internet.email(),
    description: faker.helpers.arrayElement([
      '该公司为行业领先企业，具有良好的合作潜力。',
      '中小型企业，预算适中，关注性价比。',
      '初创公司，决策链条短，需求明确。',
      '大型集团，决策周期较长，需要持续跟进。',
      '外资企业，合规要求高，需要定制方案。',
      ''
    ]),
    lastFollowAt: null,
    createdAt,
    updatedAt: faker.date.between({ from: '2025-06-01', to: '2026-06-24' }).toISOString()
  }

  if (level === 'A') {
    const followCount = faker.helpers.arrayElement([1, 2, 3])
    let lastFollow = null
    for (let j = 0; j < followCount; j++) {
      followIdCounter++
      const fCreatedAt = faker.date.between({
        from: new Date(customer.createdAt),
        to: new Date('2026-06-24')
      }).toISOString()
      customerFollows.push({
        id: followIdCounter,
        customerId: customer.id,
        ownerId: faker.helpers.arrayElement(validOwners).id,
        method: faker.helpers.arrayElement(followMethods),
        content: faker.helpers.arrayElement(followContents),
        nextFollowAt: faker.date.soon({ days: 14 }).toISOString(),
        createdAt: fCreatedAt,
        updatedAt: fCreatedAt
      })
      if (!lastFollow || new Date(fCreatedAt) > new Date(lastFollow)) {
        lastFollow = fCreatedAt
      }
    }
    customer.lastFollowAt = lastFollow
    customer.updatedAt = lastFollow || customer.updatedAt
  }

  customers.push(customer)
}

const activeCustomers = customers.filter(c => c.status === 'active')

const OPPORTUNITY_STAGES = [
  { value: 'lead', label: '初步接触', probability: 10, terminal: false },
  { value: 'qualified', label: '需求确认', probability: 30, terminal: false },
  { value: 'proposal', label: '方案报价', probability: 50, terminal: false },
  { value: 'negotiation', label: '合同谈判', probability: 75, terminal: false },
  { value: 'won', label: '已成交', probability: 100, terminal: true },
  { value: 'lost', label: '已流失', probability: 0, terminal: true }
]

const opportunities = []
const opportunityStageRecords = []
let opId = 0
let srId = 0
const nextStepOptions = ['完成需求确认', '准备报价方案', '安排产品演示', '发送合同草案', '跟进客户审批', '预约下次会议']
const stageNoteOptions = ['需求确认完成', '方案已提交客户', '进入合同谈判阶段', '客户意向强烈', '客户决定暂时搁置']

const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

for (const stage of stageOrder) {
  for (let j = 0; j < 8; j++) {
    opId++
    const customer = faker.helpers.arrayElement(customers)
    const owner = faker.helpers.arrayElement(validOwners)
    const cfg = OPPORTUNITY_STAGES.find(s => s.value === stage)
    const amount = faker.number.int({ min: 50000, max: 3000000 })

    const createdAt = faker.date.past({ years: 1 }).toISOString()
    const now = new Date('2026-06-25T12:00:00.000Z')

    let expectedCloseDate = faker.date.soon({ days: 60, refDate: '2026-06-25T12:00:00.000Z' }).toISOString()
    if (!cfg.terminal && j < 3) {
      expectedCloseDate = faker.date.past({ years: 1, refDate: '2026-06-25T12:00:00.000Z' }).toISOString()
    }

    const updatedAt = faker.date.between({ from: new Date(createdAt), to: now }).toISOString()

    const opportunity = {
      id: opId,
      name: faker.commerce.productName() + '项目',
      customerId: customer.id,
      ownerId: owner.id,
      stage,
      amount,
      probability: cfg.probability,
      expectedCloseDate,
      nextStep: cfg.terminal ? '' : faker.helpers.arrayElement(nextStepOptions),
      description: j % 3 === 0 ? faker.helpers.arrayElement(['客户需求明确，决策链条清晰。', '竞争对手报价中，需加快跟进。', '客户对方案认可，正在内部审批。']) : '',
      createdAt,
      updatedAt
    }
    opportunities.push(opportunity)

    srId++
    opportunityStageRecords.push({
      id: srId, opportunityId: opId, fromStage: null, toStage: 'lead',
      changedBy: owner.id, note: '创建商机', changedAt: createdAt
    })

    const idx = stageOrder.indexOf(stage)
    const progression = stageOrder.slice(1, idx + 1)
    for (const nextStage of progression) {
      if (stage === 'lost' && nextStage === 'lost') break
      const from = progression.indexOf(nextStage) >= 0
        ? stageOrder[stageOrder.indexOf(nextStage) - 1]
        : null
      if (!from) continue

      srId++
      const record = {
        id: srId, opportunityId: opId, fromStage: from, toStage: nextStage,
        changedBy: faker.helpers.arrayElement(validOwners).id,
        note: nextStage === 'lost' ? faker.helpers.arrayElement(stageNoteOptions) : faker.helpers.arrayElement(stageNoteOptions),
        changedAt: faker.date.between({ from: new Date(createdAt), to: new Date(updatedAt) }).toISOString()
      }
      if (nextStage === 'lost') record.note = '客户决定暂时搁置'
      opportunityStageRecords.push(record)
    }
  }
}

const contractStatuses = ['draft', 'signed', 'executing', 'completed', 'terminated']
const contracts = Array.from({ length: 25 }, (_, i) => {
  const customer = faker.helpers.arrayElement(customers)
  const opportunity = faker.helpers.arrayElement(opportunities)
  const owner = faker.helpers.arrayElement(validOwners)
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

const ticketStatuses = ['pending', 'processing', 'resolved', 'closed']
const ticketPriorities = ['low', 'medium', 'high', 'urgent']
const tickets = Array.from({ length: 30 }, (_, i) => {
  const customer = faker.helpers.arrayElement(customers)
  const supportUsers = activeUsers.filter(u => u.role === 'support' || u.role === 'admin')
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

export function generateSeedData() {
  faker.seed(2026)
  return {
    version: 6,
    seed: 2026,
    generatedAt: new Date().toISOString(),
    users: allUsers,
    roles,
    menus,
    sessions: [],
    customers,
    opportunities,
    opportunityStageRecords,
    contracts,
    tickets,
    todos,
    follows: customerFollows
  }
}
