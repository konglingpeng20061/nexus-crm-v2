<template>
  <div class="api-docs-view">
    <h2>接口文档</h2>
    <p class="api-docs-desc">以下为当前可用的模拟接口，点击"发送请求"可在线调试。</p>

    <div class="api-list">
      <div v-for="api in apiList" :key="api.path" class="page-card api-item">
        <div class="api-header">
          <el-tag :type="methodTag(api.method)" size="small">{{ api.method }}</el-tag>
          <span class="api-path">{{ api.path }}</span>
          <span class="api-desc">{{ api.desc }}</span>
        </div>
        <div class="api-action">
          <el-button
            type="primary"
            size="small"
            :loading="api.loading"
            @click="sendRequest(api)"
          >
            发送请求
          </el-button>
        </div>
        <div v-if="api.result !== null" class="api-result">
          <div class="result-meta">
            <span>状态码: <el-tag :type="api.statusCode === 200 ? 'success' : 'danger'" size="small">{{ api.statusCode }}</el-tag></span>
            <span>耗时: {{ api.duration }}ms</span>
          </div>
          <pre class="result-json">{{ JSON.stringify(api.result, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { getMockHealth, resetMockData } from '@/api/mock'

const apiList = reactive([
  {
    method: 'GET',
    path: '/api/health',
    desc: '获取模拟服务状态和数据版本',
    requestFn: getMockHealth,
    loading: false,
    result: null,
    statusCode: null,
    duration: 0
  },
  {
    method: 'POST',
    path: '/api/mock/reset',
    desc: '重置模拟数据',
    requestFn: resetMockData,
    loading: false,
    result: null,
    statusCode: null,
    duration: 0
  }
])

function methodTag(method) {
  const map = { GET: 'success', POST: 'warning', PUT: 'primary', DELETE: 'danger' }
  return map[method] || 'info'
}

async function sendRequest(api) {
  api.loading = true
  const start = Date.now()
  try {
    const res = await api.requestFn()
    api.statusCode = res.status
    api.result = res.data
  } catch (err) {
    api.statusCode = err.response?.status || 0
    api.result = err.response?.data || { error: err.message }
  } finally {
    api.duration = Date.now() - start
    api.loading = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.api-docs-view h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: $text-primary;
}

.api-docs-desc {
  color: $text-secondary;
  margin: 0 0 20px;
}

.api-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.api-item {
  padding: 20px;
}

.api-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.api-path {
  font-family: monospace;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.api-desc {
  color: $text-secondary;
  font-size: 13px;
}

.api-action {
  margin-bottom: 12px;
}

.api-result {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 12px;
}

.result-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
  font-size: 13px;
  color: $text-secondary;
}

.result-json {
  margin: 0;
  background: rgba(0, 0, 0, 0.25);
  color: $text-primary;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}
</style>
