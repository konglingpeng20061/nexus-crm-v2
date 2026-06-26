<template>
  <div class="board-view">
    <div class="board-header">
      <div class="board-title">
        <h2>销售看板</h2>
        <div class="board-meta">
          <span>商机总数: {{ totalCount }}</span>
          <span>总金额: {{ formatCurrency(totalAmount) }}</span>
        </div>
      </div>
      <div class="board-actions">
        <el-button @click="$router.push('/opportunities')">返回列表</el-button>
        <el-button type="primary" :icon="Refresh" @click="loadBoard" :loading="loading">刷新</el-button>
      </div>
    </div>

    <div v-if="errorMessage" class="error-card">
      <el-alert :title="errorMessage" type="error" show-icon :closable="false">
        <template #default>
          <el-button type="primary" link @click="loadBoard">重新加载</el-button>
        </template>
      </el-alert>
    </div>

    <div v-else-if="loading" class="loading-wrap" v-loading="loading" />

    <div v-else class="board-container">
      <div class="board-columns">
        <div v-for="col in board" :key="col.stage" class="board-column">
          <div class="column-header">
            <div class="column-title">
              <h4>{{ col.label }}</h4>
              <el-tag size="small">{{ col.count }}</el-tag>
            </div>
            <div class="column-amount">{{ formatCurrency(col.amount) }}</div>
          </div>
          <div class="column-body">
            <div v-if="col.opportunities.length === 0" class="column-empty">
              <span>暂无商机</span>
            </div>
            <OpportunityCard
              v-for="op in col.opportunities"
              :key="op.id"
              :opportunity="op"
              :can-change-stage="canChangeStage(op.stage)"
              @open="$router.push(`/opportunities/${op.id}`)"
              @change-stage="handleCardStageChange(op, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Stage Transition Dialog -->
    <el-dialog v-model="stageDialogVisible" title="推进阶段" width="480px" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="stageFormRef" :model="stageForm" :rules="stageRules" label-width="110px">
        <el-form-item label="当前商机">
          <span class="text-muted">{{ stageChangingOp?.name }}</span>
        </el-form-item>
        <el-form-item label="目标阶段">
          <el-tag :type="stageTagType(stageTargetStage?.value)" size="default">{{ stageTargetStage?.label }}</el-tag>
        </el-form-item>
        <el-form-item label="下一步计划" prop="nextStep" v-if="!stageTargetStage?.terminal">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getOpportunityBoard, updateOpportunityStage } from '@/api/opportunity'
import { formatCurrency } from '@/utils/format'
import OpportunityCard from './components/OpportunityCard.vue'

const stageOptions = [
  { value: 'lead', label: '初步接触', probability: 10, terminal: false },
  { value: 'qualified', label: '需求确认', probability: 30, terminal: false },
  { value: 'proposal', label: '方案报价', probability: 50, terminal: false },
  { value: 'negotiation', label: '合同谈判', probability: 75, terminal: false },
  { value: 'won', label: '已成交', probability: 100, terminal: true },
  { value: 'lost', label: '已流失', probability: 0, terminal: true }
]

const stageTransitions = {
  lead: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['negotiation', 'lost'],
  negotiation: ['won', 'lost'],
  won: [],
  lost: []
}

function stageTagType(v) {
  if (v === 'won') return 'success'
  if (v === 'lost') return 'danger'
  if (v === 'negotiation') return 'warning'
  if (v === 'proposal') return 'primary'
  return 'info'
}

const router = useRouter()
const userStore = useUserStore()

const board = ref([])
const loading = ref(false)
const errorMessage = ref('')

const stageDialogVisible = ref(false)
const stageSaving = ref(false)
const stageFormRef = ref(null)
const stageChangingOp = ref(null)
const stageTargetStage = ref(null)
const stageForm = ref({ nextStep: '', note: '' })

const stageRules = {
  nextStep: [
    {
      validator: (rule, value, callback) => {
        if (stageTargetStage.value && !stageTargetStage.value.terminal && !value?.trim()) {
          callback(new Error('活跃阶段必须填写下一步计划'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const totalCount = computed(() => board.value.reduce((s, c) => s + c.count, 0))
const totalAmount = computed(() => board.value.reduce((s, c) => s + (c.amount || 0), 0))

function canChangeStage(stage) {
  if (!userStore.hasPermission('opportunity:stage')) return false
  const allowed = stageTransitions[stage] || []
  return allowed.length > 0
}

async function loadBoard() {
  loading.value = true
  errorMessage.value = ''
  try {
    board.value = await getOpportunityBoard()
  } catch (e) {
    errorMessage.value = e?.message || '加载看板失败'
    board.value = []
  } finally {
    loading.value = false
  }
}

function handleCardStageChange(op, targetStageValue) {
  const allowed = stageTransitions[op.stage] || []
  if (!allowed.includes(targetStageValue)) {
    ElMessage.error('不允许的阶段流转')
    return
  }
  stageChangingOp.value = op
  stageTargetStage.value = stageOptions.find(s => s.value === targetStageValue)
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
    await updateOpportunityStage(stageChangingOp.value.id, {
      stage: stageTargetStage.value.value,
      nextStep: stageTargetStage.value.terminal ? '' : stageForm.value.nextStep,
      note: stageForm.value.note
    })
    ElMessage.success('阶段已推进')
    stageDialogVisible.value = false
    await loadBoard()
  } catch {
    // error handled by interceptor
  } finally {
    stageSaving.value = false
  }
}

onMounted(loadBoard)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.board-view {
  padding-bottom: 32px;
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .board-title {
    h2 {
      margin: 0 0 4px;
      font-size: 22px;
      font-weight: 600;
      color: $text-primary;
    }

    .board-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: $text-secondary;
    }
  }

  .board-actions {
    display: flex;
    gap: 8px;
  }
}

.error-card {
  margin-bottom: 16px;
}

.loading-wrap {
  min-height: 400px;
}

.board-container {
  overflow-x: auto;
  padding-bottom: 8px;
}

.board-columns {
  display: flex;
  gap: 14px;
  min-width: 0;
}

.board-column {
  min-width: 270px;
  max-width: 270px;
  flex-shrink: 0;
  background: $bg-card;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: $glass-border;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
}

.column-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid $border-color;

  .column-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: $text-primary;
    }
  }

  .column-amount {
    font-size: 13px;
    color: $text-secondary;
    margin-top: 4px;
  }
}

.column-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 10px 6px;
  min-height: 100px;
}

.column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  color: $text-muted;
  font-size: 13px;
}

@media (max-width: 700px) {
  .board-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .board-actions {
      width: 100%;
      .el-button {
        flex: 1;
      }
    }
  }

  .board-column {
    min-width: 240px;
    max-width: 240px;
  }
}
</style>
