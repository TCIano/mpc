<template>
  <a-spin size="large" :spinning="spinning">
    <div class="border-2 hover:border-red-400" ref="comChart" :style="styleOp" />
  </a-spin>
</template>

<script setup lang="ts">
  import { dispose, graphic } from 'echarts/core'
  import useEcharts from '@/hooks/useEcharts'
  import {
    ref,
    reactive,
    inject,
    onMounted,
    computed,
    onBeforeUnmount,
    withDefaults,
    watch,
  } from 'vue'
  import { chartOption } from '@/types/echarts'
  interface Props {
    series: any
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
  const dataSeries = computed(() => {
    return props.series.data?.datas
  })
  const xAxis = computed(() => {
    return props.series.date
  })
  const option = reactive({
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
      data: xAxis,
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
        data: dataSeries,
      },
    ],
  })
  watch(
    () => props.series.date,
    (value) => {
      if (echartInstance && value.length) {
        echartInstance.setOption(option)
      } else {
        init()
      }
    }
  )
  let echartInstance: any = null
  let timer: any = null
  const init = () => {
    echartInstance && dispose(comChart.value as HTMLElement)
    timer = setTimeout(() => {
      let height = parseFloat(props.styleOp.height)
      if (height >= 60) {
        //高度超过60才生成实例，小于60像素其实看到不到东西浪费性能
        echartInstance = useEcharts(comChart.value as HTMLDivElement)
        echartInstance.on('finished', () => {
          spinning.value = false
        })
        window.addEventListener('resize', () => {
          echartInstance.resize()
        })

        props.series.date.length && echartInstance.setOption(option)
      }
      spinning.value = false
    }, 1000)
  }

  onMounted(() => {
    if (props.series.date.length) {
      init()
    } else {
      spinning.value = false
    }
  })
  onBeforeUnmount(() => {
    clearTimeout(timer)
    window.removeEventListener('resize', () => {
      echartInstance.resize()
    })
    // echartInstance && dispose(comChart.value as HTMLElement)
  })
</script>

<style scoped lang="less"></style>
