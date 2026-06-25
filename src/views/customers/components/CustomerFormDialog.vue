<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑客户' : '新增客户'"
    width="680px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
    @open="handleOpen"
    @close="handleClose"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="saving">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入客户名称" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="行业" prop="industry">
            <el-select v-model="form.industry" placeholder="请选择行业" style="width:100%">
              <el-option v-for="item in options.industries" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="客户等级" prop="level">
            <el-select v-model="form.level" placeholder="请选择等级" style="width:100%">
              <el-option label="重点客户" value="A" />
              <el-option label="普通客户" value="B" />
              <el-option label="潜在客户" value="C" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width:100%">
              <el-option label="活跃" value="active" />
              <el-option label="潜在" value="potential" />
              <el-option label="停用" value="inactive" />
              <el-option label="即将流失" value="at_risk" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="负责人" prop="ownerId">
            <el-select v-model="form.ownerId" placeholder="请选择负责人" style="width:100%" :disabled="!canAssign">
              <el-option v-for="item in options.owners" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户来源" prop="source">
            <el-select v-model="form.source" placeholder="请选择来源" style="width:100%">
              <el-option label="线上注册" value="线上注册" />
              <el-option label="客户推荐" value="客户推荐" />
              <el-option label="市场活动" value="市场活动" />
              <el-option label="电话拜访" value="电话拜访" />
              <el-option label="官网咨询" value="官网咨询" />
              <el-option label="渠道合作" value="渠道合作" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="省份" prop="province">
            <el-select v-model="form.province" placeholder="请选择省份" style="width:100%">
              <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="城市" prop="city">
            <el-select v-model="form.city" placeholder="请选择城市" style="width:100%" :disabled="!form.province">
              <el-option v-for="item in cityOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="详细地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入详细地址" />
      </el-form-item>

      <el-divider content-position="left">主要联系人</el-divider>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="联系人" prop="contactName">
            <el-input v-model="form.contactName" placeholder="姓名" maxlength="30" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="手机号" prop="contactPhone">
            <el-input v-model="form.contactPhone" placeholder="11位手机号" maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="职位" prop="contactTitle">
            <el-input v-model="form.contactTitle" placeholder="职位" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="邮箱" prop="contactEmail">
        <el-input v-model="form.contactEmail" placeholder="邮箱地址" />
      </el-form-item>

      <el-form-item label="客户描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="客户描述（可选）" />
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
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  customer: { type: Object, default: null },
  options: { type: Object, default: () => ({ industries: [], levels: [], statuses: [], owners: [] }) },
  saving: Boolean,
  canAssign: Boolean
})

const emit = defineEmits(['update:modelValue', 'save'])

const isEdit = computed(() => !!props.customer)

const provinceOptions = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '山东省']

const cityMap = {
  '北京市': ['朝阳区', '海淀区', '西城区', '东城区'],
  '上海市': ['浦东新区', '徐汇区', '静安区', '长宁区'],
  '广东省': ['深圳市', '广州市', '东莞市', '佛山市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市'],
  '四川省': ['成都市', '绵阳市', '德阳市', '宜宾市'],
  '湖北省': ['武汉市', '宜昌市', '襄阳市', '荆州市'],
  '山东省': ['济南市', '青岛市', '烟台市', '潍坊市']
}

const cityOptions = computed(() => form.province ? (cityMap[form.province] || []) : [])

const formRef = ref(null)

const createDefaultForm = () => ({
  name: '',
  industry: '',
  level: '',
  status: '',
  ownerId: '',
  source: '',
  province: '',
  city: '',
  address: '',
  contactName: '',
  contactPhone: '',
  contactTitle: '',
  contactEmail: '',
  description: ''
})

const form = reactive(createDefaultForm())

const rules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  industry: [{ required: true, message: '请选择行业', trigger: 'change' }],
  level: [{ required: true, message: '请选择客户等级', trigger: 'change' }],
  status: [{ required: true, message: '请选择客户状态', trigger: 'change' }],
  ownerId: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  source: [{ required: true, message: '请选择客户来源', trigger: 'change' }],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  contactEmail: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

function handleOpen() {
  if (props.customer) {
    form.name = props.customer.name || ''
    form.industry = props.customer.industry || ''
    form.level = props.customer.level || ''
    form.status = props.customer.status || ''
    form.ownerId = props.customer.ownerId || (props.options.owners[0]?.id || '')
    form.source = props.customer.source || ''
    form.province = props.customer.province || ''
    form.city = props.customer.city || ''
    form.address = props.customer.address || ''
    form.contactName = props.customer.contactName || ''
    form.contactPhone = props.customer.contactPhone || ''
    form.contactTitle = props.customer.contactTitle || ''
    form.contactEmail = props.customer.contactEmail || ''
    form.description = props.customer.description || ''
  } else {
    Object.assign(form, createDefaultForm())
    if (props.options.owners?.length) {
      form.ownerId = props.options.owners[0].id
    }
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

<style lang="scss" scoped>
:deep(.el-divider) {
  margin: 16px 0;
}
</style>
