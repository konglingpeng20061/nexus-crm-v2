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

  return {
    title: { text: '销售漏斗', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: {
      trigger: 'item',
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
          formatter: '{b}: {c}'
        },
        data: sorted.map(d => ({
          name: d.stageName,
          value: d.count,
          amount: d.amount
        }))
      }
    ]
  }
})
</script>
