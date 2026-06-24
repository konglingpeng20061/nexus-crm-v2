<template>
  <BaseChart
    :option="option"
    :loading="loading"
    :empty="empty"
    empty-text="暂无合同数据"
    height="320px"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { formatWan } from '@/utils/format'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false }
})

const option = computed(() => {
  if (!props.data.length) return {}
  const months = props.data.map(d => d.month)
  const amounts = props.data.map(d => formatWan(d.amount))
  const counts = props.data.map(d => d.count)

  return {
    title: { text: '合同趋势（近12个月）', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: params => {
        const idx = params[0].dataIndex
        const item = props.data[idx]
        return `${item.monthName}<br/>金额：${item.amount} 元<br/>数量：${item.count} 份`
      }
    },
    legend: { data: ['合同金额（万元）', '合同数量'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { rotate: 30 }
    },
    yAxis: [
      {
        type: 'value',
        name: '金额（万元）',
        position: 'left'
      },
      {
        type: 'value',
        name: '数量',
        position: 'right'
      }
    ],
    series: [
      {
        name: '合同金额（万元）',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        data: amounts
      },
      {
        name: '合同数量',
        type: 'bar',
        yAxisIndex: 1,
        data: counts
      }
    ]
  }
})
</script>
