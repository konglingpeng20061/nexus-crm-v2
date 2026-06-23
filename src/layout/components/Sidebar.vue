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
  background-color: #304156;
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
  flex: 1;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.footer-text {
  color: #7a8ba6;
  font-size: 12px;
}
</style>