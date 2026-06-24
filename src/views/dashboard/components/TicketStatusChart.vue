<template>
  <BaseChart
    :option="option"
    :loading="loading"
    :empty="empty"
    empty-text="暂无工单数据"
    height="320px"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false }
})

const statusColors = {
  pending: '#f87171',
  processing: '#fbbf24',
  resolved: '#4ade80',
  closed: '#9ca3af'
}

const option = computed(() => {
  if (!props.data.length) return {}

  return {
    backgroundColor: 'transparent',
    title: { text: '工单状态分布', left: 'center', textStyle: { fontSize: 14, color: '#f3f4f6' } },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      textStyle: { color: '#f3f4f6' },
      formatter: params => {
        const item = props.data[params.dataIndex]
        return `${item.statusName}<br/>数量：${item.count}<br/>占比：${item.ratio}%`
      }
    },
    legend: { bottom: 0, textStyle: { color: '#9ca3af' } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        label: {
          formatter: '{b}: {c} ({d}%)',
          color: '#f3f4f6'
        },
        itemStyle: {
          borderColor: 'rgba(17, 24, 39, 0.8)',
          borderWidth: 2
        },
        data: props.data.map(d => ({
          name: d.statusName,
          value: d.count,
          itemStyle: { color: statusColors[d.status] || '#999' }
        }))
      }
    ]
  }
})
</script>
