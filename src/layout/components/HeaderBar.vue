<template>
  <header class="header-bar">
    <div class="header-left">
      <el-button text @click="appStore.toggleSidebar">
        <el-icon :size="20">
          <Fold v-if="!appStore.sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </el-button>
    </div>
    <div class="header-center">
      <span class="header-title">NexusCRM 管理系统</span>
    </div>
    <div class="header-right">
      <el-tag size="small" effect="plain" class="env-tag">开发环境</el-tag>
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="header-user">
          <span class="user-avatar">{{ userStore.user?.name?.charAt(0) || '?' }}</span>
          {{ userStore.user?.name || '未登录' }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              {{ userStore.user?.roleName }} | {{ userStore.user?.username }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/index'
import { useUserStore } from '@/stores/user'
import { Fold, Expand, ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

async function handleCommand(command) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
    await userStore.logout()
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.header-bar {
  height: $top-bar-height;
  background: $bg-surface;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 99;
  gap: 12px;
}

.header-left {
  flex: 0 0 auto;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  letter-spacing: 0.02em;
  background: $accent-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.env-tag {
  background: rgba(99, 102, 241, 0.08) !important;
  border-color: rgba(99, 102, 241, 0.2) !important;
  color: $primary-color !important;
  font-weight: 500;
}

.header-user {
  font-size: 14px;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: $accent-gradient;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
