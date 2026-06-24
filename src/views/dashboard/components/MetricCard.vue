<template>
  <div class="metric-card" :class="`metric-card--${tone}`">
    <div class="metric-card__header">
      <span class="metric-card__label">{{ label }}</span>
      <span v-if="description" class="metric-card__desc" :title="description">
        {{ description }}
      </span>
    </div>
    <div class="metric-card__value" :title="String(value)">
      {{ value }}
    </div>
    <div v-if="$slots.footer" class="metric-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  description: { type: String, default: '' },
  tone: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'success', 'warning', 'danger', 'info'].includes(v)
  }
})
</script>

<style lang="scss" scoped>
.metric-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__label {
    font-size: 14px;
    color: #606266;
  }

  &__desc {
    font-size: 12px;
    color: #909399;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__footer {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
    font-size: 12px;
    color: #909399;
  }

  &--primary &__value { color: #409eff; }
  &--success &__value { color: #67c23a; }
  &--warning &__value { color: #e6a23c; }
  &--danger &__value { color: #f56c6c; }
  &--info &__value { color: #909399; }
}
</style>
