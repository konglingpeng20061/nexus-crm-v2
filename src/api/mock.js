import request from './request'

export function getMockHealth() {
  return request.get('/health')
}

export function resetMockData() {
  return request.post('/mock/reset')
}