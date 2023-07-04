<template>
  <a-row :gutter="5">
    <a-col :md="5" :sm="9" :xs="11">
      <a-card
        :style="{ height: treeHeight + 'px' }"
        :bodyStyle="{ padding: '5px' }"
        :headerStyle="{ padding: '5px' }"
      >
        <prj-item
          ref="prjItem"
          @on-load-node="onLoadNode"
          @on-un-load-node="onUnLoadNode"
        ></prj-item>
      </a-card>
    </a-col>
    <a-col :md="19" :sm="15" :xs="13">
      <!-- <div class="right-top-title" ref="topV">
        <a-row :gutter="[10, 10]">
          <a-col :md="8" :sm="12" :xs="24" v-for="item in 3">
            <div
              class="flex items-center justify-between w-full h-28 pl-7 pr-7 bg-gradient-to-r from-blue-200 to-blue-400"
            >
              <div class="flex-wrap justify-items-center">
                <div class="mb-1 text-lg font-thin text-white">工程总数</div>
                <div class="text-2xl font-medium text-white">4</div>
              </div>
              <div class="w-12 h-12 bg-black"></div>
            </div>
          </a-col>
        </a-row>
      </div> -->
      <a-row :gutter="5">
        <a-col :md="19" :sm="15" :xs="13">
          <table-header ref="tableHeaderRef">
            <template #top-left>
              <a-radio-group v-model:value="status" @change="onSelectState" size="small">
                <a-radio-button v-for="item in stateMap" :key="item.key" :value="item.key"
                  >{{ item.name }}({{ item.value }})</a-radio-button
                >
              </a-radio-group>
            </template>
            <template #top-right>
              <a-button type="primary" size="small" @click="clearLogs">清除日志</a-button>
            </template>
          </table-header>
          <table-body ref="tableBody">
            <!-- <div class="auto-scroll" :style="{ height: cardGridHei + 'px', padding: '5px' }">
              <cardItem />
            </div> -->
            <a-table
              :loading="tableLoading"
              :data-source="tableData"
              :columns="tableColumns"
              :pagination="true"
              :bordered="true"
              :rowKey="rowKey"
              :scroll="{ y: tableHeight, x: 'max-content' }"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'name'">
                  <a href="" @click.prevent="onToCtrOnline(record.name, record.serviceURL)">{{
                    record.name
                  }}</a>
                </template>
                <template v-if="column.key === 'time'">
                  {{ record.properties[0]?.value || '' }}
                </template>
                <template v-if="column.key === 'actions'">
                  <a-space size="middle">
                    <div title="运行" v-if="record.state === 2">
                      <play-circle-outlined
                        class="text-lg cursor-pointer"
                        @click="onButtonOption(record, 'run')"
                      />
                    </div>
                    <div title="停止" v-if="record.state === 3">
                      <pause-circle-outlined
                        class="text-lg cursor-pointer"
                        @click="onButtonOption(record, 'stop')"
                      />
                    </div>
                    <div title="卸载">
                      <poweroff-outlined
                        class="text-lg cursor-pointer"
                        @click="() => onUnLoadNode(record)"
                      />
                    </div>
                    <div title="重新加载">
                      <reload-outlined
                        class="text-lg cursor-pointer"
                        @click="onButtonOption(record, 'reload')"
                      />
                    </div>
                    <div title="启动MPC在线监控">
                      <line-chart-outlined
                        class="text-lg cursor-pointer"
                        @click="onToCtrOnline(record.name, record.serviceURL)"
                      />
                    </div>
                  </a-space>
                </template>
              </template>
            </a-table>
          </table-body>
          <!-- <table-footer ref="tableFooterRef"></table-footer> -->
        </a-col>
        <a-col :md="5" :sm="9" :xs="11">
          <a-card
            class="auto-scroll"
            :style="{ height: treeHeight + 'px' }"
            :bodyStyle="{ padding: '10px' }"
            :headerStyle="{ padding: '5px' }"
          >
            <div v-for="(item, i) in logList" :key="i">
              <span>{{ item }}</span>
              <!-- <a-divider /> -->
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-col>
  </a-row>
</template>

<script setup lang="ts" name="Personal">
  import {
    ref,
    onMounted,
    getCurrentInstance,
    ComponentInternalInstance,
    onBeforeUnmount,
    onUpdated,
    watch,
    reactive,
    nextTick,
  } from 'vue'
  import { MPC_HUB, CPM_HUB } from '@/api/modules'
  import { useRouter } from 'vue-router'
  import { usePagination, useRowKey, useTable, useTableHeight, useTableColumn } from '@/hooks/table'
  import { debounce } from '@/utils/utils'
  import {
    SignalrCls,
    NOTIFY_PRJ_OPERATION_RESULT,
    NOTIFY_PRJ_STATE_CHANGED,
  } from '@/types/signalR'
  import SignalR from '@/utils/signalR'
  import PrjItem from './components/prj-item.vue'
  import {
    getPrjsApi,
    loadPrjApi,
    reloadPrjApi,
    runPrjApi,
    stopPrjApi,
    unloadPrjApi,
    getLogsApi,
    clearLogsApi,
  } from '@/api/modules'
  import { PrjsRes } from '@/types/apis/ctr/prjs'
  import { getPrjNodeTreeApi } from '@/api/modules/ctr/nodes'
  import { NOTIFY_PRJ_ONLINE_DATAS_CHANGED } from '@/types/signalR'
  import { NOTIFY_PRJ_OVERVIEW } from '@/types/signalR'
  import useMpcStore from '@/store/modules/mpc'
  import dayjs from 'dayjs'
  const mpcStore = useMpcStore()
  interface signaRType {
    run: string
    load: string
    reload: string
    stop: string
    unload: string
  }
  const totalLength = ref(0)
  const loadingLength = ref(0)
  const loadedLength = ref(0)
  const stateMap = ref([
    {
      key: 5,
      name: '全部',
      value: totalLength,
    },
    {
      key: 3,
      name: '正在运行',
      value: loadingLength,
    },
    {
      key: 2,
      name: '已加载',
      value: loadedLength,
    },
  ])
  const router = useRouter()
  const { tableHeight, tableLoading, dataList: tableData, handleSuccess } = useTable()
  const prjItem = ref<InstanceType<typeof PrjItem>>()
  const rowKey = useRowKey('id')
  const tableColumns = useTableColumn(
    [
      {
        title: '控制器名称',
        key: 'name',
        dataIndex: 'name',
      },
      {
        title: '描述',
        key: 'desc',
        dataIndex: 'desc',
      },
      {
        title: '文件地址',
        key: 'fileURL',
        dataIndex: 'fileURL',
      },
      {
        title: '最后一次运行时间',
        key: 'time',
        // dataIndex: 'fileURL',
      },
      {
        title: '操作',
        key: 'actions',
        width: 150,
      },
    ],
    {
      align: 'center',
    }
  )
  const loadRes: any = ref([])

  let signalR: SignalrCls
  const signaRType: signaRType = {
    run: '运行成功',
    load: '加载成功',
    stop: '停止运行',
    reload: '重新加载成功',
    unload: '卸载成功',
  }
  const status = ref<number>(5)
  const treeHeight = ref()
  const logList = ref<string[]>([])
  //按钮
  const onButtonOption = async ({ name, type, fileURL }: PrjsRes, tag: string) => {
    const options = { name, type }
    if (tag === 'run') {
      await runPrjApi(options)
      logList.value.push(name + '正在加载' + '--' + dayjs().format('YYYY-MM-DD HH:mm:ss'))
    } else if (tag === 'stop') {
      await stopPrjApi(options)
      logList.value.push(name + '正在停止' + '--' + dayjs().format('YYYY-MM-DD HH:mm:ss'))
    } else if (tag === 'reload') {
      await reloadPrjApi(options)
      logList.value.push(name + '正在重新加载' + '--' + dayjs().format('YYYY-MM-DD HH:mm:ss'))
    }
    // prjItem.value?.getPrjNodeTree()
    // getPrjs(Number(status.value))
  }
  const signalRloadRes = (data: any) => {
    console.log(data)

    const state = data.state
    const hasCurr = loadRes.value.some((item: any) => item.name === data.name)
    if (state === 2 && !hasCurr) {
      loadRes.value.push({ ...data })
    } else if (state === 2 || state === 3) {
      loadRes.value.forEach((item: any) => {
        if (item.pid === data.pID) {
          item.state = data.state
          item.desc = data.desc
          item.fileURL = data.fileURL
          item.fileName = data.fileName || ''
          item.properties = data.properties
          item.serviceURL = data.serviceURL
          item.type = data.type || ''
        }
      })
    }
    handleSuccess(loadRes.value)
  }
  function convertKeysToLower(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }
    const result: any = Array.isArray(obj) ? [] : {}
    for (const key in obj) {
      const newKey = key.charAt(0).toLowerCase() + key.slice(1)
      result[newKey] = convertKeysToLower(obj[key])
    }
    return result
  }
  //获取日志
  const getLogs = async () => {
    mpcStore.saveUrl(
      import.meta.env.MODE === 'development' ? 'http://192.168.0.49:62102' : window.origin
    )
    signalR = new SignalR(CPM_HUB)
    // signalR.onMessageReceived(NOTIFY_PRJ_STATE_CHANGED, (res: string) => {
    //   const { data } = JSON.parse(res)
    //   console.log('change')
    //   signalRloadRes(data)
    // })
    signalR.onMessageReceived(
      NOTIFY_PRJ_OPERATION_RESULT,
      (type: keyof signaRType, res: string) => {
        const { data, result, errMsg } = JSON.parse(res)
        if (result) {
          signalRloadRes(convertKeysToLower(data))
          logList.value.push(
            data.Name + ' : ' + signaRType[type] + '--' + dayjs().format('YYYY-MM-DD HH:mm:ss')
          )
          handleState(loadRes.value, 5)
        } else {
          logList.value.push(
            data.Name + ' : ' + errMsg + '--' + dayjs().format('YYYY-MM-DD HH:mm:ss')
          )
        }
      }
    )

    await signalR.start()
    // const res = await getLogsApi()
  }
  const clearLogs = async () => {
    // await clearLogsApi()
    logList.value = []
  }
  //控制器在线
  const onToCtrOnline = (name: string = '', serviceURL: any) => {
    router.push({
      name: 'CtrTpl',
      query: {
        title: encodeURIComponent('在线 - ' + name),
        name,
        type: 'online',
        serviceURL: encodeURIComponent(serviceURL),
      },
    })
  }
  //过滤状态
  const onSelectState = (value: string) => {
    getPrjs(Number(status.value))
  }
  //加载节点
  const onLoadNode = async ({ name, type, fileURL }: any) => {
    await loadPrjApi({
      name,
      type,
      fileURL,
    })
    logList.value.push(name + '正在加载...' + '--' + dayjs().format('YYYY-MM-DD HH:mm:ss'))
    //重新加载页面
    // await getPrjs(Number(status.value))
    // prjItem.value?.getPrjNodeTree()
  }
  //卸载节点
  const onUnLoadNode = async ({ name, type, fileURL }: any) => {
    await unloadPrjApi({
      name,
      type,
      fileURL,
    })
    logList.value.push(name + '正在卸载...' + '--' + dayjs().format('YYYY-MM-DD HH:mm:ss'))
    //重新加载页面
    const index = loadRes.value.findIndex((item: any) => item.name === name)
    loadRes.value.splice(index, 1)
  }
  /**
   * 设置元素高度
   */

  /**
   * 防抖
   */
  const handleState = (res: any, state?: any) => {
    const currentState = res.filter((item: PrjsRes) => item.state === state)
    totalLength.value = res.filter((item: PrjsRes) => item.state).length
    loadingLength.value = res.filter((item: PrjsRes) => item.state === 3).length
    loadedLength.value = res.filter((item: PrjsRes) => item.state === 2).length
    loadRes.value = []
    if (state === 5) {
      loadRes.value = res.filter((item: PrjsRes) => item.state)
    } else {
      loadRes.value = currentState
    }
  }
  //获取工程
  const getPrjs = async (state?: number, prjType?: string) => {
    const res = await getPrjsApi()
    handleState(res, state)
    handleSuccess(loadRes.value)
  }

  onMounted(async () => {
    treeHeight.value = document.querySelector('.main-section')?.getBoundingClientRect().height
    tableHeight.value = (await useTableHeight(getCurrentInstance())) as number
    getPrjs(5)
    getLogs()
  })
  onBeforeUnmount(async () => {
    await signalR.stop()
  })
</script>

<style scoped lang="less">
  .ball {
    width: 20px;
    height: 20px;
    display: block;
    background: black;
    border-radius: 50%;
    margin: 0;
    background: radial-gradient(circle at 100px 100px, #d0eccc, #6be7a3);
  }
</style>
