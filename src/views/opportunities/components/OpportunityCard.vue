<template>
  <div class="opportunity-card" @click="$emit('open')">
    <div class="card-top">
      <div class="card-name" :title="opportunity.name">{{ opportunity.name }}</div>
      <div v-if="opportunity.overdue" class="card-badge overdue">逾期</div>
    </div>

    <div class="card-customer">{{ opportunity.customerName }}</div>

    <div class="card-details">
      <div class="detail-row">
        <span class="detail-label">金额</span>
        <span class="detail-value">{{ formatCurrency(opportunity.amount) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">概率</span>
        <span class="detail-value">{{ opportunity.probability }}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">负责人</span>
        <span class="detail-value">{{ opportunity.ownerName }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">成交日</span>
        <span class="detail-value" :class="{ 'text-overdue': opportunity.overdue }">{{ formatDate(opportunity.expectedCloseDate) }}</span>
      </div>
    </div>

    <div v-if="opportunity.nextStep" class="card-next-step" :title="opportunity.nextStep">
      下一步: {{ opportunity.nextStep }}
    </div>

    <div v-if="canChangeStage" class="card-actions" @click.stop>
      <el-dropdown trigger="click" @command="handleStageCommand">
        <el-button type="primary" size="small" circle :icon="Right">
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="t in allowedTransitions"
              :key="t.value"
              :command="t.value"
              :divided="t.value === 'lost'"
            >
              {{ t.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Right } from '@element-plus/icons-vue'
import { formatCurrency, formatDate } from '@/utils/format'

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

const props = defineProps({
  opportunity: { type: Object, required: true },
  canChangeStage: { type: Boolean, default: false }
})

const emit = defineEmits(['open', 'change-stage'])

const allowedTransitions = computed(() => {
  if (!props.canChangeStage) return []
  const allowed = stageTransitions[props.opportunity.stage] || []
  return stageOptions.filter(s => allowed.includes(s.value))
})

function handleStageCommand(value) {
  emit('change-stage', value)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.opportunity-card {
  background: $bg-card-solid;
  border: 1px solid $border-color;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.15s;
  position: relative;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-1px);
  }
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.card-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  flex-shrink: 0;

  &.overdue {
    background: rgba($danger-color, 0.1);
    color: $danger-color;
  }
}

.card-customer {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}

.card-details {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.detail-label {
  color: $text-muted;
}

.detail-value {
  color: $text-primary;
  font-weight: 500;
}

.text-overdue {
  color: $danger-color;
}

.card-next-step {
  margin-top: 8px;
  font-size: 11px;
  color: $text-muted;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
