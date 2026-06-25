<template>
  <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-logo">
      <span class="logo-text">{{ appStore.sidebarCollapsed ? 'N' : 'NexusCRM' }}</span>
    </div>
    <el-menu
      :default-active="currentRoute"
      :collapse="appStore.sidebarCollapsed"
      :router="true"
      background-color="transparent"
      text-color="#9ca3af"
      active-text-color="#ffffff"
    >
      <template v-for="item in userStore.menus" :key="item.path">
        <el-menu-item :index="item.path">
          <el-icon>
            <component :is="iconMap[item.icon] || Monitor" />
          </el-icon>
          <template #title>
            {{ appStore.sidebarCollapsed ? item.shortLabel : item.title }}
          </template>
        </el-menu-item>
      </template>
    </el-menu>
    <div class="sidebar-footer">
      <span class="footer-text">
        可访问模块: {{ userStore.menus.length }}
      </span>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/index'
import { useUserStore } from '@/stores/user'
import { Monitor, User, TrendCharts, Document, Tickets, Notebook, Key } from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const iconMap = {
  Monitor, User, TrendCharts, Document, Tickets, Notebook, Key
}

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
  background: $sidebar-bg;
  overflow-y: auto;
  transition: width 0.3s;
  z-index: 100;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: 64px;
  }
}

.sidebar-logo {
  height: $top-bar-height;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo-text {
  background: $accent-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
}

.el-menu {
  border-right: none;
  flex: 1;
  padding: 12px 0;

  :deep(.el-menu-item) {
    margin: 4px 12px;
    border-radius: 8px;
    height: 44px;
    line-height: 44px;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    &.is-active {
      background: rgba(59, 130, 246, 0.15);
      font-weight: 500;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 18px;
        background: $accent-gradient;
        border-radius: 0 2px 2px 0;
      }
    }
  }

  :deep(.el-icon) {
    color: inherit;
  }
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}

.footer-text {
  color: $text-muted;
  font-size: 12px;
}
</style>
