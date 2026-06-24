<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="520px"
    destroy-on-close
    :close-on-click-modal="false"
    class="dark-dialog"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="客户" prop="customerId">
        <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width: 100%">
          <el-option
            v-for="c in customers"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </el-select>
      </el-form-item>

      <template v-if="type === 'todo'">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入待办标题" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待处理" value="pending" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" prop="dueAt">
          <el-date-picker
            v-model="form.dueAt"
            type="datetime"
            placeholder="选择截止时间"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss.000Z"
          />
        </el-form-item>
      </template>

      <template v-if="type === 'follow'">
        <el-form-item label="跟进方式" prop="method">
          <el-select v-model="form.method" placeholder="请选择跟进方式" style="width: 100%">
            <el-option label="电话" value="phone" />
            <el-option label="拜访" value="visit" />
            <el-option label="微信" value="wechat" />
            <el-option label="邮件" value="email" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟进内容"
          />
        </el-form-item>
        <el-form-item label="下次跟进" prop="nextFollowAt">
          <el-date-picker
            v-model="form.nextFollowAt"
            type="datetime"
            placeholder="选择下次跟进时间"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss.000Z"
          />
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  type: { type: String, default: 'todo', validator: v => ['todo', 'follow'].includes(v) },
  data: { type: Object, default: null },
  customers: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const title = computed(() => {
  const action = props.data ? '编辑' : '新增'
  const name = props.type === 'todo' ? '待办' : '跟进'
  return `${action}${name}`
})

const formRef = ref(null)
const saving = ref(false)

const baseForm = {
  customerId: null,
  title: '',
  priority: 'medium',
  status: 'pending',
  dueAt: '',
  method: 'phone',
  content: '',
  nextFollowAt: ''
}

const form = ref({ ...baseForm })

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  dueAt: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
  method: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  content: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    form.value = props.data
      ? { ...baseForm, ...props.data }
      : { ...baseForm }
  }
})

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = props.type === 'todo'
      ? {
          customerId: form.value.customerId,
          title: form.value.title,
          priority: form.value.priority,
          status: form.value.status,
          dueAt: form.value.dueAt
        }
      : {
          customerId: form.value.customerId,
          method: form.value.method,
          content: form.value.content,
          nextFollowAt: form.value.nextFollowAt
        }

    emit('save', {
      id: props.data?.id,
      type: props.type,
      data: payload
    })
  } finally {
    saving.value = false
  }
}

function finish() {
  visible.value = false
}

defineExpose({ finish })
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.dark-dialog {
  .el-dialog__header {
    background: $bg-surface;
    border-bottom: 1px solid $border-color;
    margin-right: 0;
    padding: 16px 20px;
  }

  .el-dialog__title {
    color: $text-primary;
    font-weight: 600;
  }

  .el-dialog__body {
    background: $bg-surface;
    color: $text-primary;
    padding: 20px;
  }

  .el-dialog__footer {
    background: $bg-surface;
    border-top: 1px solid $border-color;
    padding: 12px 20px;
  }

  .el-form-item__label {
    color: $text-secondary;
  }
}
</style>

