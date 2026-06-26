<template>
  <div class="error-view">
    <div class="page-card error-card">
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="$router.push('/dashboard')">返回首页</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.error-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.error-card {
  text-align: center;
  padding: 48px;
}

.error-card h1 {
  font-size: 72px;
  margin: 0;
  color: $danger-color;
}

.error-card p {
  margin: 16px 0 24px;
  color: $text-secondary;
  font-size: 16px;
}
</style>