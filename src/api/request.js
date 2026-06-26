import axios from 'axios'
import { getToken, clearAuthStorage } from '@/utils/storage'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    if (response.config.__fullResponse) {
      return response
    }
    const res = response.data
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  error => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        clearAuthStorage()
        ElMessage.error('登录已过期，请重新登录')
        window.location.href = '/login'
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else {
        ElMessage.error(error.response.data?.message || `请求失败（状态码：${status}）`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应，通常是 MSW 未启动或网络异常
      ElMessage.error('服务器未响应，请刷新页面后重试')
    } else {
      ElMessage.error(error.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default request