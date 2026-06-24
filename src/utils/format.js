export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '-'
  const num = Number(value)
  if (Number.isNaN(num)) return '-'
  return new Intl.NumberFormat('zh-CN').format(num)
}

export function formatCurrency(value, options = {}) {
  if (value === null || value === undefined || value === '') return '-'
  const num = Number(value)
  if (Number.isNaN(num)) return '-'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
    ...options
  }).format(num)
}

export function formatDateTime(isoString) {
  if (!isoString) return '-'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDate(isoString) {
  if (!isoString) return '-'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('zh-CN')
}

export function formatWan(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return 0
  return Number((num / 10000).toFixed(2))
}
