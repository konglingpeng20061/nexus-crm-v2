import request from './request'

export function getDashboardSummary(params) {
  return request.get('/dashboard/summary', { params })
}

export function getDashboardCustomerOptions(params) {
  return request.get('/dashboard/customers', { params })
}

export function getTodos(params) {
  return request.get('/dashboard/todos', { params })
}

export function createTodo(data) {
  return request.post('/dashboard/todos', data)
}

export function updateTodo(id, data) {
  return request.put(`/dashboard/todos/${id}`, data)
}

export function deleteTodo(id) {
  return request.delete(`/dashboard/todos/${id}`)
}

export function getRecentFollows(params) {
  return request.get('/dashboard/recent-follows', { params })
}

export function createFollow(data) {
  return request.post('/dashboard/recent-follows', data)
}

export function updateFollow(id, data) {
  return request.put(`/dashboard/recent-follows/${id}`, data)
}

export function getSalesFunnel(params) {
  return request.get('/dashboard/charts/sales-funnel', { params })
}

export function getContractTrend(params) {
  return request.get('/dashboard/charts/contract-trend', { params })
}

export function getTicketStatusDistribution(params) {
  return request.get('/dashboard/charts/ticket-status', { params })
}
