import request from './request'

export function getCustomers(params) {
  return request.get('/customers', { params })
}

export function getCustomer(id) {
  return request.get(`/customers/${id}`)
}

export function getCustomerFilterOptions() {
  return request.get('/customers/options')
}

export function createCustomer(data) {
  return request.post('/customers', data)
}

export function updateCustomer(id, data) {
  return request.put(`/customers/${id}`, data)
}

export function deleteCustomer(id) {
  return request.delete(`/customers/${id}`)
}

export function createCustomerFollow(customerId, data) {
  return request.post(`/customers/${customerId}/follows`, data)
}

export function updateCustomerOwner(customerId, ownerId) {
  return request.put(`/customers/${customerId}/owner`, { ownerId })
}
