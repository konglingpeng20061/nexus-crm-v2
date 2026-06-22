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
      <el-tag type="warning" size="small">开发环境</el-tag>
      <span class="header-user">管理员</span>
    </div>
  </header>
</template>

<script setup>
import { useAppStore } from '@/stores/index'
import { Fold, Expand } from '@element-plus/icons-vue'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.header-bar {
  height: $top-bar-height;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 99;
}

.header-left {
  flex: 0 0 auto;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.header-user {
  font-size: 14px;
  color: #666;
}
</style>