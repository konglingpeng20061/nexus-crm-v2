<template>
  <div class="login-view">
    <div class="login-card">
      <h1 class="login-title">NexusCRM</h1>
      <p class="login-desc">企业级客户关系管理系统</p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入账号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-demo-accounts">
        <p class="demo-title">演示账号</p>
        <el-table :data="demoAccounts" size="small" stripe>
          <el-table-column prop="username" label="账号" width="90" />
          <el-table-column prop="password" label="密码" width="130" />
          <el-table-column prop="roleName" label="角色" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const demoAccounts = [
  { username: 'admin', password: 'Admin@2026', roleName: '超级管理员' },
  { username: 'manager', password: 'Manager@2026', roleName: '销售经理' },
  { username: 'sales', password: 'Sales@2026', roleName: '销售代表' },
  { username: 'support', password: 'Support@2026', roleName: '客服专员' },
  { username: 'viewer', password: 'Viewer@2026', roleName: '访客' }
]

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login({
      username: form.username,
      password: form.password
    })
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (error) {
    // 错误已由响应拦截器统一提示，这里清空密码并保留账号
    form.password = ''
    console.error('[Login] 登录失败:', error)
  } finally {
    loading.value = false
  }
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
  padding: 40px;
  width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.login-title {
  margin: 0 0 4px;
  font-size: 28px;
  color: $primary-color;
  text-align: center;
}

.login-desc {
  margin: 0 0 24px;
  color: #999;
  font-size: 14px;
  text-align: center;
}

.login-demo-accounts {
  margin-top: 24px;
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.demo-title {
  margin: 0 0 8px;
  font-size: 13px;
  color: #999;
  text-align: center;
}
</style>