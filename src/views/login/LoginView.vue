<template>
  <div class="login-view">
    <div class="login-backdrop">
      <div class="login-shape login-shape--1" />
      <div class="login-shape login-shape--2" />
      <div class="login-shape login-shape--3" />
    </div>

    <div class="login-card">
      <div class="login-brand">
        <div class="login-brand__mark">N</div>
        <div>
          <h1 class="login-brand__title">NexusCRM</h1>
          <p class="login-brand__desc">企业级客户关系管理系统</p>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="login-form"
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
        <el-form-item class="login-form__submit">
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-demo-accounts">
        <p class="login-demo-accounts__title">演示账号</p>
        <div class="login-demo-accounts__list">
          <div
            v-for="account in demoAccounts"
            :key="account.username"
            class="demo-account"
            @click="fillAccount(account)"
          >
            <span class="demo-account__role">{{ account.roleName }}</span>
            <span class="demo-account__credential">{{ account.username }}</span>
          </div>
        </div>
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

function fillAccount(account) {
  form.username = account.username
  form.password = account.password
}

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

    let redirect = route.query.redirect || '/dashboard'
    if (Array.isArray(redirect)) {
      redirect = redirect[0]
    }
    const safeRedirect = typeof redirect === 'string' && redirect.startsWith('/login')
      ? '/dashboard'
      : redirect

    await router.push(safeRedirect)
  } catch (error) {
    form.password = ''
    console.error('[Login] 登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  position: relative;
  overflow: hidden;
}

.login-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.login-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  animation: float 12s ease-in-out infinite;

  &--1 {
    width: 480px;
    height: 480px;
    background: #3b82f6;
    top: -120px;
    right: -80px;
    animation-delay: 0s;
  }

  &--2 {
    width: 360px;
    height: 360px;
    background: #06b6d4;
    bottom: -80px;
    left: -60px;
    animation-delay: -4s;
  }

  &--3 {
    width: 280px;
    height: 280px;
    background: #f59e0b;
    top: 40%;
    left: 35%;
    opacity: 0.2;
    animation-delay: -8s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, -20px) scale(1.05);
  }
}

.login-card {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 16px;
  padding: 40px;
  width: 420px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  animation: card-enter 0.6s ease both;
  backdrop-filter: blur(12px);
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;

  &__mark {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }

  &__title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #1d2129;
    letter-spacing: -0.02em;
  }

  &__desc {
    margin: 4px 0 0;
    color: #606266;
    font-size: 13px;
  }
}

.login-form {
  &__submit {
    margin-top: 8px;

    :deep(.el-form-item__content) {
      display: block;
    }

    .el-button {
      width: 100%;
      height: 44px;
      font-size: 15px;
      font-weight: 500;
    }
  }
}

.login-demo-accounts {
  margin-top: 28px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;

  &__title {
    margin: 0 0 12px;
    font-size: 12px;
    color: #909399;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}

.demo-account {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #eef1f6;
    transform: translateY(-2px);
  }

  &__role {
    display: block;
    font-size: 12px;
    color: #606266;
    margin-bottom: 4px;
  }

  &__credential {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
