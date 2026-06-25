<template>
  <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-bg" />
    <div class="sidebar-inner">
      <div class="sidebar-logo">
        <span class="logo-text">{{ appStore.sidebarCollapsed ? 'N' : 'NexusCRM' }}</span>
      </div>
      <el-menu
        :default-active="currentRoute"
        :collapse="appStore.sidebarCollapsed"
        :router="true"
        background-color="transparent"
        text-color="#94a3b8"
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
          {{ userStore.menus.length }} 个模块
        </span>
      </div>
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
  z-index: 100;
  display: flex;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.collapsed {
    width: 64px;
  }
}

.sidebar-bg {
  position: absolute;
  inset: 0;
  background: $sidebar-bg;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  background-image: radial-gradient(ellipse at 0% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%),
                    radial-gradient(ellipse at 100% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
}

.sidebar-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sidebar-logo {
  height: $top-bar-height;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
}

.logo-text {
  background: $accent-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 20px;
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: -0.02em;
}

.el-menu {
  border-right: none;
  flex: 1;
  padding: 16px 8px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
  }

  :deep(.el-menu-item) {
    margin: 4px 0;
    border-radius: 10px;
    height: 44px;
    line-height: 44px;
    transition: all 0.2s ease;
    font-weight: 450;
    position: relative;

    &:hover {
      background: $sidebar-hover !important;
    }

    &.is-active {
      background: $sidebar-active !important;
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: $accent-gradient;
        border-radius: 0 3px 3px 0;
      }
    }
  }

  :deep(.el-icon) {
    color: inherit;
    font-size: 18px;
  }
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  text-align: center;
  flex-shrink: 0;
}

.footer-text {
  color: $text-muted;
  font-size: 11px;
  letter-spacing: 0.03em;
  opacity: 0.6;
}
</style>
