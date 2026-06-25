<template>
  <div class="customer-list-view">
    <div class="header">
      <h2>客户管理</h2>
      <el-button v-if="userStore.hasPermission('customer:create')" type="primary" :icon="Plus" @click="openCreate">
        新增客户
      </el-button>
    </div>

    <div class="filter-card">
      <el-form :model="filters" label-width="80px" size="default" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="关键词">
              <el-input v-model="filters.keyword" placeholder="客户名称/联系人/手机号" clearable @clear="handleSearch" @keyup.enter="handleSearch" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="8" :lg="4">
            <el-form-item label="行业">
              <el-select v-model="filters.industry" placeholder="全部行业" clearable @change="handleSearch" style="width:100%">
                <el-option v-for="item in filterOptions.industries" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="8" :lg="4">
            <el-form-item label="等级">
              <el-select v-model="filters.level" placeholder="全部等级" clearable @change="handleSearch" style="width:100%">
                <el-option v-for="(label, value) in levelMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="8" :lg="4">
            <el-form-item label="状态">
              <el-select v-model="filters.status" placeholder="全部状态" clearable @change="handleSearch" style="width:100%">
                <el-option v-for="item in filterOptions.statuses" :key="item" :label="statusLabel(item)" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="8" :lg="4">
            <el-form-item label="负责人">
              <el-select v-model="filters.ownerId" placeholder="全部负责人" clearable @change="handleSearch" style="width:100%">
                <el-option v-for="item in filterOptions.owners" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
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

    <div v-if="errorMessage" class="error-card">
      <el-alert :title="errorMessage" type="error" show-icon :closable="false">
        <template #default>
          <el-button type="primary" link @click="loadData">重新加载</el-button>
        </template>
      </el-alert>
    </div>

    <div class="table-card" v-if="!errorMessage">
      <el-table :data="customers" v-loading="loading" stripe style="width:100%" empty-text=" ">
        <el-table-column prop="name" label="客户名称" min-width="140" fixed>
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="$router.push(`/customers/${row.id}`)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="联系人" min-width="100">
          <template #default="{ row }">
            <div>{{ row.contactName }}</div>
            <div class="text-muted">{{ row.contactPhone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="行业" width="80" prop="industry" />
        <el-table-column label="等级" width="80">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)" size="small">{{ levelMap[row.level] || row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="90" prop="ownerName" />
        <el-table-column label="地区" width="120" prop="region" />
        <el-table-column label="最近跟进" width="140">
          <template #default="{ row }">
            <span class="text-muted">{{ row.lastFollowAt ? formatDateTime(row.lastFollowAt) : '暂无跟进' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="$router.push(`/customers/${row.id}`)">详情</el-button>
            <el-button v-if="userStore.hasPermission('customer:edit')" type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="userStore.hasPermission('customer:delete')" type="danger" link size="small" @click="handleDelete(row)" :loading="deletingId === row.id">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div v-if="!loading" class="empty-state">
            <el-empty :description="hasFilters ? '没有符合条件的客户' : '暂无客户数据'" />
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

    <CustomerFormDialog
      v-model="editorVisible"
      :customer="editingCustomer"
      :options="filterOptions"
      :saving="saving"
      :can-assign="userStore.hasPermission('customer:assign')"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePagination } from '@/composables/usePagination'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerFilterOptions } from '@/api/customer'
import { formatDateTime } from '@/utils/format'
import CustomerFormDialog from './components/CustomerFormDialog.vue'

const levelMap = { A: '重点客户', B: '普通客户', C: '潜在客户' }
const statusLabels = { active: '活跃', potential: '潜在', inactive: '停用', at_risk: '即将流失' }

function statusLabel(s) { return statusLabels[s] || s }
function levelTagType(l) { return l === 'A' ? 'danger' : l === 'B' ? 'warning' : 'info' }
function statusTagType(s) {
  return s === 'active' ? 'success' : s === 'potential' ? 'warning' : s === 'at_risk' ? 'danger' : 'info'
}

const userStore = useUserStore()
const pagination = usePagination(10)

const customers = ref([])
const loading = ref(false)
const errorMessage = ref('')
const filterOptions = ref({ industries: [], levels: [], statuses: [], owners: [] })
const filterLoading = ref(false)

const filters = reactive({
  keyword: '',
  industry: '',
  level: '',
  status: '',
  ownerId: ''
})

const editorVisible = ref(false)
const editingCustomer = ref(null)
const saving = ref(false)
const deletingId = ref(null)

const hasFilters = computed(() =>
  filters.keyword || filters.industry || filters.level || filters.status || filters.ownerId
)

let requestSeq = 0

async function loadData() {
  const seq = ++requestSeq
  loading.value = true
  errorMessage.value = ''
  try {
    const params = {
      page: pagination.page.value,
      pageSize: pagination.pageSize.value,
      ...Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      )
    }
    const result = await getCustomers(params)
    if (seq !== requestSeq) return
    customers.value = result.list || []
    pagination.setTotal(result.total || 0)
  } catch (e) {
    if (seq !== requestSeq) return
    customers.value = []
    pagination.setTotal(0)
    errorMessage.value = e?.message || '加载客户列表失败'
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

async function loadFilterOptions() {
  filterLoading.value = true
  try {
    filterOptions.value = await getCustomerFilterOptions()
  } catch {
    // silently fail, filters still usable
  } finally {
    filterLoading.value = false
  }
}

function handleSearch() {
  pagination.resetPage()
  loadData()
}

function onPageChange(val) {
  pagination.changePage(val)
  loadData()
}

function onPageSizeChange(val) {
  pagination.changePageSize(val)
  loadData()
}

function openCreate() {
  editingCustomer.value = null
  editorVisible.value = true
}

function openEdit(row) {
  editingCustomer.value = { ...row }
  editorVisible.value = true
}

async function handleSave(formData) {
  saving.value = true
  try {
    if (editingCustomer.value) {
      await updateCustomer(editingCustomer.value.id, formData)
    } else {
      await createCustomer(formData)
    }
    ElMessage.success('保存成功')
    editorVisible.value = false
    if (!editingCustomer.value) pagination.resetPage()
    await Promise.all([loadData(), loadFilterOptions()])
  } catch (e) {
    // keep dialog open, let user correct
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除客户「${row.name}」吗？此操作不可恢复。`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }

  deletingId.value = row.id
  try {
    await deleteCustomer(row.id)
    ElMessage.success('删除成功')
    if (customers.value.length === 1 && pagination.page.value > 1) {
      pagination.changePage(pagination.page.value - 1)
    }
    await Promise.all([loadData(), loadFilterOptions()])
  } catch (e) {
    // error handled by interceptor
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  Promise.all([loadFilterOptions(), loadData()])
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.customer-list-view {
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

.filter-form {
  .el-row {
    align-items: flex-start;
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

  :deep(.el-table) {
    overflow-x: auto;
  }
}
</style>
