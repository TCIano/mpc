<template>
  <div>
    <a-row v-for="(chunk, index) in dataChunks" :key="index" :warp="true">
      <div class="flex items-center">
        <span class="text-lg font-semibold text-red-500" style="writing-mode: vertical-lr"
          >MV{{ index }}</span
        >
      </div>
      <a-col v-for="(item, i) in chunk" :key="i">
        <div class="text-center">
          <span v-if="index === 0" class="text-lg font-semibold text-center text-red-500"
            >CV{{ i }}</span
          >
        </div>
        <Chart :styleOp="style" :series="item" />
      </a-col>
    </a-row>
    <!-- <img
      src="data:image/svg+xml,%3Csvg width='200' height='200'
    xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='12'
    fill='%23a2a9b6' font-family='system-ui, sans-serif' text-anchor='middle'
    dominant-baseline='middle' transform='rotate(-45, 100 100)'
    %3Eundefined%3C/text%3E%3C/svg%3E"
    /> -->
  </div>
</template>

<script setup lang="ts" name="ConfigCenter">
  import { ref, computed, getCurrentInstance, onMounted, onUnmounted } from 'vue'
  import { useTableHeight } from '@/hooks/table'
  import { debounce } from '@/utils/utils'
  import { chartOption } from '@/types/echarts'
  let base = +new Date(1968, 9, 3)
  let oneDay = 24 * 3600 * 1000
  let date = []
  let data = [Math.random() * 300]
  for (let i = 1; i < 300; i++) {
    var now = new Date((base += oneDay))
    date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'))
    data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]))
  }
  const dataList = ref<any>([
    /* ...100个元素 */
  ])
  const dataChunks = ref<chartOption[]>([])
  for (let index = 0; index < 30; index++) {
    if (index === 10) {
      dataList.value.push({
        date: [],
        data: [],
      })
    } else {
      dataList.value.push({
        date,
        data,
      })
    }
  }
  let itemWidth = ref()
  const style = ref()
  // const col = ref(Math.round(Math.sqrt(dataList.value.length)))
  const row = ref(5) //行数
  const col = ref(6) //列数
  const containHeight = ref()
  for (let i = 0; i < dataList.value.length; i += col.value) {
    dataChunks.value.push(dataList.value.slice(i, col.value + i))
  }
  /**
   *设置图表宽高
   */
  const setChartWidHei = () => {
    let mainCon = document.querySelector('.main-base-style') as Element
    itemWidth.value = mainCon?.getBoundingClientRect().width
    let mainPadd = window.getComputedStyle(mainCon, null).getPropertyValue('padding')
    style.value = {
      width: (itemWidth.value - parseFloat(mainPadd) - 35) / col.value + 'px', //35左边字体所占
      // minWidth: '100px',
      height: row.value === 1 ? '300px' : containHeight.value / row.value + 'px',
      margin: '0 auto',
    }
  }
  const setChartWidHeiDeb: any = debounce(setChartWidHei)
  window.addEventListener('resize', setChartWidHeiDeb)
  setChartWidHeiDeb()
  onMounted(async () => {
    // setChartWidHei()
    containHeight.value = await useTableHeight(getCurrentInstance())
  })
  onUnmounted(() => {
    window.removeEventListener('resize', setChartWidHeiDeb)
  })
</script>

<style scoped lang="less"></style>
