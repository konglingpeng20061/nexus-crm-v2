<template>
  <div class="dashboard-view">
    <h2>首页工作台</h2>
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in stats" :key="item.label">
        <div class="page-card stat-card">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const stats = [
  { label: '客户总数', value: '1,286' },
  { label: '本月新增', value: '48' },
  { label: '跟进中', value: '326' },
  { label: '已成交', value: '892' }
]
</script>

<style lang="scss" scoped>
.dashboard-view h2 {
  margin: 0 0 20px;
  font-size: 20px;
}

.stat-card {
  text-align: center;
  padding: 24px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
}

.stat-label {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
}
</style>