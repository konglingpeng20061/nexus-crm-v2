<template>
  <div ref="chartRef" class="base-chart" :style="{ height: typeof height === 'number' ? `${height}px` : height }">
    <div ref="echartsRef" class="base-chart__canvas" />
    <transition name="base-chart-fade">
      <div v-if="showOverlay" class="base-chart__overlay">
        <el-skeleton v-if="loading" animated />
        <el-empty v-else :description="emptyText" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import {
  FunnelChart,
  LineChart,
  BarChart,
  PieChart
} from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  FunnelChart,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer
])

const props = defineProps({
  option: { type: Object, default: () => null },
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无数据' },
  height: { type: [String, Number], default: 320 },
  notMerge: { type: Boolean, default: false }
})

const chartRef = ref(null)
const echartsRef = ref(null)
let chartInstance = null
let resizeObserver = null

const showOverlay = computed(() => props.loading || props.empty)

function initChart() {
  if (!echartsRef.value || chartInstance) return
  chartInstance = echarts.init(echartsRef.value)
  if (props.option) {
    chartInstance.setOption(props.option, props.notMerge)
  }
  resizeObserver = new ResizeObserver(() => {
    chartInstance && chartInstance.resize()
  })
  resizeObserver.observe(chartRef.value)
}

function updateChart() {
  if (!chartInstance) return
  if (props.empty || props.loading) {
    chartInstance.clear()
    return
  }
  if (props.option) {
    chartInstance.setOption(props.option, props.notMerge)
  }
}

function disposeChart() {
  if (resizeObserver && chartRef.value) {
    resizeObserver.unobserve(chartRef.value)
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

onMounted(() => {
  nextTick(initChart)
})

onBeforeUnmount(disposeChart)

watch(() => props.option, () => {
  nextTick(updateChart)
}, { deep: true })

watch(() => [props.empty, props.loading], () => {
  nextTick(updateChart)
})
</script>

<style lang="scss" scoped>
.base-chart {
  position: relative;
  width: 100%;
  min-height: 200px;

  &__canvas {
    width: 100%;
    height: 100%;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    z-index: 1;
  }
}

.base-chart-fade-enter-active,
.base-chart-fade-leave-active {
  transition: opacity 0.25s ease;
}

.base-chart-fade-enter-from,
.base-chart-fade-leave-to {
  opacity: 0;
}
</style>
