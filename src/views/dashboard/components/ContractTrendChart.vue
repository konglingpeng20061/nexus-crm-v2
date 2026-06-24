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
    backgroundColor: 'transparent',
    title: { text: '合同趋势（近12个月）', left: 'center', textStyle: { fontSize: 14, color: '#f3f4f6' } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      textStyle: { color: '#f3f4f6' },
      formatter: params => {
        const idx = params[0].dataIndex
        const item = props.data[idx]
        return `${item.monthName}<br/>金额：${item.amount} 元<br/>数量：${item.count} 份`
      }
    },
    legend: { data: ['合同金额（万元）', '合同数量'], bottom: 0, textStyle: { color: '#9ca3af' } },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { rotate: 30, color: '#9ca3af' },
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.08)' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.04)' } }
    },
    yAxis: [
      {
        type: 'value',
        name: '金额（万元）',
        position: 'left',
        nameTextStyle: { color: '#9ca3af' },
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.04)' } }
      },
      {
        type: 'value',
        name: '数量',
        position: 'right',
        nameTextStyle: { color: '#9ca3af' },
        axisLabel: { color: '#9ca3af' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '合同金额（万元）',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        itemStyle: { color: '#60a5fa' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(96, 165, 250, 0.35)' },
              { offset: 1, color: 'rgba(96, 165, 250, 0.02)' }
            ]
          }
        },
        data: amounts
      },
      {
        name: '合同数量',
        type: 'bar',
        yAxisIndex: 1,
        itemStyle: { color: '#06b6d4', borderRadius: [4, 4, 0, 0] },
        data: counts
      }
    ]
  }
})
</script>
