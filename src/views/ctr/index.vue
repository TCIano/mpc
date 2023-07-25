<template>
  <div class="ctr__inner">
    <a-row type="flex">
      <a-col :md="5">
        <a-card
          :style="{ height: treeHeight + 'px', minWidth: '220px' }"
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
      <a-col :md="19">
        <div class="flex flex-col justify-between h-full">
          <div>
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
              <a-table
                :loading="tableLoading"
                :data-source="tableData"
                :columns="tableColumns"
                :pagination="true"
                :bordered="true"
                :rowKey="rowKey"
                :scroll="{ y: tableHeight - 250, x: 930 }"
              >
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'name'">
                    <a
                      href=""
                      @click.prevent="
                        record.type === 'mpc'
                          ? onToCtrOnline(record.name, record.serviceURL, record.state)
                          : ''
                      "
                      >{{ record.name }}</a
                    >
                  </template>
                  <template v-if="column.key === 'type'">
                    <a-tag size="small" :color="prjsTypeColor[record.type as PrjsType]">
                      {{ record.type }}
                    </a-tag>
                  </template>
                  <template v-if="column.key === 'state'">
                    <a-tag size="small" :color="record.state === 2 ? 'error' : 'success'">
                      {{ record.state === 2 ? '已加载' : '正在运行' }}
                    </a-tag>
                  </template>
                  <template v-if="column.key === 'time'">
                    {{ record.properties[0]?.value || '' }}
                  </template>
                  <template v-if="column.key === 'actions'">
                    <a-space size="large">
                      <div title="运行" v-if="record.state === 2">
                        <caret-right-outlined
                          class="text-xl cursor-pointer"
                          @click="onButtonOption(record, 'run')"
                        />
                      </div>
                      <div title="停止" v-if="record.state === 3">
                        <pause-outlined
                          class="text-xl cursor-pointer"
                          @click="onButtonOption(record, 'stop')"
                        />
                      </div>
                      <div title="卸载">
                        <poweroff-outlined
                          class="text-xl cursor-pointer"
                          @click="() => onUnLoadNode(record)"
                        />
                      </div>
                      <div title="重新加载">
                        <reload-outlined
                          class="text-xl cursor-pointer"
                          @click="onButtonOption(record, 'reload')"
                        />
                      </div>
                      <div title="启动MPC在线监控" v-if="record.type === 'mpc'">
                        <line-chart-outlined
                          class="text-xl"
                          @click="onToCtrOnline(record.name, record.serviceURL, record.state)"
                        />
                      </div>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </table-body>
            <!-- <table-footer ref="tableFooterRef"></table-footer> -->
          </div>
          <div class="ctr-table">
            <a-dropdown :trigger="['contextmenu']">
              <a-card hoverable :style="{ height: '210px' }" :bodyStyle="{ padding: '0px' }">
                <a-table
                  :columns="logColumns"
                  :pagination="false"
                  size="small"
                  :data-source="logList"
                  :scroll="{ y: 170 }"
                >
                </a-table>
              </a-card>
              <template #overlay>
                <a-menu @click="clearLogs">
                  <a-menu-item key="clearLog">
                    <clear-outlined />
                    <a-divider type="vertical" />
                    清除日志</a-menu-item
                  >
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="Personal">
  import {
    ref,
    onMounted,
    getCurrentInstance,
    ComponentInternalInstance,
    onBeforeUnmount,
  } from 'vue'
  import { CPM_HUB } from '@/api/modules'
  import { useRouter } from 'vue-router'
  import { useRowKey, useTable, useTableHeight, useTableColumn } from '@/hooks/table'
  import { SignalrCls, NOTIFY_PRJ_OPERATION_RESULT } from '@/types/signalR'
  import SignalR from '@/utils/signalR'
  import PrjItem from './components/prj-item.vue'
  import {
    getPrjsApi,
    loadPrjApi,
    reloadPrjApi,
    runPrjApi,
    stopPrjApi,
    unloadPrjApi,
  } from '@/api/modules'
  import store from '@/store'
  import { PrjsRes, prjsTypeColor, PrjsType } from '@/types/apis/ctr/prjs'
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
        width: 180,
        ellipsis: true,
      },
      {
        title: '工程类型',
        key: 'type',
        dataIndex: 'type',
        width: 120,
      },
      {
        title: '状态',
        key: 'state',
        dataIndex: 'state',
        width: 120,
      },
      {
        title: '最后一次运行时间',
        key: 'time',
      },
      {
        title: '操作',
        key: 'actions',
        width: 280,
      },
    ],
    {
      align: 'center',
    }
  )
  const logColumns = useTableColumn([
    {
      title: '时间',
      key: 'time',
      dataIndex: 'time',
      width: 200,
      defaultSortOrder: 'descend',
      sorter: {
        compare: (a: any, b: any) => dayjs(a.time).unix() - dayjs(b.time).unix(),
      },
    },
    {
      title: '事件',
      key: 'event',
      dataIndex: 'event',
    },
  ])
  const loadRes: any = ref([])
  const currentTime = () => dayjs().format('YYYY-MM-DD HH:mm:ss')
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
  const logList = ref<{ time: string; event: string }[]>([])
  //按钮
  const onButtonOption = async ({ name, type, fileURL, state }: PrjsRes, tag: string) => {
    const options = { name, type }
    if (tag === 'run') {
      await runPrjApi(options)
      logList.value.push({
        time: currentTime(),
        event: name + ' : 正在运行...',
      })
    } else if (tag === 'stop') {
      await stopPrjApi(options)
      logList.value.push({
        time: currentTime(),
        event: name + ' : 正在停止',
      })
    } else if (tag === 'reload') {
      await reloadPrjApi(options)
      logList.value.push({
        time: currentTime(),
        event: name + ' : 正在重新加载',
      })
    }
    // getPrjs(Number(status.value))
    prjItem.value?.reSetPrjState(name, state)
  }
  const signalRloadRes = (data: any) => {
    const state = data.state
    const name = data.name
    prjItem.value?.reSetPrjState(name, state)
    const hasCurr = loadRes.value.some((item: any) => item.name === data.name)
    prjItem.value?.reSetPrjState(name, state)
    if (state === 2 && !hasCurr) {
      loadRes.value.push({ ...data })
    } else if (state === 2 || state === 3) {
      loadRes.value.forEach((item: any) => {
        if (item.pid === data.pID) {
          item.state = state
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
      import.meta.env.MODE === 'development' ? import.meta.env.VITE_MPC_HTTP_PMS : window.origin
    )
    signalR = new SignalR(CPM_HUB)
    signalR.onMessageReceived(
      NOTIFY_PRJ_OPERATION_RESULT,
      (type: keyof signaRType, res: string) => {
        const { data, result, errMsg } = JSON.parse(res)
        if (result) {
          signalRloadRes(convertKeysToLower(data))
          logList.value.push({
            time: currentTime(),
            event: data.Name + ' : ' + signaRType[type],
          })
          //每次操作需要重新获取d当前状态的工程
          getPrjs(status.value)
        } else {
          logList.value.push({
            time: currentTime(),
            event: data.Name + ' : ' + errMsg,
          })
        }
      }
    )

    await signalR.start()
  }
  const clearLogs = async () => {
    logList.value = []
  }
  //控制器在线
  const onToCtrOnline = (name: string = '', serviceURL: any, state: number) => {
    router.push({
      name: 'CtrTpl',
      query: {
        title: encodeURIComponent('在线 - ' + name),
        name,
        type: 'online',
        serviceURL: encodeURIComponent(serviceURL),
        state: state / 1,
      },
    })
  }
  //过滤状态
  const onSelectState = (value: string) => {
    getPrjs(Number(status.value))
  }
  //加载节点
  const onLoadNode = async ({ name, type, fileURL, state }: any) => {
    await loadPrjApi({
      name,
      type,
      fileURL,
    })
    logList.value.push({
      time: currentTime(),
      event: name + ' : 正在加载...',
    })
  }
  //卸载节点
  const onUnLoadNode = async ({ name, type, fileURL, state }: any) => {
    await unloadPrjApi({
      name,
      type,
      fileURL,
    })
    logList.value.push({
      time: currentTime(),
      event: name + '正在卸载...',
    })
    //重新加载页面
    const index = loadRes.value.findIndex((item: any) => item.name === name)
    loadRes.value.splice(index, 1)
    // //删除tab栏目相对应的此工程的在线页面以及趋势图页面
    store.closePrjVisitedViewByName(name)
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
    console.log(tableHeight.value)

    getPrjs(5)
    getLogs()
  })
  onBeforeUnmount(async () => {
    await signalR.stop()
  })
</script>

<style scoped lang="less">
  .ctr__inner {
    min-width: 1070px;

    .ball {
      width: 20px;
      height: 20px;
      display: block;
      background: black;
      border-radius: 50%;
      margin: 0;
      background: radial-gradient(circle at 100px 100px, #d0eccc, #6be7a3);
    }
  }
</style>
