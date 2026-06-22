<template>
  <div class="login-view">
    <div class="login-card">
      <h1 class="login-title">NexusCRM</h1>
      <p class="login-desc">企业级客户关系管理系统</p>
      <el-button type="primary" size="large" @click="handleLogin" style="width: 100%">
        进入工作台
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function handleLogin() {
  router.push('/dashboard')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 48px 40px;
  width: 400px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.login-title {
  margin: 0 0 8px;
  font-size: 28px;
  color: $primary-color;
}

.login-desc {
  margin: 0 0 32px;
  color: #999;
  font-size: 14px;
}
</style>