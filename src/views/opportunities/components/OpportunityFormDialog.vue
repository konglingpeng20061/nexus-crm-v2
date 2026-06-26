<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑商机' : '新增商机'"
    width="660px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
    @open="handleOpen"
    @close="handleClose"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" v-loading="saving">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="商机名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入商机名称" maxlength="100" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="关联客户" prop="customerId">
            <el-select v-model="form.customerId" placeholder="请选择客户" style="width:100%" filterable>
              <el-option v-for="item in customerOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="ownerId">
            <el-select v-model="form.ownerId" placeholder="请选择负责人" style="width:100%" filterable>
              <el-option v-for="item in ownerOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="销售阶段" prop="stage">
            <el-select v-model="form.stage" placeholder="请选择阶段" style="width:100%" :disabled="isEdit">
              <el-option v-for="s in stageOptions" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计金额(元)" prop="amount">
            <el-input-number v-model="form.amount" :min="1" :step="10000" :max="99999999" style="width:100%" placeholder="金额" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="预计成交日" prop="expectedCloseDate">
            <el-date-picker v-model="form.expectedCloseDate" type="date" placeholder="选择日期" style="width:100%" value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="成功概率">
            <el-input :model-value="form.probability + '%'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="下一步计划" prop="nextStep">
        <el-input v-model="form.nextStep" :disabled="isTerminalStage" placeholder="活跃阶段必须填写下一步计划" maxlength="200" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="商机描述（可选）" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)" :disabled="saving">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="saving">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { getDashboardCustomerOptions } from '@/api/dashboard'

const props = defineProps({
  modelValue: Boolean,
  opportunity: { type: Object, default: null },
  saving: Boolean
})

const emit = defineEmits(['update:modelValue', 'save'])

const stageOptions = [
  { value: 'lead', label: '初步接触', probability: 10, terminal: false },
  { value: 'qualified', label: '需求确认', probability: 30, terminal: false },
  { value: 'proposal', label: '方案报价', probability: 50, terminal: false },
  { value: 'negotiation', label: '合同谈判', probability: 75, terminal: false },
  { value: 'won', label: '已成交', probability: 100, terminal: true },
  { value: 'lost', label: '已流失', probability: 0, terminal: true }
]

const stageMap = Object.fromEntries(stageOptions.map(s => [s.value, s]))

const isEdit = computed(() => !!props.opportunity)
const isTerminalStage = computed(() => {
  const cfg = stageMap[form.stage]
  return cfg ? cfg.terminal : false
})

const customerOptions = ref([])
const ownerOptions = ref([])

const formRef = ref(null)

const createDefaultForm = () => ({
  name: '',
  customerId: '',
  ownerId: '',
  stage: 'lead',
  amount: 50000,
  expectedCloseDate: '',
  nextStep: '',
  description: '',
  probability: 10
})

const form = reactive(createDefaultForm())

watch(() => form.stage, (val) => {
  const cfg = stageMap[val]
  if (cfg) {
    form.probability = cfg.probability
    if (cfg.terminal) {
      form.nextStep = ''
    }
  }
})

const rules = {
  name: [{ required: true, message: '请输入商机名称', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  ownerId: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  stage: [{ required: true, message: '请选择销售阶段', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  expectedCloseDate: [{ required: true, message: '请选择预计成交日期', trigger: 'change' }],
  nextStep: [
    {
      validator: (rule, value, callback) => {
        const cfg = stageMap[form.stage]
        if (cfg && !cfg.terminal && !value?.trim()) {
          callback(new Error('活跃阶段必须填写下一步计划'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function loadOptions() {
  try {
    const customers = await getDashboardCustomerOptions()
    customerOptions.value = customers || []
    const { getCustomerFilterOptions } = await import('@/api/customer')
    const opts = await getCustomerFilterOptions()
    ownerOptions.value = opts.owners || []
  } catch {
    // ignore
  }
}

function handleOpen() {
  loadOptions()
  if (props.opportunity) {
    form.name = props.opportunity.name || ''
    form.customerId = props.opportunity.customerId || ''
    form.ownerId = props.opportunity.ownerId || ''
    form.stage = props.opportunity.stage || 'lead'
    form.amount = props.opportunity.amount || 0
    form.expectedCloseDate = props.opportunity.expectedCloseDate || ''
    form.nextStep = props.opportunity.nextStep || ''
    form.description = props.opportunity.description || ''
    const cfg = stageMap[form.stage]
    form.probability = cfg ? cfg.probability : 0
  } else {
    Object.assign(form, createDefaultForm())
  }
}

function handleClose() {
  formRef.value?.clearValidate()
  Object.assign(form, createDefaultForm())
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  emit('save', { ...form })
}
</script>
