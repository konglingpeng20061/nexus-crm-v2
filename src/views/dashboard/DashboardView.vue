<template>
  <div class="dashboard-view">
    <div class="dashboard-view__header">
      <h2>首页工作台</h2>
      <div class="dashboard-view__actions">
        <el-button :icon="Refresh" :loading="summaryLoading || chartsLoading" @click="refreshAll">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 指标卡 -->
    <el-row :gutter="16" class="metric-row">
      <el-col :xs="24" :sm="12" :md="8" :lg="4" v-for="card in metricCards" :key="card.label">
        <MetricCard
          :label="card.label"
          :value="card.value"
          :description="card.description"
          :tone="card.tone"
        />
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>快捷操作</h3>
      <el-space wrap>
        <el-button
          v-if="userStore.hasPermission('customer:create')"
          type="primary"
          :icon="Plus"
          @click="$router.push('/customers')"
        >
          新建客户
        </el-button>
        <el-button
          v-if="userStore.hasPermission('opportunity:create')"
          type="success"
          :icon="TrendCharts"
          @click="$router.push('/opportunities')"
        >
          新建商机
        </el-button>
        <el-button
          v-if="userStore.hasPermission('contract:approve')"
          type="warning"
          :icon="DocumentChecked"
          @click="$router.push('/contracts')"
        >
          审批合同
        </el-button>
        <el-button
          v-if="userStore.hasPermission('ticket:handle')"
          type="danger"
          :icon="Tickets"
          @click="$router.push('/tickets')"
        >
          处理工单
        </el-button>
      </el-space>
    </div>

    <!-- 图表区 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12" class="chart-col">
        <div class="chart-card">
          <ContractTrendChart
            :data="contractTrend"
            :loading="chartsLoading"
            :empty="chartsEmpty.contractTrend"
          />
          <div v-if="chartsError" class="chart-error">
            <el-alert :title="chartsError" type="error" show-icon :closable="false">
              <el-button type="primary" link @click="loadCharts">重试</el-button>
            </el-alert>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" class="chart-col">
            <div class="chart-card">
              <SalesFunnelChart
                :data="salesFunnel"
                :loading="chartsLoading"
                :empty="chartsEmpty.salesFunnel"
              />
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" class="chart-col">
            <div class="chart-card">
              <TicketStatusChart
                :data="ticketStatus"
                :loading="chartsLoading"
                :empty="chartsEmpty.ticketStatus"
              />
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- 待办与跟进 -->
    <el-row :gutter="16" class="activity-row">
      <el-col :xs="24" :lg="12" class="activity-col">
        <TodoList
          :items="todos"
          :loading="todosLoading"
          :error="todosError"
          @add="openTodoDialog()"
          @edit="openTodoDialog"
          @delete="handleDeleteTodo"
          @toggle-status="handleToggleTodo"
          @refresh="loadTodos"
        />
      </el-col>
      <el-col :xs="24" :lg="12" class="activity-col">
        <RecentFollowList
          :items="follows"
          :loading="followsLoading"
          :error="followsError"
          @add="openFollowDialog()"
          @edit="openFollowDialog"
          @refresh="loadFollows"
        />
      </el-col>
    </el-row>

    <!-- 表单弹窗 -->
    <ActivityFormDialog
      v-model="dialogVisible"
      :type="dialogType"
      :data="dialogData"
      :customers="customerOptions"
      @save="handleSaveActivity"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { Plus, TrendCharts, DocumentChecked, Tickets, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MetricCard from './components/MetricCard.vue'
import TodoList from './components/TodoList.vue'
import RecentFollowList from './components/RecentFollowList.vue'
import ActivityFormDialog from './components/ActivityFormDialog.vue'
import SalesFunnelChart from './components/SalesFunnelChart.vue'
import ContractTrendChart from './components/ContractTrendChart.vue'
import TicketStatusChart from './components/TicketStatusChart.vue'
import {
  getDashboardSummary,
  getDashboardCustomerOptions,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getRecentFollows,
  createFollow,
  updateFollow,
  getSalesFunnel,
  getContractTrend,
  getTicketStatusDistribution
} from '@/api/dashboard'
import { formatNumber, formatCurrency } from '@/utils/format'

const userStore = useUserStore()

// Summary
const summary = ref({})
const summaryLoading = ref(false)
const summaryError = ref('')

const metricCards = computed(() => [
  {
    label: '客户总数',
    value: formatNumber(summary.value.customerCount),
    description: '全部客户',
    tone: 'primary'
  },
  {
    label: '活跃客户',
    value: formatNumber(summary.value.activeCustomerCount),
    description: '状态为活跃',
    tone: 'success'
  },
  {
    label: '活跃商机',
    value: formatNumber(summary.value.activeOpportunityCount),
    description: '跟进中商机',
    tone: 'warning'
  },
  {
    label: '商机预计金额',
    value: formatCurrency(summary.value.opportunityAmount),
    description: '活跃商机合计',
    tone: 'danger'
  },
  {
    label: '累计合同金额',
    value: formatCurrency(summary.value.contractAmount),
    description: '非终止合同',
    tone: 'info'
  },
  {
    label: '待处理工单',
    value: formatNumber(summary.value.pendingTicketCount),
    description: '待处理/处理中',
    tone: 'danger'
  }
])

async function loadSummary() {
  summaryLoading.value = true
  summaryError.value = ''
  try {
    summary.value = await getDashboardSummary()
  } catch (e) {
    summaryError.value = e?.message || '加载指标失败'
  } finally {
    summaryLoading.value = false
  }
}

// Customer options
const customerOptions = ref([])

async function loadCustomers() {
  try {
    customerOptions.value = await getDashboardCustomerOptions()
  } catch (e) {
    console.error('加载客户选项失败', e)
  }
}

// Todos
const todos = ref([])
const todosLoading = ref(false)
const todosError = ref('')

async function loadTodos() {
  todosLoading.value = true
  todosError.value = ''
  try {
    todos.value = await getTodos()
  } catch (e) {
    todosError.value = e?.message || '加载待办失败'
  } finally {
    todosLoading.value = false
  }
}

async function handleToggleTodo(item) {
  try {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed'
    await updateTodo(item.id, { status: nextStatus })
    ElMessage.success(nextStatus === 'completed' ? '待办已完成' : '待办已重新打开')
    await loadTodos()
  } catch (e) {
    console.error(e)
  }
}

async function handleDeleteTodo(item) {
  try {
    await ElMessageBox.confirm('确定删除该待办吗？', '提示', { type: 'warning' })
    await deleteTodo(item.id)
    ElMessage.success('删除成功')
    await loadTodos()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

// Follows
const follows = ref([])
const followsLoading = ref(false)
const followsError = ref('')

async function loadFollows() {
  followsLoading.value = true
  followsError.value = ''
  try {
    follows.value = await getRecentFollows()
  } catch (e) {
    followsError.value = e?.message || '加载跟进失败'
  } finally {
    followsLoading.value = false
  }
}

// Dialog
const dialogVisible = ref(false)
const dialogType = ref('todo')
const dialogData = ref(null)

function openTodoDialog(item = null) {
  dialogType.value = 'todo'
  dialogData.value = item
  dialogVisible.value = true
}

function openFollowDialog(item = null) {
  dialogType.value = 'follow'
  dialogData.value = item
  dialogVisible.value = true
}

async function handleSaveActivity({ id, type, data }) {
  try {
    if (type === 'todo') {
      if (id) {
        await updateTodo(id, data)
      } else {
        await createTodo(data)
      }
      await loadTodos()
    } else {
      if (id) {
        await updateFollow(id, data)
      } else {
        await createFollow(data)
      }
      await loadFollows()
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
  } catch (e) {
    console.error(e)
  }
}

// Charts
const salesFunnel = ref([])
const contractTrend = ref([])
const ticketStatus = ref([])
const chartsLoading = ref(false)
const chartsError = ref('')
const chartsEmpty = computed(() => ({
  salesFunnel: !chartsLoading.value && salesFunnel.value.length === 0,
  contractTrend: !chartsLoading.value && contractTrend.value.length === 0,
  ticketStatus: !chartsLoading.value && ticketStatus.value.length === 0
}))

async function loadCharts() {
  chartsLoading.value = true
  chartsError.value = ''
  try {
    const [funnel, trend, status] = await Promise.all([
      getSalesFunnel(),
      getContractTrend(),
      getTicketStatusDistribution()
    ])
    salesFunnel.value = funnel
    contractTrend.value = trend
    ticketStatus.value = status
  } catch (e) {
    chartsError.value = e?.message || '加载图表失败'
  } finally {
    chartsLoading.value = false
  }
}

function refreshAll() {
  loadSummary()
  loadCustomers()
  loadTodos()
  loadFollows()
  loadCharts()
}

onMounted(() => {
  refreshAll()
})
</script>

<style lang="scss" scoped>
.dashboard-view {
  padding-bottom: 24px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

.metric-row {
  margin-bottom: 20px;

  .el-col {
    margin-bottom: 16px;
  }
}

.quick-actions {
  margin-bottom: 24px;

  h3 {
    margin: 0 0 12px;
    font-size: 16px;
  }
}

.chart-row {
  margin-bottom: 16px;

  .chart-col {
    margin-bottom: 16px;
  }
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: relative;
}

.chart-error {
  margin-top: 12px;
}

.activity-row {
  .activity-col {
    margin-bottom: 16px;
  }
}
</style>
