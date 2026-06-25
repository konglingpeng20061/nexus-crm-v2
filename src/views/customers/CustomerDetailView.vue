<template>
  <div class="detail-view">
    <div class="detail-header">
      <el-button :icon="ArrowLeft" @click="$router.push('/customers')">返回客户列表</el-button>
      <div class="header-actions" v-if="!loading && !notFound">
        <el-button v-if="userStore.hasPermission('customer:edit')" type="primary" @click="openEdit">编辑</el-button>
        <el-button
          v-if="userStore.hasPermission('customer:assign')"
          type="warning"
          @click="ownerVisible = true"
        >
          分配负责人
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap" v-loading="loading" />

    <div v-else-if="notFound" class="not-found-card">
      <el-result icon="warning" title="客户不存在" sub-title="该客户可能已被删除或您没有访问权限">
        <template #extra>
          <el-button type="primary" @click="$router.push('/customers')">返回客户列表</el-button>
          <el-button @click="loadCustomer">重新加载</el-button>
        </template>
      </el-result>
    </div>

    <div v-else-if="errorMessage" class="error-card">
      <el-alert :title="errorMessage" type="error" show-icon :closable="false">
        <el-button type="primary" link @click="loadCustomer">重新加载</el-button>
      </el-alert>
    </div>

    <template v-else-if="customer">
      <div class="detail-content">
        <div class="detail-main">
          <div class="info-card">
            <div class="card-header">
              <h3>{{ customer.name }}</h3>
              <div class="tags">
                <el-tag :type="levelTagType(customer.level)" size="small">{{ levelMap[customer.level] }}</el-tag>
                <el-tag :type="statusTagType(customer.status)" size="small">{{ statusLabel(customer.status) }}</el-tag>
              </div>
            </div>
            <p class="description" v-if="customer.description">{{ customer.description }}</p>

            <el-descriptions :column="2" border size="small" class="info-table">
              <el-descriptions-item label="客户编号">{{ customer.id }}</el-descriptions-item>
              <el-descriptions-item label="行业">{{ customer.industry }}</el-descriptions-item>
              <el-descriptions-item label="来源">{{ customer.source }}</el-descriptions-item>
              <el-descriptions-item label="地区">{{ customer.region || '-' }}</el-descriptions-item>
              <el-descriptions-item label="地址" :span="2">{{ customer.address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDateTime(customer.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatDateTime(customer.updatedAt) }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-card">
            <h4>主要联系人</h4>
            <el-descriptions :column="2" border size="small" class="info-table" v-if="customer.contacts && customer.contacts.length">
              <el-descriptions-item label="姓名">{{ customer.contacts[0].name }}</el-descriptions-item>
              <el-descriptions-item label="职位">{{ customer.contacts[0].title || '-' }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ customer.contacts[0].phone }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ customer.contacts[0].email || '-' }}</el-descriptions-item>
            </el-descriptions>
            <el-empty v-else description="暂无联系人" :image-size="60" />
          </div>

          <div class="info-card follow-section">
            <div class="card-header">
              <h4>跟进记录</h4>
              <div class="follow-meta" v-if="customer.lastFollowAt">
                最近跟进: {{ formatDateTime(customer.lastFollowAt) }}
              </div>
            </div>

            <div v-if="!customer.followRecords || customer.followRecords.length === 0" class="empty-follow">
              <el-empty description="暂无客户跟进记录" :image-size="60">
                <el-button v-if="userStore.hasPermission('customer:follow')" type="primary" size="small" @click="followVisible = true">
                  新增跟进
                </el-button>
              </el-empty>
            </div>

            <el-timeline v-else>
              <el-timeline-item
                v-for="record in customer.followRecords"
                :key="record.id"
                :timestamp="formatDateTime(record.createdAt)"
                placement="top"
              >
                <div class="follow-item">
                  <div class="follow-header">
                    <span class="follow-owner">{{ record.ownerName }}</span>
                    <el-tag size="small" :type="methodTagType(record.method)">{{ methodLabel(record.method) }}</el-tag>
                  </div>
                  <p class="follow-content">{{ record.content }}</p>
                  <div class="follow-footer" v-if="record.nextFollowAt">
                    下次跟进: {{ formatDateTime(record.nextFollowAt) }}
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>

            <div class="follow-actions" v-if="userStore.hasPermission('customer:follow') && customer.followRecords && customer.followRecords.length > 0">
              <el-button type="primary" size="small" @click="followVisible = true">新增跟进</el-button>
            </div>
          </div>
        </div>

        <div class="detail-side">
          <div class="info-card owner-card">
            <h4>客户负责人</h4>
            <div v-if="customer.owner" class="owner-info">
              <div class="owner-avatar">{{ customer.owner.name.charAt(0) }}</div>
              <div class="owner-detail">
                <div class="owner-name">{{ customer.owner.name }}</div>
                <div class="owner-role">{{ customer.owner.roleName }}</div>
                <div class="owner-contact">{{ customer.owner.phone }}</div>
                <div class="owner-contact">{{ customer.owner.email }}</div>
              </div>
            </div>
            <div v-else>
              <el-empty description="暂无负责人" :image-size="50" />
            </div>
            <el-button
              v-if="userStore.hasPermission('customer:assign')"
              type="warning"
              size="small"
              style="width:100%;margin-top:12px"
              @click="ownerVisible = true"
            >
              分配负责人
            </el-button>
          </div>
        </div>
      </div>
    </template>

    <!-- Follow Form Dialog -->
    <el-dialog v-model="followVisible" title="新增跟进" width="500px" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="followFormRef" :model="followForm" :rules="followRules" label-width="100px">
        <el-form-item label="跟进方式" prop="method">
          <el-select v-model="followForm.method" placeholder="请选择" style="width:100%">
            <el-option label="电话" value="phone" />
            <el-option label="拜访" value="visit" />
            <el-option label="微信" value="wechat" />
            <el-option label="邮件" value="email" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容" prop="content">
          <el-input v-model="followForm.content" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入跟进内容" />
        </el-form-item>
        <el-form-item label="下次跟进" prop="nextFollowAt">
          <el-date-picker v-model="followForm.nextFollowAt" type="datetime" placeholder="选择时间" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="followVisible = false" :disabled="followSaving">取消</el-button>
        <el-button type="primary" @click="handleAddFollow" :loading="followSaving">保存</el-button>
      </template>
    </el-dialog>

    <!-- Owner Assign Dialog -->
    <el-dialog v-model="ownerVisible" title="分配负责人" width="400px" :close-on-click-modal="false" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="负责人">
          <el-select v-model="selectedOwnerId" placeholder="请选择负责人" style="width:100%" filterable>
            <el-option v-for="item in ownerOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <p v-if="!selectedOwnerId && ownerVisible" class="owner-hint">请选择一位负责人</p>
      </el-form>
      <template #footer>
        <el-button @click="ownerVisible = false" :disabled="ownerSaving">取消</el-button>
        <el-button type="primary" @click="handleAssignOwner" :loading="ownerSaving" :disabled="!selectedOwnerId">确认分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCustomer, createCustomerFollow, updateCustomerOwner, getCustomerFilterOptions } from '@/api/customer'
import { formatDateTime } from '@/utils/format'
import { usePagination } from '@/composables/usePagination'

const levelMap = { A: '重点客户', B: '普通客户', C: '潜在客户' }
const statusLabels = { active: '活跃', potential: '潜在', inactive: '停用', at_risk: '即将流失' }
const methodLabels = { phone: '电话', visit: '拜访', wechat: '微信', email: '邮件' }
function statusLabel(s) { return statusLabels[s] || s }
function levelTagType(l) { return l === 'A' ? 'danger' : l === 'B' ? 'warning' : 'info' }
function statusTagType(s) {
  return s === 'active' ? 'success' : s === 'potential' ? 'warning' : s === 'at_risk' ? 'danger' : 'info'
}
function methodLabel(m) { return methodLabels[m] || m }
function methodTagType(m) {
  return m === 'phone' ? '' : m === 'visit' ? 'success' : m === 'wechat' ? 'primary' : 'warning'
}

const route = useRoute()
const userStore = useUserStore()

const customer = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const notFound = ref(false)
const canAssign = computed(() => userStore.hasPermission('customer:assign'))

const followVisible = ref(false)
const followSaving = ref(false)
const followFormRef = ref(null)
const followForm = reactive({
  method: 'phone',
  content: '',
  nextFollowAt: ''
})
const followRules = {
  method: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  content: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }],
  nextFollowAt: [{ required: true, message: '请选择下次跟进时间', trigger: 'change' }]
}

const ownerVisible = ref(false)
const ownerSaving = ref(false)
const selectedOwnerId = ref(null)
const ownerOptions = ref([])

async function loadCustomer() {
  loading.value = true
  errorMessage.value = ''
  notFound.value = false
  try {
    const result = await getCustomer(route.params.id)
    customer.value = result
  } catch (e) {
    if (e?.response?.status === 404) {
      notFound.value = true
    } else {
      errorMessage.value = e?.message || '加载客户详情失败'
    }
    customer.value = null
  } finally {
    loading.value = false
  }
}

async function loadOwnerOptions() {
  if (!canAssign.value) return
  try {
    const opts = await getCustomerFilterOptions()
    ownerOptions.value = opts.owners || []
  } catch {
    // ignore
  }
}

async function handleAddFollow() {
  if (!followFormRef.value) return
  try {
    await followFormRef.value.validate()
  } catch {
    return
  }
  followSaving.value = true
  try {
    const result = await createCustomerFollow(route.params.id, {
      method: followForm.method,
      content: followForm.content,
      nextFollowAt: followForm.nextFollowAt
    })
    customer.value = result
    ElMessage.success('跟进记录已添加')
    followVisible.value = false
    followForm.method = 'phone'
    followForm.content = ''
    followForm.nextFollowAt = ''
  } catch {
    // error handled by interceptor
  } finally {
    followSaving.value = false
  }
}

async function handleAssignOwner() {
  if (!selectedOwnerId.value) return
  ownerSaving.value = true
  try {
    const result = await updateCustomerOwner(route.params.id, selectedOwnerId.value)
    customer.value = result
    ElMessage.success('负责人已更新')
    ownerVisible.value = false
  } catch {
    // error handled by interceptor
  } finally {
    ownerSaving.value = false
  }
}

function openEdit() {
  // Navigate back to list with a query param could trigger edit dialog,
  // but for simplicity we navigate to the list
  ElMessage.info('请在客户列表中点击编辑进行操作')
}

onMounted(() => {
  const promises = [loadCustomer()]
  if (canAssign.value) promises.push(loadOwnerOptions())
  Promise.all(promises)
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.detail-view {
  padding-bottom: 32px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.loading-wrap {
  min-height: 400px;
}

.not-found-card, .error-card {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.detail-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.detail-main {
  flex: 1;
  min-width: 0;
}

.detail-side {
  width: 280px;
  flex-shrink: 0;
}

.info-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  h3 {
    margin: 0;
    font-size: 20px;
    color: $text-primary;
  }

  h4 {
    margin: 0 0 12px;
    font-size: 15px;
    color: $text-primary;
    font-weight: 600;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;

    .tags {
      display: flex;
      gap: 6px;
    }
  }

  .description {
    color: $text-secondary;
    font-size: 14px;
    margin: 0 0 16px;
  }
}

:deep(.info-table) {
  --el-descriptions-item-bordered-label-background: #f5f7fa;
  --el-descriptions-table-border-color: $border-color;

  .el-descriptions__label {
    color: $text-secondary;
  }

  .el-descriptions__content {
    color: $text-primary;
  }
}

.owner-card {
  .owner-info {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .owner-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: $accent-gradient;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
  }

  .owner-detail {
    .owner-name {
      font-size: 15px;
      font-weight: 600;
      color: $text-primary;
    }

    .owner-role {
      font-size: 12px;
      color: $text-muted;
      margin-top: 2px;
    }

    .owner-contact {
      font-size: 12px;
      color: $text-secondary;
      margin-top: 4px;
      word-break: break-all;
    }
  }
}

.follow-section {
  .follow-meta {
    font-size: 12px;
    color: $text-muted;
  }
}

.follow-item {
  .follow-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .follow-owner {
    font-weight: 600;
    font-size: 13px;
    color: $text-primary;
  }

  .follow-content {
    margin: 0 0 4px;
    color: $text-secondary;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .follow-footer {
    font-size: 12px;
    color: $text-muted;
  }
}

.follow-actions {
  margin-top: 16px;
  text-align: center;
}

.empty-follow {
  padding: 10px 0;
}

.owner-hint {
  color: $danger-color;
  font-size: 12px;
  margin: 4px 0 0;
}

@media (max-width: 960px) {
  .detail-content {
    flex-direction: column;
  }

  .detail-side {
    width: 100%;
  }
}

@media (max-width: 680px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .header-actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }
  }

  :deep(.el-descriptions) {
    table, tbody, tr, td, th {
      display: block;
      width: 100%;
    }

    .el-descriptions__cell {
      display: flex;
      padding: 8px 12px;
    }

    .el-descriptions__label {
      width: 80px !important;
      flex-shrink: 0;
    }
  }
}
</style>
