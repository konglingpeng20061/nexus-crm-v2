<template>
  <div class="activity-list">
    <div class="activity-list__header">
      <h4>最近客户跟进</h4>
      <el-button v-if="canCreate" type="primary" size="small" :icon="Plus" @click="$emit('add')">
        新增
      </el-button>
    </div>

    <div class="activity-list__body">
      <el-skeleton v-if="loading" :rows="5" animated />

      <el-empty v-else-if="items.length === 0" description="暂无跟进记录" />

      <template v-else>
        <div class="activity-list__items" :class="{ collapsed: isCollapsed }">
          <div
            v-for="item in visibleItems"
            :key="item.id"
            class="activity-item"
          >
            <div class="activity-item__main">
              <div class="activity-item__title-row">
                <el-tag size="small" :type="methodType(item.method)">
                  {{ methodLabel(item.method) }}
                </el-tag>
                <span class="activity-item__title">{{ item.customerName }}</span>
              </div>
              <div class="activity-item__content">
                {{ item.content }}
              </div>
              <div class="activity-item__meta">
                <span>负责人：{{ item.ownerName }}</span>
                <span>创建：{{ formatDateTime(item.createdAt) }}</span>
                <span v-if="item.nextFollowAt">下次跟进：{{ formatDate(item.nextFollowAt) }}</span>
              </div>
            </div>
            <div class="activity-item__actions">
              <el-button v-if="canEdit(item)" type="primary" size="small" text :icon="Edit" @click="$emit('edit', item)">
                编辑
              </el-button>
            </div>
          </div>
        </div>

        <div v-if="items.length > collapseThreshold" class="activity-list__footer">
          <el-button type="primary" link size="small" @click="toggleCollapsed">
            {{ isCollapsed ? `展开全部 (${items.length})` : '收起' }}
            <el-icon class="expand-icon" :class="{ 'is-expanded': !isCollapsed }">
              <ArrowDown />
            </el-icon>
          </el-button>
        </div>
      </template>
    </div>

    <div v-if="error" class="activity-list__error">
      <el-alert :title="error" type="error" show-icon :closable="false">
        <template #default>
          <el-button type="primary" link size="small" @click="$emit('refresh')">重新加载</el-button>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Edit, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { formatDate, formatDateTime } from '@/utils/format'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

defineEmits(['add', 'edit', 'refresh'])

const userStore = useUserStore()

const isAdmin = computed(() => userStore.user?.role === 'admin')
const canCreate = computed(() => true)

const collapseThreshold = 5
const isCollapsed = ref(true)

const visibleItems = computed(() => {
  if (!isCollapsed.value || props.items.length <= collapseThreshold) {
    return props.items
  }
  return props.items.slice(0, collapseThreshold)
})

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value
}

function canEdit(item) {
  return isAdmin.value || item.ownerId === userStore.user?.id
}

function methodType(method) {
  const map = { phone: 'primary', visit: 'success', wechat: 'success', email: 'info' }
  return map[method] || 'info'
}

function methodLabel(method) {
  const map = { phone: '电话', visit: '拜访', wechat: '微信', email: '邮件' }
  return map[method] || method
}
</script>

<style lang="scss" scoped>
.activity-list {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  &__body {
    min-height: 120px;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 12px;

    &.collapsed {
      .activity-item:nth-child(n + 6) {
        display: none;
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
  }

  &__error {
    margin-top: 12px;
  }
}

.expand-icon {
  margin-left: 4px;
  transition: transform 0.25s ease;

  &.is-expanded {
    transform: rotate(180deg);
  }
}

.activity-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f5f7fa;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #eef1f6;
    transform: translateX(2px);
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__title {
    font-weight: 500;
    color: #303133;
  }

  &__content {
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 8px;
    word-break: break-all;
  }

  &__meta {
    font-size: 12px;
    color: #909399;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
}
</style>
