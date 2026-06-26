<template>
  <div class="module-placeholder">
    <h2>{{ route.meta.title }}</h2>
    <el-empty :description="`${route.meta.title}模块正在开发中，敬请期待`" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.module-placeholder h2 {
  margin: 0 0 20px;
  font-size: 20px;
  color: $text-primary;
}
</style>