<template>
  <div class="metric-card" :class="`metric-card--${tone}`">
    <div class="metric-card__accent" />
    <div class="metric-card__content">
      <div class="metric-card__label">{{ label }}</div>
      <div class="metric-card__value" :title="String(value)">
        {{ value }}
      </div>
      <div v-if="description" class="metric-card__desc" :title="description">
        {{ description }}
      </div>
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
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &__accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: currentColor;
    opacity: 0.85;
  }

  &__content {
    padding-left: 8px;
  }

  &__label {
    font-size: 13px;
    color: #606266;
    margin-bottom: 6px;
    letter-spacing: 0.02em;
  }

  &__value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #303133;
  }

  &__desc {
    font-size: 12px;
    color: #909399;
    margin-top: 6px;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__footer {
    margin-top: auto;
    padding-top: 12px;
    padding-left: 8px;
    border-top: 1px solid #ebeef5;
    font-size: 12px;
    color: #909399;
  }

  &--primary { color: #409eff; }
  &--success { color: #67c23a; }
  &--warning { color: #e6a23c; }
  &--danger { color: #f56c6c; }
  &--info { color: #909399; }

  &--primary &__value { color: #409eff; }
  &--success &__value { color: #67c23a; }
  &--warning &__value { color: #e6a23c; }
  &--danger &__value { color: #f56c6c; }
  &--info &__value { color: #909399; }
}
</style>
