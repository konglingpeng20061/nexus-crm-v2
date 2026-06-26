<template>
  <div class="detail-view">
    <div class="detail-header">
      <el-button :icon="ArrowLeft" @click="$router.push('/opportunities')">返回商机列表</el-button>
      <div class="header-actions" v-if="!loading && !notFound && detail">
        <el-button v-if="userStore.hasPermission('opportunity:edit')" type="primary" @click="openEdit">编辑</el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap" v-loading="loading" />

    <div v-else-if="notFound" class="not-found-card">
      <el-result icon="warning" title="商机不存在" sub-title="该商机可能已被删除或您没有访问权限">
        <template #extra>
          <el-button type="primary" @click="$router.push('/opportunities')">返回商机列表</el-button>
          <el-button @click="loadDetail">重新加载</el-button>
        </template>
      </el-result>
    </div>

    <div v-else-if="errorMessage" class="error-card">
      <el-alert :title="errorMessage" type="error" show-icon :closable="false">
        <el-button type="primary" link @click="loadDetail">重新加载</el-button>
      </el-alert>
    </div>

    <template v-else-if="detail">
      <div class="detail-content">
        <div class="detail-main">
          <div class="info-card">
            <div class="card-header">
              <h3>{{ detail.name }}</h3>
              <div class="tags">
                <el-tag :type="stageTagType(detail.stage)" size="small">{{ stageLabel(detail.stage) }}</el-tag>
                <el-tag v-if="detail.overdue" type="danger" size="small">已逾期</el-tag>
              </div>
            </div>
            <p class="description" v-if="detail.description">{{ detail.description }}</p>

            <el-descriptions :column="2" border size="small" class="info-table">
              <el-descriptions-item label="预计金额">{{ formatCurrency(detail.amount) }}</el-descriptions-item>
              <el-descriptions-item label="成功概率">{{ detail.probability }}%</el-descriptions-item>
              <el-descriptions-item label="客户名称">{{ detail.customerName }}</el-descriptions-item>
              <el-descriptions-item label="负责人">{{ detail.ownerName }}</el-descriptions-item>
              <el-descriptions-item label="预计成交日">{{ formatDate(detail.expectedCloseDate) }}</el-descriptions-item>
              <el-descriptions-item label="下一步计划">{{ detail.nextStep || '-' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDateTime(detail.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatDateTime(detail.updatedAt) }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-card">
            <div class="card-header">
              <h4>阶段推进</h4>
            </div>
            <div v-if="allowedTransitions.length > 0" class="stage-actions">
              <el-button v-for="t in allowedTransitions" :key="t.value" :type="t.value === 'lost' ? 'danger' : 'primary'" size="small" @click="openStageDialog(t)">
                推进至 {{ t.label }}
              </el-button>
            </div>
            <div v-else class="text-muted">该商机无需继续推进</div>
          </div>

          <div class="info-card">
            <h4>阶段变更时间线</h4>
            <div v-if="!detail.stageRecords || detail.stageRecords.length === 0" class="text-muted">暂无记录</div>
            <el-timeline v-else>
              <el-timeline-item
                v-for="record in detail.stageRecords"
                :key="record.id"
                :timestamp="formatDateTime(record.changedAt)"
                placement="top"
              >
                <div class="timeline-item">
                  <div class="timeline-header">
                    <span class="timeline-operator">{{ record.changedByName }}</span>
                    <span v-if="record.fromStage" class="timeline-arrow">
                      {{ stageLabel(record.fromStage) }} → {{ stageLabel(record.toStage) }}
                    </span>
                    <span v-else class="timeline-arrow">{{ stageLabel(record.toStage) }}</span>
                  </div>
                  <div v-if="record.note" class="timeline-note">{{ record.note }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>

        <div class="detail-side">
          <div class="info-card owner-card">
            <h4>客户信息</h4>
            <div v-if="detail.customer" class="side-info">
              <div class="side-name">{{ detail.customer.name }}</div>
              <div class="side-meta" v-if="detail.customer.level">等级: {{ detail.customer.level }}</div>
              <div class="side-meta" v-if="detail.customer.status">状态: {{ detail.customer.status }}</div>
              <el-button type="primary" link size="small" @click="$router.push(`/customers/${detail.customer.id}`)">查看客户</el-button>
            </div>
            <div v-else class="text-muted">未知客户</div>
          </div>

          <div class="info-card owner-card">
            <h4>负责人信息</h4>
            <div v-if="detail.owner" class="side-info">
              <div class="side-name">{{ detail.owner.name }}</div>
              <div class="side-role">{{ detail.owner.roleName }}</div>
              <div class="side-contact">{{ detail.owner.phone }}</div>
              <div class="side-contact">{{ detail.owner.email }}</div>
            </div>
            <div v-else class="text-muted">未知负责人</div>
          </div>
        </div>
      </div>
    </template>

    <!-- Stage Transition Dialog -->
    <el-dialog v-model="stageDialogVisible" title="推进阶段" width="480px" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="stageFormRef" :model="stageForm" :rules="stageRules" label-width="110px">
        <el-form-item label="目标阶段">
          <el-tag :type="stageTagType(targetStage?.value)" size="default">{{ targetStage?.label }}</el-tag>
        </el-form-item>
        <el-form-item label="下一步计划" prop="nextStep" v-if="!targetStage?.terminal">
          <el-input v-model="stageForm.nextStep" placeholder="请填写下一步计划" maxlength="200" />
        </el-form-item>
        <el-form-item label="变更说明" prop="note">
          <el-input v-model="stageForm.note" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="说明（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stageDialogVisible = false" :disabled="stageSaving">取消</el-button>
        <el-button type="primary" @click="handleStageTransition" :loading="stageSaving">确认推进</el-button>
      </template>
    </el-dialog>

    <!-- Edit Dialog -->
    <OpportunityFormDialog
      v-model="editVisible"
      :opportunity="detail"
      :saving="saving"
      @save="handleEditSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getOpportunity, updateOpportunity, updateOpportunityStage } from '@/api/opportunity'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'
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

const stageTransitions = {
  lead: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['negotiation', 'lost'],
  negotiation: ['won', 'lost'],
  won: [],
  lost: []
}

function stageLabel(v) { return stageMap[v]?.label || v }
function stageTagType(v) {
  if (v === 'won') return 'success'
  if (v === 'lost') return 'danger'
  if (v === 'negotiation') return 'warning'
  if (v === 'proposal') return 'primary'
  return 'info'
}

const route = useRoute()
const userStore = useUserStore()

const detail = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const notFound = ref(false)

const editVisible = ref(false)
const saving = ref(false)

const stageDialogVisible = ref(false)
const stageSaving = ref(false)
const stageFormRef = ref(null)
const targetStage = ref(null)
const stageForm = ref({ nextStep: '', note: '' })

const stageRules = {
  nextStep: [
    {
      validator: (rule, value, callback) => {
        if (targetStage.value && !targetStage.value.terminal && !value?.trim()) {
          callback(new Error('活跃阶段必须填写下一步计划'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const allowedTransitions = computed(() => {
  if (!detail.value) return []
  const allowed = stageTransitions[detail.value.stage] || []
  return stageOptions.filter(s => allowed.includes(s.value))
})

async function loadDetail() {
  loading.value = true
  errorMessage.value = ''
  notFound.value = false
  try {
    const result = await getOpportunity(route.params.id)
    detail.value = result
  } catch (e) {
    if (e?.response?.status === 404) {
      notFound.value = true
    } else {
      errorMessage.value = e?.message || '加载商机详情失败'
    }
    detail.value = null
  } finally {
    loading.value = false
  }
}

function openEdit() {
  editVisible.value = true
}

function openStageDialog(t) {
  targetStage.value = t
  stageForm.value = { nextStep: '', note: '' }
  stageDialogVisible.value = true
}

async function handleStageTransition() {
  if (!stageFormRef.value) return
  try {
    await stageFormRef.value.validate()
  } catch {
    return
  }

  stageSaving.value = true
  try {
    const result = await updateOpportunityStage(route.params.id, {
      stage: targetStage.value.value,
      nextStep: targetStage.value.terminal ? '' : stageForm.value.nextStep,
      note: stageForm.value.note
    })
    detail.value = result
    ElMessage.success('阶段已推进')
    stageDialogVisible.value = false
  } catch {
    // error handled by interceptor
  } finally {
    stageSaving.value = false
  }
}

async function handleEditSave(formData) {
  saving.value = true
  try {
    const result = await updateOpportunity(detail.value.id, formData)
    detail.value = result
    ElMessage.success('保存成功')
    editVisible.value = false
  } catch {
    // keep dialog open
  } finally {
    saving.value = false
  }
}

onMounted(loadDetail)
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
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: $glass-border;
  border-radius: $border-radius;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: $shadow-sm;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: $shadow-md;
  }

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

.stage-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.text-muted {
  color: $text-muted;
  font-size: 12px;
}

.side-info {
  .side-name {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  .side-role {
    font-size: 12px;
    color: $text-muted;
    margin-top: 2px;
  }

  .side-meta {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 4px;
  }

  .side-contact {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 4px;
    word-break: break-all;
  }
}

.timeline-item {
  .timeline-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .timeline-operator {
    font-weight: 600;
    font-size: 13px;
    color: $text-primary;
  }

  .timeline-arrow {
    font-size: 13px;
    color: $text-secondary;
  }

  .timeline-note {
    margin: 0;
    color: $text-muted;
    font-size: 12px;
  }
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
