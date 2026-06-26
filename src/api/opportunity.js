import request from './request'

export function getOpportunities(params) {
  return request.get('/opportunities', { params })
}

export function getOpportunityStatistics(params) {
  return request.get('/opportunities/statistics', { params })
}

export function getOpportunity(id) {
  return request.get(`/opportunities/${id}`)
}

export function getOpportunityBoard() {
  return request.get('/opportunities/board')
}

export function createOpportunity(data) {
  return request.post('/opportunities', data)
}

export function updateOpportunity(id, data) {
  return request.put(`/opportunities/${id}`, data)
}

export function deleteOpportunity(id) {
  return request.delete(`/opportunities/${id}`)
}

export function updateOpportunityStage(id, data) {
  return request.patch(`/opportunities/${id}/stage`, data)
}
