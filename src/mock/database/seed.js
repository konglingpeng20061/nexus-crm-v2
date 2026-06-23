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

export function generateSeedData() {
  faker.seed(2026)
  return {
    version: 3,
    seed: 2026,
    generatedAt: new Date().toISOString(),
    users: allUsers,
    roles,
    menus,
    sessions: []
  }
}