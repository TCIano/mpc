<template>
  <a-spin size="large" :spinning="spinning">
    <div class="border-2" ref="comChart" :style="styleOp" />
  </a-spin>
</template>

<script setup lang="ts">
  import { dispose, graphic } from 'echarts/core'
  import useEcharts from '@/hooks/useEcharts'
  import { ref, reactive, inject, onMounted, onBeforeUnmount, withDefaults } from 'vue'
  import { chartOption } from '@/types/echarts'
  interface Props {
    series: chartOption
    styleOp?: any
  }
  // const props = defineProps(['series', 'styleOp'])
  const props = withDefaults(defineProps<Props>(), {
    series: () => {
      return {}
    },
    styleOp: () => {
      return {}
    },
  })
  const comChart = ref<HTMLDivElement | null>(null)
  const spinning = ref<Boolean>(true)

  const option = {
    tooltip: {
      trigger: 'axis',
      position: function (pt: any) {
        return [pt[0], '10%']
      },
    },
    title: {
      left: 'center',
    },
    grid: {
      top: 10,
      bottom: 30,
      left: 30,
      right: 20,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.series.date,
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
    },
    series: [
      {
        name: 'date',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
          color: 'rgb(255, 70, 131)',
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 158, 68)',
            },
            {
              offset: 1,
              color: 'rgb(255, 70, 131)',
            },
          ]),
        },
        data: props.series.data,
      },
    ],
  }
  const init = () => {
    setTimeout(() => {
      let height = parseFloat(props.styleOp.height)
      if (height >= 60) {
        //高度超过60才生成实例，小于60像素其实看到不到东西浪费性能
        const echartInstance = useEcharts(comChart.value as HTMLDivElement)
        echartInstance.on('finished', () => {
          spinning.value = false
        })
        window.addEventListener('resize', () => {
          echartInstance.resize()
        })
        echartInstance.setOption(option)
      }
      spinning.value = false
    }, 1000)
  }
  onMounted(() => {
    init()
  })
  onBeforeUnmount(() => {
    dispose(comChart.value as HTMLElement)
    window.removeEventListener('resize', () => {})
  })
</script>

<style scoped lang="less"></style>
