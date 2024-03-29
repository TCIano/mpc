<template>
  <a-spin size="large" :spinning="spinning">
    <div ref="comChart" :style="style" />
  </a-spin>
</template>

<script setup lang="ts">
  import { dispose, graphic } from 'echarts/core'
  import useEcharts from '@/hooks/useEcharts'
  import {
    ref,
    reactive,
    onMounted,
    computed,
    nextTick,
    onUpdated,
    onBeforeUnmount,
    withDefaults,
    watch,
    HTMLAttributes,
  } from 'vue'
  import { chartOption } from '@/types/echarts'
  import { isEmptyObject } from '@/utils/utils'
  interface Props {
    option: chartOption
    styleOp?: any
  }
  const props = withDefaults(defineProps<Props>(), {
    option: () => {
      return {}
    },
    styleOp: () => {
      return {}
    },
  })
  const style = ref<HTMLAttributes>(props.styleOp)
  const comChart = ref<HTMLDivElement | null>(null)
  const spinning = ref<Boolean>(true)

  watch(
    () => props.styleOp,
    (value) => {
      style.value = value
      nextTick(() => {
        echartInstance && echartInstance.resize()
      })
    }
  )
  watch(
    () => props.option,
    (value) => {
      if (isEmptyObject(value) && echartInstance) return disposeDom()
      if (echartInstance) {
        echartInstance.setOption(value)
      } else {
        init()
      }
    }
  )

  let echartInstance: any = null
  let timer: any = null
  const init = () => {
    //高度超过60才生成实
    echartInstance = useEcharts(comChart.value as HTMLDivElement)
    echartInstance.on('finished', () => {
      spinning.value = false
    })
    window.addEventListener('resize', () => {
      echartInstance.resize()
    })
    echartInstance.setOption(props.option)
    spinning.value = false
  }
  const disposeDom = () => {
    echartInstance && dispose(comChart.value as HTMLElement)
    echartInstance = null
  }
  defineExpose({ disposeDom })

  onMounted(() => {
    if (props.option.title) {
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
    echartInstance && disposeDom()
  })
</script>

<style scoped lang="less"></style>
