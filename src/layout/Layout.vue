<template>
  <div class="layout-shell">
    <Sidebar />
    <div class="app-main" :class="{ collapsed: appStore.sidebarCollapsed }">
      <HeaderBar />
      <div class="content-shell">
        <Breadcrumb />
        <div class="content-view">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/index'
import Sidebar from './components/Sidebar.vue'
import HeaderBar from './components/HeaderBar.vue'
import Breadcrumb from './components/Breadcrumb.vue'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.layout-shell {
  display: flex;
  min-height: 100vh;
  background: $bg-page;
}

.app-main {
  margin-left: $sidebar-width;
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s;
  min-width: 0;

  &.collapsed {
    margin-left: 64px;
  }
}

.content-shell {
  padding: $base-padding;
  flex: 1;
  background: transparent;
}

.content-view {
  margin-top: 16px;
}
</style>
