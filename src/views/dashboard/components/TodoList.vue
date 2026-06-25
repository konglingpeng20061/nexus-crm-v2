<template>
  <div class="activity-list">
    <div class="activity-list__header">
      <h4>今日待办</h4>
      <div class="activity-list__toolbar">
        <el-checkbox v-model="onlyMine" size="small" label="只看我的" />
        <el-button v-if="canCreate" type="primary" size="small" :icon="Plus" @click="$emit('add')">
          新增
        </el-button>
      </div>
    </div>

    <div class="activity-list__body">
      <el-skeleton v-if="loading" :rows="5" animated />

      <el-empty v-else-if="filteredItems.length === 0" :description="onlyMine ? '没有我的待办' : '暂无待办'" />

      <template v-else>
        <div class="activity-list__items" :class="{ collapsed: isCollapsed }">
          <div
            v-for="item in visibleItems"
            :key="item.id"
            class="activity-item"
            :class="{ 'is-overdue': isOverdue(item) && item.status === 'pending' }"
          >
            <div class="activity-item__main">
              <div class="activity-item__title-row">
                <el-tag size="small" :type="priorityType(item.priority)">
                  {{ priorityLabel(item.priority) }}
                </el-tag>
                <span class="activity-item__title">{{ item.title }}</span>
              </div>
              <div class="activity-item__meta">
                <span>{{ item.customerName }}</span>
                <span>负责人：{{ item.ownerName }}</span>
                <span>截止：{{ formatDate(item.dueAt) }}</span>
              </div>
            </div>
            <div class="activity-item__actions">
              <el-button
                v-if="canEdit(item)"
                :type="item.status === 'completed' ? 'info' : 'success'"
                size="small"
                text
                @click="$emit('toggle-status', item)"
              >
                {{ item.status === 'completed' ? '重新打开' : '完成' }}
              </el-button>
              <el-button v-if="canEdit(item)" type="primary" size="small" text :icon="Edit" @click="$emit('edit', item)">
                编辑
              </el-button>
              <el-button v-if="canEdit(item)" type="danger" size="small" text :icon="Delete" @click="$emit('delete', item)">
                删除
              </el-button>
            </div>
          </div>
        </div>

        <div v-if="filteredItems.length > collapseThreshold" class="activity-list__footer">
          <el-button type="primary" link size="small" @click="toggleCollapsed">
            {{ isCollapsed ? `展开全部 (${filteredItems.length})` : '收起' }}
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
import { Plus, Edit, Delete, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/format'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

defineEmits(['add', 'edit', 'delete', 'toggle-status', 'refresh'])

const userStore = useUserStore()

const isAdmin = computed(() => userStore.user?.role === 'admin')
const canCreate = computed(() => true)

const collapseThreshold = 5
const isCollapsed = ref(true)
const onlyMine = ref(false)

const filteredItems = computed(() => {
  if (!onlyMine.value) return props.items
  return props.items.filter(item => item.ownerId === userStore.user?.id)
})

const visibleItems = computed(() => {
  const list = filteredItems.value
  if (!isCollapsed.value || list.length <= collapseThreshold) {
    return list
  }
  return list.slice(0, collapseThreshold)
})

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value
}

function canEdit(item) {
  return isAdmin.value || item.ownerId === userStore.user?.id
}

function priorityType(priority) {
  const map = { low: 'info', medium: 'warning', high: 'danger' }
  return map[priority] || 'info'
}

function priorityLabel(priority) {
  const map = { low: '低', medium: '中', high: '高' }
  return map[priority] || priority
}

function isOverdue(item) {
  return new Date(item.dueAt) < new Date()
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.activity-list {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  height: 100%;
  min-height: 460px;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__body {
    flex: 1;
    min-height: 120px;
    display: flex;
    flex-direction: column;
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
    border-top: 1px solid $border-color;
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
  background: #f9fafb;
  border: 1px solid transparent;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #e5e7eb;
    transform: translateX(2px);
  }

  &.is-overdue {
    border-left: 4px solid #f87171;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: $text-primary;
  }

  &__meta {
    font-size: 12px;
    color: $text-secondary;
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
