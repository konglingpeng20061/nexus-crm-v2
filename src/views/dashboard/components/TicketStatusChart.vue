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
  pending: '#f56c6c',
  processing: '#e6a23c',
  resolved: '#67c23a',
  closed: '#909399'
}

const option = computed(() => {
  if (!props.data.length) return {}

  return {
    title: { text: '工单状态分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: {
      trigger: 'item',
      formatter: params => {
        const item = props.data[params.dataIndex]
        return `${item.statusName}<br/>数量：${item.count}<br/>占比：${item.ratio}%`
      }
    },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        label: {
          formatter: '{b}: {c} ({d}%)'
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
