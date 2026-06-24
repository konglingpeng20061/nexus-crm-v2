<template>
  <div class="metric-card" :class="`metric-card--${tone}`">
    <div class="metric-card__accent" />
    <div class="metric-card__content">
      <div class="metric-card__label">{{ label }}</div>
      <div v-if="loading" class="metric-card__skeleton">
        <el-skeleton animated :rows="0" />
      </div>
      <template v-else-if="error">
        <div class="metric-card__error">加载失败</div>
        <div v-if="description" class="metric-card__desc" :title="description">
          {{ description }}
        </div>
      </template>
      <template v-else>
        <div class="metric-card__value" :title="String(value)">
          {{ value }}
        </div>
        <div v-if="description" class="metric-card__desc" :title="description">
          {{ description }}
        </div>
      </template>
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
  },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.metric-card {
  position: relative;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
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
    color: $text-secondary;
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
    color: $text-primary;
  }

  &__desc {
    font-size: 12px;
    color: $text-muted;
    margin-top: 6px;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__skeleton {
    padding-top: 8px;

    :deep(.el-skeleton__item) {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  &__error {
    font-size: 20px;
    font-weight: 600;
    color: $danger-color;
    padding: 4px 0;
  }

  &__footer {
    margin-top: auto;
    padding-top: 12px;
    padding-left: 8px;
    border-top: 1px solid $border-color;
    font-size: 12px;
    color: $text-muted;
  }

  &--primary { color: #60a5fa; }
  &--success { color: #4ade80; }
  &--warning { color: #fbbf24; }
  &--danger { color: #f87171; }
  &--info { color: #9ca3af; }

  &--primary &__value { color: #60a5fa; }
  &--success &__value { color: #4ade80; }
  &--warning &__value { color: #fbbf24; }
  &--danger &__value { color: #f87171; }
  &--info &__value { color: #9ca3af; }
}
</style>
