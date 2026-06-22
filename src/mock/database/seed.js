import { fakerZH_CN as faker } from '@faker-js/faker'

faker.seed(2026)

export function generateSeedData() {
  faker.seed(2026)

  const users = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    role: faker.helpers.arrayElement(['管理员', '销售经理', '销售代表', '客服', '运营']),
    createdAt: faker.date.between({ from: '2026-01-01', to: '2026-06-01' }).toISOString()
  }))

  return {
    version: 1,
    seed: 2026,
    generatedAt: new Date().toISOString(),
    users
  }
}