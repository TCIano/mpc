<template>
  <tree-menu-layout>
    <template #leftContent>
      <div class="flex items-center space-x-1">
        <plus-circle-outlined class="text-2xl option-button" @click="onAddTrend" />
        <minus-circle-outlined class="text-2xl option-button" @click="onDeleteTrend" />
        <a-select class="w-full" v-model:value="trendSize" @change="onSizeChange">
          <a-select-option v-for="(item, i) in trendSizeOptions" :key="i" :value="item.value">{{
            item.name
          }}</a-select-option>
        </a-select>
      </div>
      <div>
        <a-tree
          v-if="treeData?.length"
          v-model:selectedKeys="selectedKeys"
          :tree-data="treeData"
          :field-names="fieldNames"
          :default-expand-all="true"
          show-icon
          @select="onselect"
        >
          <template #icon="{ key, selected }">
            <line-chart-outlined v-if="key !== '预测控制1'" />
          </template>
        </a-tree>
      </div>
    </template>
    <template #centerContent>
      <a-row v-for="(chunk, index) in dataChunks" :key="index" :warp="true">
        <a-col v-for="(item, i) in chunk" :key="i">
          <div
            :style="style"
            class="border-2 hover:border-red-400"
            :class="borderStyle.x === index && borderStyle.y === i ? 'border-red-400' : ''"
            @click="onClickGrid(index, i, $event)"
          >
            <basic-chart ref="chart" :styleOp="style" :option="item" />
          </div>
        </a-col>
      </a-row>
    </template>
  </tree-menu-layout>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
  import TreeMenuLayout from '@/layouts/TreeMenuLayout.vue'
  import { debounce, isEmptyObject } from '@/utils/utils'
  import { CPM_HUB, getTrendUnitsApi } from '@/api/modules'
  import { useRoute } from 'vue-router'
  import SignalR from '@/utils/signalR'
  import { message, type TreeProps } from 'ant-design-vue'
  import { NOTIFY_TREND_DATAS_CHANGED, SignalrCls } from '@/types/signalR'
  import { AntTreeNodeSelectedEvent } from 'ant-design-vue/es/tree'
  import { chartOption } from '@/types/echarts'
  import { lineName, signalRTrendDatas, trendDatas } from '@/types/apis/dpc/mpc'
  import dayjs from 'dayjs'
  import { useTableHeight } from '@/hooks/table'
  import useMpcStore from '@/store/modules/mpc'
  interface lineData {
    name: lineName
    isHistory: boolean
    datas: number[] | any
    color: string
    width: number
    isDashBrush: boolean
  }
  interface TreeNode {
    key?: string | number
    name?: string
    lines?: lineData[]
    fullName?: string
    enableAutoLimit?: boolean
    hiLimit?: number
    loLimit?: number
    children?: TreeNode[]
  }
  interface Model {
    inputName: string
    outputName: string
    integralFlag: any
    delay: string
    policy: string
    policyRange: string[]
    tagName: string
    rawK: number
    curK: number
    hiLimit: number
    lowLimit: number
    datas: number[]
  }
  //   const props = defineProps<{

  //     models: Model[]
  //   }>()
  const chart = ref<any>()
  const mpcStore = useMpcStore()
  let models = ref<TreeNode[]>([])
  let signalR: SignalrCls
  const getTrendRealTimeData = () => {
    mpcStore.saveUrl(decodeURIComponent(route.query.serverUrl as string))
    signalR = new SignalR() as SignalrCls
    signalR.onMessageReceived(NOTIFY_TREND_DATAS_CHANGED, (res: string) => {
      const trend: signalRTrendDatas = JSON.parse(res)
      if (trend.result) {
        const baseTime = trend.data.baseTime
        const period = trend.data.period
        const filterTrend = trend.data.trendDatas.map((item: trendDatas, i: number) => {
          const curr = treeData.value?.[0].children?.find((tree) => tree.name === item.Name)
          return {
            ...curr,
            hiLimit: curr?.hiLimit,
            loLimit: curr?.loLimit,
            lines:
              curr?.lines?.map((line: lineData) => {
                const currLine = item.Lines.find((trendLine) => trendLine.Name === line.name)
                let currBeforTime: string[] = []
                let currafterTime: string[] = []
                const currData = currLine?.Datas.map((newL, i) => {
                  if (line.isHistory) {
                    //是历史记录根据 baseTime 计算出来历史记录的时间数组
                    for (let index = 0; index < currLine.Datas.length * period; index += period) {
                      currBeforTime.push(
                        dayjs(baseTime).subtract(index, 's').format('YYYY-MM-DD HH:mm:ss')
                      )
                    }
                    return [currBeforTime.reverse()[i] || '', newL]
                  } else {
                    for (let index = 0; index < currLine.Datas.length * period; index += period) {
                      currafterTime.push(
                        dayjs(baseTime).add(index, 's').format('YYYY-MM-DD HH:mm:ss')
                      )
                    }
                    return [currafterTime[i] || '', newL]
                  }
                })
                return { ...line, datas: currData }
              }) || [],
          }
        })
        // setAllTrendValue(filterTrend)
        forDataList(filterTrend, baseTime)
      }
    })
  }
  const forDataList = (filterTrend: any, time: string) => {
    dataList.value.forEach((item: any, i: number) => {
      const isHasOccupy = filterTrend.find((t: any) => t.fullName === item?.title?.text) //可选连必须加，因为刚开始每一项是空的
      if (isHasOccupy) {
        let option = {
          title: {
            text: isHasOccupy.fullName,
          },
          tooltip: {
            trigger: 'axis',
          },
          legend: {
            top: '10%',
            data: isHasOccupy.lines?.map((item: any) => item.name),
          },
          grid: {
            top: '25%',
            bottom: '10%',
          },
          xAxis: {
            type: 'time',
            axisLabel: {
              formatter: '{mm}:{ss}',
            },
          },
          yAxis: {
            type: 'value',
          },
          series: isHasOccupy.lines?.map((item: any) => {
            return {
              name: item.name,
              data: item.datas,
              type: 'line',
              symbol: 'none',
              smooth: true,
              markLine: {
                symbol: 'none',
                data: [{ xAxis: time }],
                lineStyle: {
                  color: '#999',
                  type: 'dashed',
                },
              },
              lineStyle: {
                type: item.isDashBrush ? 'dashed' : 'solid',
                color: 'rgba' + item.color,
                width: item.width,
              },
              itemStyle: {
                color: 'rgba' + item.color,
              },
            }
          }),
        }
        dataList.value[i] = option
        reSizeDataChunks()
      }
    })
  }
  let trendSizeOptions: any[] = []
  let i = 2
  let j = 2
  let max = 5
  const route = useRoute()
  const prjName = route.query.title || ''
  const row = ref(2) //行数
  const col = ref(2) //列数
  let dataList = ref<any>([
    /* ...100个元素 */
  ])
  const dataChunks = ref<any[]>([])
  const mapSize = () => {
    for (let x = i; x <= max; x++) {
      for (let y = j; y <= max; y++) {
        trendSizeOptions.push({
          name: x + 'x' + y,
          value: x + 'x' + y,
        })
      }
    }

    const newDataList = new Array(row.value * col.value).fill({})
    console.log(newDataList)

    for (let index = 0; index < newDataList.length; index++) {
      if (newDataList.length > dataList.value.length) {
        newDataList[index] = dataList.value[index]
      } else {
        const mapDataList = dataList.value.filter((item: any) => item?.title?.text)
        newDataList[index] = mapDataList[index]
      }
    }

    dataList.value = newDataList
    /**
     * youwenti!!!!
     */
    // 清除实例
    // dataList.value.forEach((item: any, i: number) => {
    //   chart.value && chart.value[i]?.disposeDom()
    // })
    reSizeDataChunks()
  }
  const borderStyle = ref<{
    x: null | number
    y: null | number
  }>({
    x: null,
    y: null,
  })
  const onClickGrid = (x: number, y: number, e: Event) => {
    borderStyle.value.x = x
    borderStyle.value.y = y
  }

  const reSizeDataChunks = () => {
    dataChunks.value = []
    for (let i = 0; i < dataList.value.length; i += col.value) {
      dataChunks.value.push(dataList.value.slice(i, col.value + i))
    }
  }
  const reSetValue = () => {
    trendSizeOptions = []
    // dataList.value = []
  }
  //添加趋势
  const onAddTrend = () => {
    if (isEmptyObject(option.value)) return message.warning('请选择模型')
    const x = borderStyle.value.x!
    const y = borderStyle.value.y!
    const index = x === null || y === null ? '' : !x ? y : x * col.value + y
    dataList.value.splice(
      index !== '' ? index : dataList.value.findIndex((item: chartOption) => !item?.title),
      1,
      option.value
    )

    reSizeDataChunks()
    borderStyle.value = {
      x: null,
      y: null,
    }
    option.value = {}
  }
  const onDeleteTrend = () => {
    const x = borderStyle.value.x!
    const y = borderStyle.value.y!
    const index = x === null || y === null ? '' : !x ? y : x * col.value + y
    chart.value[index].disposeDom()
    dataList.value.splice(index, 1, {})
    reSizeDataChunks()
    borderStyle.value = {
      x: null,
      y: null,
    }
  }
  //改变布局
  const onSizeChange = (value: string) => {
    const splitValue = value.split('x')
    reSetValue()
    row.value = parseInt(splitValue[0])
    col.value = parseInt(splitValue[1])
    setChartWidHei()
    mapSize()
  }
  const trendSize = ref<string>('2x2')
  const autoExpandParent: boolean = true
  const selectedKeys = ref<string[]>()
  const treeData = ref<TreeNode[]>()
  const fieldNames: TreeProps['fieldNames'] = {
    title: 'name',
    key: 'name',
  }
  const setAllTrendValue = (res: any) => {
    models.value = res
    treeData.value = [
      {
        name: '预测控制1',
        key: '预测控制1',
        children: models.value,
      },
    ]
  }
  //获取单元集合趋势
  const getAllTrend = async () => {
    const res = await getTrendUnitsApi(
      prjName as string,
      decodeURIComponent(route.query.serverUrl as string)
    )
    setAllTrendValue(res)
  }

  let option: chartOption | any = ref({})

  const handleChartData = (selectedNodesName: TreeNode) => {
    const currentData = models.value?.filter(
      (item) => item.name === selectedNodesName
    )[0] as TreeNode
    let o = {
      title: {
        text: currentData.fullName,
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        top: '10%',
        data: currentData.lines?.map((item) => item.name),
      },
      grid: {
        top: '25%',
        bottom: '10%',
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: '{mm}:{ss}',
        },
      },
      yAxis: {
        type: 'value',
      },
      series: currentData.lines?.map((item) => {
        return {
          name: item.name,
          data: item.datas,
          type: 'line',
          symbol: 'none',
          lineStyle: {
            type: item.isDashBrush ? 'dashed' : 'solid',
            color: 'rgba' + item.color,
            width: item.width,
          },
          itemStyle: {
            color: 'rgba' + item.color,
          },
          markLine: {
            data: [{ xAxis: dayjs().format('YYYY-MM-DD HH:mm:ss') }],
            lineStyle: {
              color: '#999',
              type: 'dashed',
            },
          },
          smooth: true,
        }
      }),
    }
    option.value = o
  }
  const handleTimeDate = () => {}
  const onselect = (key: string[], { selected, selectedNodes }: AntTreeNodeSelectedEvent) => {
    handleChartData(selectedNodes?.[0].name as any)
  }
  let containWidth = ref()
  const style = ref()
  const containHeight = ref()
  const setChartWidHei = () => {
    let mainPadd = 50 //cardbody-padding
    let mainCon = document.querySelector('.main-section') as Element
    let treeMenuW = (mainCon?.getBoundingClientRect().width / 24) * 4
    containWidth.value = mainCon?.getBoundingClientRect().width - treeMenuW - mainPadd * 1.5
    style.value = {
      width: containWidth.value / col.value + 'px',
      height: (containHeight.value - mainPadd) / row.value + 'px',
    }
  }
  const setChartWidHeiDeb: any = debounce(setChartWidHei)
  window.addEventListener('resize', setChartWidHeiDeb)
  setChartWidHeiDeb()

  onMounted(async () => {
    containHeight.value = await useTableHeight(getCurrentInstance())
    mapSize()

    getAllTrend()
    getTrendRealTimeData()
    await signalR.start()
  })
  onBeforeUnmount(async () => {
    await signalR.stop()
    window.removeEventListener('resize', setChartWidHeiDeb)
  })
</script>

<style scoped lang="less">
  .option-button {
    cursor: pointer;
    &:hover {
      color: #4dabf7;
    }
  }
</style>
