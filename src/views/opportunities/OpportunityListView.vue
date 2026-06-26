<template>
  <div class="opportunity-list-view">
    <div class="header">
      <h2>商机管理</h2>
      <div class="header-actions">
        <el-button @click="$router.push('/opportunities/board')">
          销售看板
        </el-button>
        <el-button v-if="userStore.hasPermission('opportunity:create')" type="primary" :icon="Plus" @click="openCreate">
          新增商机
        </el-button>
      </div>
    </div>

    <div v-if="errorMessage" class="error-card">
      <el-alert :title="errorMessage" type="error" show-icon :closable="false">
        <template #default>
          <el-button type="primary" link @click="loadAll">重新加载</el-button>
        </template>
      </el-alert>
    </div>

    <template v-if="!errorMessage">
      <div class="stats-row">
        <div class="stat-card" v-loading="statsLoading">
          <div class="stat-label">商机总数</div>
          <div class="stat-value">{{ statistics.totalCount ?? '-' }}</div>
        </div>
        <div class="stat-card" v-loading="statsLoading">
          <div class="stat-label">预计总金额</div>
          <div class="stat-value">{{ formatCurrency(statistics.totalAmount) }}</div>
        </div>
        <div class="stat-card" v-loading="statsLoading">
          <div class="stat-label">已成交金额</div>
          <div class="stat-value won">{{ formatCurrency(statistics.wonAmount) }}</div>
        </div>
        <div class="stat-card" v-loading="statsLoading">
          <div class="stat-label">平均成功概率</div>
          <div class="stat-value">{{ statistics.averageProbability ?? 0 }}%</div>
        </div>
        <div class="stat-card" v-loading="statsLoading">
          <div class="stat-label">逾期商机</div>
          <div class="stat-value overdue" :class="{ 'has-overdue': statistics.overdueCount > 0 }">
            {{ statistics.overdueCount ?? 0 }}
          </div>
        </div>
      </div>

      <div class="filter-card">
        <el-form :model="filters" label-width="auto" size="default" class="filter-form">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="关键词">
                <el-input v-model="filters.keyword" placeholder="商机名称/客户名称" clearable @clear="handleSearch" @keyup.enter="handleSearch" />
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="8" :lg="4">
              <el-form-item label="阶段">
                <el-select v-model="filters.stage" placeholder="全部阶段" clearable @change="handleSearch" style="width:100%">
                  <el-option v-for="s in stageOptions" :key="s.value" :label="s.label" :value="s.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="8" :lg="4">
              <el-form-item label="负责人">
                <el-select v-model="filters.ownerId" placeholder="全部负责人" clearable @change="handleSearch" style="width:100%">
                  <el-option v-for="item in ownerOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="8" :lg="5">
              <el-form-item label="日期起">
                <el-date-picker v-model="filters.expectedCloseStart" type="date" placeholder="开始日期" clearable @change="handleSearch" style="width:100%" value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>
            <el-col :xs="12" :sm="12" :md="8" :lg="5">
              <el-form-item label="日期止">
                <el-date-picker v-model="filters.expectedCloseEnd" type="date" placeholder="结束日期" clearable @change="handleSearch" style="width:100%" value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="2">
              <el-form-item label-width="0">
                <el-button type="primary" :icon="Search" @click="handleSearch" :loading="loading">查询</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="table-card">
        <el-table :data="opportunities" v-loading="loading" stripe style="width:100%" empty-text=" ">
          <el-table-column label="商机名称" min-width="160" fixed>
            <template #default="{ row }">
              <el-link type="primary" :underline="false" @click="$router.push(`/opportunities/${row.id}`)">
                {{ row.name }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="客户名称" min-width="130" prop="customerName" />
          <el-table-column label="阶段" width="100">
            <template #default="{ row }">
              <el-tag :type="stageTagType(row.stage)" size="small">{{ stageLabel(row.stage) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="预计金额" width="130" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column label="成功概率" width="90" align="center">
            <template #default="{ row }">
              {{ row.probability }}%
            </template>
          </el-table-column>
          <el-table-column label="负责人" width="80" prop="ownerName" />
          <el-table-column label="预计成交日" width="110">
            <template #default="{ row }">
              <span :class="{ 'text-overdue': row.overdue }">{{ formatDate(row.expectedCloseDate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="下一步" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="text-muted">{{ row.nextStep || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="$router.push(`/opportunities/${row.id}`)">详情</el-button>
              <el-button v-if="userStore.hasPermission('opportunity:edit')" type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
              <el-button v-if="userStore.hasPermission('opportunity:delete')" type="danger" link size="small" @click="handleDelete(row)" :loading="deletingId === row.id">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div v-if="!loading" class="empty-state">
              <el-empty :description="hasFilters ? '没有符合条件的商机' : '暂无商机数据'" />
            </div>
          </template>
        </el-table>

        <div class="pagination-wrap" v-if="total > 0">
          <el-pagination
            v-model:page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next"
            @size-change="onPageSizeChange"
            @current-change="onPageChange"
            background
          />
        </div>
      </div>
    </template>

    <OpportunityFormDialog
      v-model="editorVisible"
      :opportunity="editingOpportunity"
      :saving="saving"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePagination } from '@/composables/usePagination'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOpportunities, getOpportunityStatistics, createOpportunity, updateOpportunity, deleteOpportunity } from '@/api/opportunity'
import { getCustomerFilterOptions } from '@/api/customer'
import { formatCurrency, formatDate } from '@/utils/format'
import OpportunityFormDialog from './components/OpportunityFormDialog.vue'

const stageOptions = [
  { value: 'lead', label: '初步接触', probability: 10, terminal: false },
  { value: 'qualified', label: '需求确认', probability: 30, terminal: false },
  { value: 'proposal', label: '方案报价', probability: 50, terminal: false },
  { value: 'negotiation', label: '合同谈判', probability: 75, terminal: false },
  { value: 'won', label: '已成交', probability: 100, terminal: true },
  { value: 'lost', label: '已流失', probability: 0, terminal: true }
]

const stageMap = Object.fromEntries(stageOptions.map(s => [s.value, s]))

function stageLabel(v) { return stageMap[v]?.label || v }
function stageTagType(v) {
  if (v === 'won') return 'success'
  if (v === 'lost') return 'danger'
  if (v === 'negotiation') return 'warning'
  if (v === 'proposal') return 'primary'
  return 'info'
}

const userStore = useUserStore()
const pagination = usePagination(10)

const opportunities = ref([])
const loading = ref(false)
const errorMessage = ref('')

const statistics = ref({})
const statsLoading = ref(false)
const statsError = ref(false)

const filters = reactive({
  keyword: '',
  stage: '',
  ownerId: '',
  expectedCloseStart: '',
  expectedCloseEnd: ''
})

const ownerOptions = ref([])

const editorVisible = ref(false)
const editingOpportunity = ref(null)
const saving = ref(false)
const deletingId = ref(null)

const hasFilters = computed(() =>
  filters.keyword || filters.stage || filters.ownerId || filters.expectedCloseStart || filters.expectedCloseEnd
)

let requestSeq = 0

function buildParams() {
  const params = {
    page: pagination.page.value,
    pageSize: pagination.pageSize.value
  }
  for (const [k, v] of Object.entries(filters)) {
    if (v !== '' && v !== null && v !== undefined) {
      params[k] = v
    }
  }
  return params
}

async function loadData() {
  const seq = ++requestSeq
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await getOpportunities(buildParams())
    if (seq !== requestSeq) return
    opportunities.value = result.list || []
    pagination.setTotal(result.total || 0)
  } catch (e) {
    if (seq !== requestSeq) return
    opportunities.value = []
    pagination.setTotal(0)
    errorMessage.value = e?.message || '加载商机列表失败'
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

async function loadStats() {
  const seq = ++requestSeq
  statsLoading.value = true
  statsError.value = false
  try {
    const result = await getOpportunityStatistics(buildParams())
    if (seq !== requestSeq) return
    statistics.value = result || {}
  } catch {
    if (seq !== requestSeq) return
    statistics.value = {}
    statsError.value = true
  } finally {
    if (seq === requestSeq) statsLoading.value = false
  }
}

async function loadAll() {
  requestSeq++
  errorMessage.value = ''
  try {
    const params = buildParams()
    const [listResult, statsResult] = await Promise.all([
      getOpportunities(params),
      getOpportunityStatistics(params)
    ])
    opportunities.value = listResult.list || []
    pagination.setTotal(listResult.total || 0)
    statistics.value = statsResult || {}
  } catch (e) {
    opportunities.value = []
    pagination.setTotal(0)
    statistics.value = {}
    errorMessage.value = e?.message || '加载商机数据失败'
  }
}

async function loadFilterOptions() {
  try {
    const opts = await getCustomerFilterOptions()
    ownerOptions.value = opts.owners || []
  } catch {
    // ignore
  }
}

function handleSearch() {
  pagination.resetPage()
  loadAll()
}

function onPageChange(val) {
  pagination.changePage(val)
  loadAll()
}

function onPageSizeChange(val) {
  pagination.changePageSize(val)
  loadAll()
}

function openCreate() {
  editingOpportunity.value = null
  editorVisible.value = true
}

function openEdit(row) {
  editingOpportunity.value = { ...row }
  editorVisible.value = true
}

async function handleSave(formData) {
  saving.value = true
  try {
    if (editingOpportunity.value) {
      await updateOpportunity(editingOpportunity.value.id, formData)
    } else {
      await createOpportunity(formData)
    }
    ElMessage.success('保存成功')
    editorVisible.value = false
    if (!editingOpportunity.value) pagination.resetPage()
    await loadAll()
  } catch {
    // keep dialog open
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除商机「${row.name}」吗？此操作不可恢复。`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }

  deletingId.value = row.id
  try {
    await deleteOpportunity(row.id)
    ElMessage.success('删除成功')
    if (opportunities.value.length === 1 && pagination.page.value > 1) {
      pagination.changePage(pagination.page.value - 1)
    }
    await loadAll()
  } catch {
    // error handled by interceptor
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  Promise.all([loadFilterOptions(), loadAll()])
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.opportunity-list-view {
  padding-bottom: 32px;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: $text-primary;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 130px;
  background: $bg-card;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: $glass-border;
  border-radius: $border-radius;
  padding: 14px 16px;
  box-shadow: $shadow-sm;
  text-align: center;
  min-height: 72px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: $accent-gradient;
    opacity: 0.4;
  }

  .stat-label {
    font-size: 12px;
    color: $text-muted;
    margin-bottom: 6px;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: $text-primary;

    &.won {
      color: $success-color;
    }

    &.overdue.has-overdue {
      color: $danger-color;
    }
  }
}

.filter-card {
  background: $bg-card;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: $glass-border;
  border-radius: $border-radius;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: $shadow-sm;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: $accent-gradient;
    opacity: 0.5;
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.table-card {
  background: $bg-card;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: $glass-border;
  border-radius: $border-radius;
  padding: 0;
  overflow: hidden;
  box-shadow: $shadow-md;

  :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: transparent;
    --el-table-border-color: $border-color;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
}

.text-muted {
  color: $text-muted;
  font-size: 12px;
}

.text-overdue {
  color: $danger-color;
  font-weight: 600;
}

.error-card {
  margin-bottom: 16px;
}

.empty-state {
  padding: 40px 0;
}

@media (max-width: 700px) {
  .filter-form {
    :deep(.el-form-item) {
      margin-bottom: 8px;
    }
  }

  .stats-row {
    .stat-card {
      min-width: calc(50% - 6px);
    }
  }

  :deep(.el-table) {
    overflow-x: auto;
  }
}
</style>
