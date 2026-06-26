import { generateSeedData } from './seed'

const STORAGE_KEY = 'nexus-crm-mock-data'
// 当前数据版本，用于检测 localStorage 中是否存在旧版本数据
// 版本升级时旧数据会自动重置，避免字段不匹配导致登录失败
const CURRENT_VERSION = 6

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      // 检查数据版本，如果版本不匹配则重置
      if (data.version === CURRENT_VERSION) {
        return data
      }
      console.log(`[MSW] 数据版本从 ${data.version || 1} 升级到 ${CURRENT_VERSION}，重置数据`)
    }
  } catch (e) {
    console.error('[MSW] 读取存储数据失败:', e)
  }
  return null
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('[MSW] 保存数据失败:', e)
  }
}

let mockData = loadFromStorage()

if (!mockData) {
  mockData = generateSeedData()
  saveToStorage(mockData)
}

export function read() {
  return mockData
}

export function write(data) {
  mockData = data
  saveToStorage(mockData)
  return mockData
}

export function update(fn) {
  mockData = fn(mockData)
  saveToStorage(mockData)
  return mockData
}

export function reset() {
  mockData = generateSeedData()
  saveToStorage(mockData)
  return mockData
}