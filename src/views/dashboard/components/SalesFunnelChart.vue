<template>
  <BaseChart
    :option="option"
    :loading="loading"
    :empty="empty"
    empty-text="暂无商机数据"
    height="320px"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { formatCurrency, formatNumber } from '@/utils/format'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false }
})

const option = computed(() => {
  if (!props.data.length) return {}
  const sorted = [...props.data].sort((a, b) => {
    const order = ['lead', 'qualification', 'proposal', 'negotiation', 'closed']
    return order.indexOf(a.stage) - order.indexOf(b.stage)
  })

  const colors = ['#60a5fa', '#3b82f6', '#06b6d4', '#22d3ee', '#34d399']

  return {
    backgroundColor: 'transparent',
    title: { text: '销售漏斗', left: 'center', textStyle: { fontSize: 14, color: '#f3f4f6' } },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      textStyle: { color: '#f3f4f6' },
      formatter: params => {
        const item = sorted[params.dataIndex]
        return `${item.stageName}<br/>数量：${formatNumber(item.count)}<br/>预计金额：${formatCurrency(item.amount)}`
      }
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        width: '80%',
        min: 0,
        max: Math.max(...sorted.map(d => d.count), 1),
        label: {
          show: true,
          formatter: '{b}: {c}',
          color: '#f3f4f6'
        },
        itemStyle: {
          borderColor: 'rgba(17, 24, 39, 0.8)',
          borderWidth: 2
        },
        data: sorted.map((d, index) => ({
          name: d.stageName,
          value: d.count,
          amount: d.amount,
          itemStyle: { color: colors[index % colors.length] }
        }))
      }
    ]
  }
})
</script>
