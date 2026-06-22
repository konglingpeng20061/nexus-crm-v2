<template>
  <div class="error-view">
    <div class="page-card error-card">
      <h1>403</h1>
      <p>抱歉，您没有权限访问此页面</p>
      <el-button type="primary" @click="$router.push('/dashboard')">返回首页</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.error-card {
  text-align: center;
  padding: 48px;
}

.error-card h1 {
  font-size: 72px;
  margin: 0;
  color: #e6a23c;
}

.error-card p {
  margin: 16px 0 24px;
  color: #999;
  font-size: 16px;
}
</style>