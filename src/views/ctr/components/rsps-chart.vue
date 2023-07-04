<template>
  <!-- <a-spin size="large" :spinning="spinning"> -->
  <div ref="comChart" :style="style || {}" />
  <!-- </a-spin> -->
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, computed, reactive, onBeforeUnmount } from 'vue'
  import { dispose, graphic } from 'echarts/core'
  import useEcharts from '@/hooks/useEcharts'
  import { chartOption } from '@/types/echarts'
  interface Props {
    option: number[]
    style: any
  }

  const props = withDefaults(defineProps<Props>(), {
    option: () => {
      return []
    },
    style: () => {
      return {}
    },
  })
  const comChart = ref<HTMLDivElement | null>(null)
  const spinning = ref<Boolean>(true)

  const xAxis = computed(() => {
    return props.option.map((item, index) => {
      return index
    })
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
        data: props.option,
      },
    ],
  })
  watch(
    () => props.option,
    () => {
      option.series[0].data = props.option
      echartInstance.setOption(option)
    }
  )
  let echartInstance: any = null
  const init = () => {
    echartInstance && dispose(comChart.value as HTMLElement)
    echartInstance = useEcharts(comChart.value as HTMLDivElement)
    window.addEventListener('resize', () => {
      echartInstance.resize()
    })
    echartInstance.setOption(option)
  }
  onMounted(() => {
    init()
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', () => {
      echartInstance.resize()
    })
  })
</script>

<style scoped lang="less"></style>
