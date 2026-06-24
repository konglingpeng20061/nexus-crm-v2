<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <el-breadcrumb-item :to="{ path: '/' }">NexusCRM</el-breadcrumb-item>
    <el-breadcrumb-item v-if="route.meta.title">
      {{ route.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.app-breadcrumb {
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: $text-secondary;

      &.is-link {
        color: $text-secondary;

        &:hover {
          color: $primary-color;
        }
      }
    }

    &:last-child .el-breadcrumb__inner {
      color: $text-primary;
    }
  }

  :deep(.el-breadcrumb__separator) {
    color: $text-muted;
  }
}
</style>
