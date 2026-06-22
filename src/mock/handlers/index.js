import { http, HttpResponse } from 'msw'
import { read, reset } from '../database/store'

export const handlers = [
  // GET /api/health - 健康检查
  http.get('/api/health', () => {
    const data = read()
    return HttpResponse.json({
      code: 0,
      message: '操作成功',
      data: {
        status: 'healthy',
        version: data.version,
        seed: data.seed,
        users: data.users.length,
        generatedAt: data.generatedAt
      }
    })
  }),

  // POST /api/mock/reset - 重置数据
  http.post('/api/mock/reset', () => {
    const data = reset()
    return HttpResponse.json({
      code: 0,
      message: '模拟数据已重置',
      data: {
        version: data.version,
        seed: data.seed,
        users: data.users.length,
        generatedAt: data.generatedAt
      }
    })
  }),

  // GET /api/mock/error - 模拟 500 异常
  http.get('/api/mock/error', () => {
    return HttpResponse.json({
      code: 500,
      message: '服务器内部错误',
      data: null
    }, { status: 500 })
  }),

  // ALL /api/* - 模拟 404
  http.all('/api/*', ({ request }) => {
    return HttpResponse.json({
      code: 404,
      message: `接口 ${request.method} ${new URL(request.url).pathname} 不存在`,
      data: null
    }, { status: 404 })
  })
]