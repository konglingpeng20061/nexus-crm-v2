<template>
  <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-logo">
      <span class="logo-text">{{ appStore.sidebarCollapsed ? 'N' : 'NexusCRM' }}</span>
    </div>
    <el-menu
      :default-active="currentRoute"
      :collapse="appStore.sidebarCollapsed"
      :router="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
    >
      <template v-for="item in menuItems" :key="item.path">
        <el-menu-item :index="item.path" :disabled="item.disabled">
          <el-icon><Monitor /></el-icon>
          <template #title>
            {{ appStore.sidebarCollapsed ? item.shortLabel : item.label }}
          </template>
        </el-menu-item>
      </template>
    </el-menu>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/index'
import { menuItems } from '@/router/menu'
import { Monitor } from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()

const currentRoute = computed(() => route.path)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: $sidebar-width;
  background-color: #304156;
  overflow-y: auto;
  transition: width 0.3s;
  z-index: 100;

  &.collapsed {
    width: 64px;
  }
}

.sidebar-logo {
  height: $top-bar-height;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
}

.el-menu {
  border-right: none;
}
</style>