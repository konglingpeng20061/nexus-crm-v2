import { generateSeedData } from './seed'

const STORAGE_KEY = 'nexus-crm-mock-data'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    // ignore
  }
  return null
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // ignore
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

export function reset() {
  mockData = generateSeedData()
  saveToStorage(mockData)
  return mockData
}