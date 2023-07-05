<template>
  <div>
    <tree-menu-layout :left-title="(route.query.name as string)">
      <template #left-extra>
        <a-select
          allowClear
          placeholder="请选择角色"
          style="width: 120px"
          size="small"
          v-model:value="currProles"
          @change="onChnageRole"
        >
          <a-select-option v-for="item in pRoles" :value="item.id" :key="item.id">{{
            item.name
          }}</a-select-option>
        </a-select>
      </template>
      <template #leftContent>
        <a-menu mode="inline" v-model:selectedKeys="currentMenu" @select="onClickItem">
          <template v-for="item in menuMap" :key="item.key">
            <template v-if="!item.children">
              <a-menu-item :params="item.params" :key="item.key">{{ item.name }}</a-menu-item>
            </template>
            <template v-else>
              <a-sub-menu :key="item.key" :title="item.name">
                <a-menu-item v-for="i in item.children" :params="i.params" :key="i.key">{{
                  i.name
                }}</a-menu-item>
              </a-sub-menu>
            </template>
          </template>
        </a-menu>
      </template>
      <template #centerContent>
        <a-row :gutter="[10, 5]">
          <div class="w-full pb-2 border-b-2 h-1/5 treeMenu-optionRow">
            <a-space>
              <a-button type="primary" size="small" @click="onSaveCtr">
                <template #icon>
                  <save-outlined />
                </template>
                保存
              </a-button>
              <a-button size="small" @click="onExportModel" v-if="!type">
                <template #icon>
                  <export-outlined />
                </template>
                导出模型
              </a-button>
              <a-button size="small" @click="onOpenModalLine" v-if="type">
                <template #icon>
                  <line-chart-outlined />
                </template>
                模块趋势
              </a-button>
              <a-button size="small" @click="onCheckModel" v-if="!type">
                <template #icon>
                  <check-square-outlined />
                </template>
                模型检查
              </a-button>
              <a-button size="small" @click="onOpenIOserver" v-if="!type">
                <template #icon>
                  <database-outlined />
                </template>
                IOServer
              </a-button>
              <a-button size="small" @click="onRunOnline" v-if="type && prjState !== 3">
                <template #icon>
                  <play-circle-outlined />
                </template>
                运行
              </a-button>
              <a-button size="small" @click="onStopOnline" v-if="type && prjState === 3">
                <template #icon>
                  <pause-outlined />
                </template>
                停止
              </a-button>
            </a-space>
          </div>
        </a-row>
        <a-row :gutter="[10, 5]">
          <div class="w-full h-4/5">
            <suspense>
              <template #default>
                <div>
                  <component
                    ref="ctr"
                    v-if="componentMap[currentMenu[0]]"
                    :is="componentMap[currentMenu[0]]"
                    @refresh-oview="getCtrServiceData"
                    :componentData="currentCptData"
                    :type="type"
                  />
                  <!-- 没有对应组件则显示默认的组件，操作变量，扰动变量，被控变量，控制器参数的通用组件 -->
                  <div v-else>
                    <basicTable
                      :varName="currentMenu[0]"
                      :table-data="treeData"
                      @refresh-var="refreshVar"
                      :type="type"
                    />
                  </div>
                </div>
              </template>
              <template #fallback>
                <!-- 加载中....... -->
                <LoadingComponent />
              </template>
            </suspense>
          </div>
        </a-row>
      </template>
    </tree-menu-layout>
    <!-- <modal-dialog ref="moduleTrend" :title="route.query.name + '-模块趋势'">
      <template #content>
        <component :is="allModel" :models="prjTotalData?.models" style="height: 100%" />
      </template>
      <template #footer> </template>
    </modal-dialog> -->
    <modal-dialog ref="ioServerModal" :width="'60%'" title="位号数据源设置" @confirm="onSetIOSName">
      <template #content>
        <a-form>
          <a-form-item label="默认数据源名称">
            <a-input v-model:value="prjTotalData.ioSeverDataSource" />
          </a-form-item>
        </a-form>
      </template>
    </modal-dialog>
  </div>
</template>

<script setup lang="ts">
  import {
    defineAsyncComponent,
    defineComponent,
    ref,
    computed,
    onMounted,
    watch,
    onBeforeUnmount,
  } from 'vue'
  import { onBeforeRouteLeave, useRouter, useRoute, LocationQueryValue } from 'vue-router'
  import TreeMenuLayout from '@/layouts/TreeMenuLayout.vue'
  import {
    PrjTotalData,
    TotalvarType,
    signalROnlineDatasChanged,
    signalROnlineDatasChangedVars,
    signalROnlineVarT,
  } from '@/types/apis/dpc/mpc'
  import { CtrParamsConst, CtrParamsName } from '@/enum/ctr'
  import { getProlesApi } from '@/api/modules'
  import {
    getMpcPrjByPath,
    saveMpcPrjApi,
    EXPORT_MODEL_FILE,
    runOnlinePrj,
    stopOnlinePrj,
    getCheckResultApi,
    setIOServerApi,
    getParamsByIdApi,
  } from '@/api/modules'
  import LoadingComponent from '@/layouts/loading/index.vue'
  import { MenuItemProps, message } from 'ant-design-vue'
  import { cloneDeep } from 'lodash-es'
  import { ModalDialogType } from '@/types/components'
  import SignalR from '@/utils/signalR'
  import useMpcStore from '@/store/modules/mpc'
  import {
    NOTIFY_PRJ_ONLINE_DATAS_CHANGED,
    NOTIFY_PRJ_OVERVIEW,
    NOTIFY_PRJ_STATE_CHANGED,
    SignalrCls,
  } from '@/types/signalR'
  const basicTable = defineAsyncComponent(() => import('./components/basic-table.vue'))
  const allModel = defineAsyncComponent(() => import('./components/all-model.vue'))
  const route = useRoute()
  const router = useRouter()
  const mpcStore = useMpcStore()
  const ctr = ref<any>()
  let serverUrl = route.query.serviceURL as string
  const lastRunTime = ref<string>()
  const moduleTrend = ref<ModalDialogType>()
  const ioServerModal = ref<ModalDialogType>()
  const currentMenu = ref<string[]>([CtrParamsConst.CTR_OVERVIEW])
  let signalR: SignalrCls | null = null
  const btnLoading = ref<Boolean>(false)
  //组件名要和菜单名称一致
  const componentMap: any = {
    [CtrParamsConst.CTR_OVERVIEW]: defineAsyncComponent(() => import('./components/over-view.vue')),
    [CtrParamsConst.BASE_INFO]: defineAsyncComponent(
      () => import('./components/model-basic-info.vue')
    ),
    [CtrParamsConst.GRADE_INFO]: defineAsyncComponent(() => import('./components/grade-info.vue')),
    [CtrParamsConst.MODEL_TREND]: defineAsyncComponent(
      () => import('./components/model-trend.vue')
    ),
  }
  const pRoles = ref<any[]>()
  const currProles = ref<any>()
  let prjTotalData = ref<PrjTotalData>()
  let type: any = ref(route.query.type as string)

  const menuMap = ref([
    {
      name: CtrParamsName.CTR_OVERVIEW,
      key: CtrParamsConst.CTR_OVERVIEW,
    },
    {
      name: CtrParamsName.MODEL_INFO,
      key: CtrParamsConst.MODEL_INFO,
      children: [
        {
          name: CtrParamsName.BASE_INFO,
          key: CtrParamsConst.BASE_INFO,
        },
        {
          name: CtrParamsName.MODEL_TREND,
          key: CtrParamsConst.MODEL_TREND,
        },
      ],
    },
    {
      name: CtrParamsName.CTR_PARAMS,
      key: CtrParamsConst.CTR_PARAMS,
      params: {},
    },

    {
      name: CtrParamsName.OPTION_VAR,
      key: CtrParamsConst.OPTION_VAR,
    },
    {
      name: CtrParamsName.DIS_VAR,
      key: CtrParamsConst.DIS_VAR,
    },
    {
      name: CtrParamsName.CTRED_VARIABLE,
      key: CtrParamsConst.CTRED_VARIABLE,
    },
    {
      name: CtrParamsName.GRADE_INFO,
      key: CtrParamsConst.GRADE_INFO,
    },
  ])

  const prjState = ref<number>(3)

  const onChnageRole = (value: string) => {
    ctr.value.handleRolesVar(value)
  }
  //在线状态
  const signalRState = () => {
    signalR?.onMessageReceived(NOTIFY_PRJ_STATE_CHANGED, (res: string) => {
      const signalrPrj = JSON.parse(res)
      if (signalrPrj.result) {
        prjState.value = signalrPrj.data.State
      } else {
        message.warning('操作失败')
      }
    })
  }
  //在线推送总览
  const signalROverView = async () => {
    mpcStore.saveUrl(decodeURIComponent(serverUrl))
    signalR = new SignalR()

    signalR.onMessageReceived(NOTIFY_PRJ_ONLINE_DATAS_CHANGED, (res: string) => {
      const jsonRes: signalROnlineDatasChanged = JSON.parse(res)
      if (jsonRes.result) {
        const signalROnline = jsonRes.data
        const signalROnlineDatas = signalROnline.datas
        prjState.value = signalROnline.prjState
        lastRunTime.value = signalROnlineDatas.ModuleInfo.LastRunTime
        //cps
        if (prjTotalData.value) {
          prjTotalData.value.cPs.params = prjTotalData.value?.cPs.params!.map((cp) => {
            const param = signalROnlineDatas.Vars.CPs.Params.find((p) => p.ParamID === cp.id)
            return {
              ...cp,
              value: param?.Value || '',
            }
          })
          const handleSignalRVars = (type: keyof PrjTotalData) => {
            const data = prjTotalData.value?.[type] as TotalvarType[]
            if (Array.isArray(data) && data.length) {
              if (data.length) {
                prjTotalData.value![type] = data.map((cv) => {
                  const cvsParams = cv.params
                  const sgnDataVar =
                    signalROnlineDatas.Vars[
                      (type.charAt(0).toUpperCase() + type.slice(1)) as keyof signalROnlineVarT
                    ]
                  if (Array.isArray(sgnDataVar) && sgnDataVar.length) {
                    const currCvsP = sgnDataVar.find((curr) => curr.Name === cv.name)
                    return {
                      ...cv,
                      params: cvsParams?.map((cvsP) => {
                        const pa = currCvsP?.Params.find((v) => v.ParamID === cvsP.id)
                        return {
                          ...cvsP,
                          value: pa?.Value,
                        }
                      }),
                    }
                  }
                }) as any
              }
            }
          }
          handleSignalRVars('cVs')
          handleSignalRVars('mVs')
          handleSignalRVars('dVs')
        }

        handleOverview()
      }
    })
    await signalR.start()
  }
  //路由传参解码
  const getCtrServiceData = async () => {
    type.value && signalROverView()
    // prjTotalData.value = {} as any
    const url = decodeURIComponent(route.query.name as string)
    if (url) {
      const res = await getMpcPrjByPath(url, type.value as string, decodeURIComponent(serverUrl))
      if (res.hasOwnProperty('result') && !res.result) return
      prjTotalData.value = res
      handleOverview()
    }
  }
  const filterOverViewVar = async () => {
    const { mVs: mvs, cPs: cps, dVs: dvs, cVs: cvs } = prjTotalData.value as PrjTotalData
    const mvp = await getParamsByIdApi(currProles.value)
    console.log(mvp)

    const mVs = mvp.ctr.map((p: string) => {
      const is = mvs.find((mv) => p === mv.name)
      console.log(p)

      if (is) {
        return {
          ...is,
        }
      }
    })
    return { mVs }
    //增加判断
  }
  const handleOverview = () => {
    //过滤总览参数
    // filterOverViewVar()

    const { mVs, cPs, dVs, cVs } = prjTotalData.value as PrjTotalData
    let varOption = { mVs, dVs, cVs, cPs } as any
    for (const key in varOption) {
      const arr = varOption[key]
      let index: number = 0
      let vars: {
        key: string
        name: string
      }[] = []
      if (arr.length) {
        vars = arr.map((varO: TotalvarType) => ({
          name: varO.name,
          key: varO.name,
          params: { type: varO.type, param: varO.params },
          isMenu: false,
        }))
        if (key === 'mVs') {
          index = menuMap.value.findIndex((item) => item.name === CtrParamsName.OPTION_VAR)
        } else if (key === 'dVs') {
          index = menuMap.value.findIndex((item) => item.name === CtrParamsName.DIS_VAR)
        } else {
          index = menuMap.value.findIndex((item) => item.name === CtrParamsName.CTRED_VARIABLE)
        }
        menuMap.value[index].children = vars as any
      } else {
        index = menuMap.value.findIndex((item) => item.name === CtrParamsName.CTR_PARAMS)
        menuMap.value[index].params = {
          type: 'cps',
          param: cPs.params,
        }
      }
    }
    treeData.value = onFindKey(currentMenu.value[0], menuMap.value) || {}
  }
  /**
   * 查找树形结构
   *
   */
  let varData = {}
  const onFindKey = (key: string, tree: any[]): any => {
    tree.forEach((item) => {
      if (item.key === key) {
        varData = item.params
      } else if (item.children && item.children.length > 0) {
        onFindKey(key, item.children)
      }
    })
    return varData
  }

  const treeData = ref<any>({})
  const onClickItem = ({ item }: any) => {
    treeData.value = cloneDeep(item.params)
  }
  const refreshVar = () => {
    getCtrServiceData()
    // onClickItem()
  }
  watch(
    () => route.query,
    (value) => {
      serverUrl = value.serviceURL as string
      type.value = value.type
      value.name && refreshVar()
      prjState.value = !value.state ? 0 : (value.state as any) / 1
    },
    {
      immediate: true,
    }
  )
  watch(
    () => currProles.value,
    () => {
      refreshVar()
    }
  )

  const currentCptData = computed(() => {
    if (prjTotalData.value) {
      const data = cloneDeep(prjTotalData.value)
      const { mVs, cVs, name, ioSeverDataSource, cPs, dVs, ranks, models } = data as PrjTotalData
      switch (currentMenu.value[0]) {
        case CtrParamsConst.CTR_OVERVIEW:
          return { cPs, mVs, cVs, dVs, lastRunTime: lastRunTime.value, roleId: currProles.value }
        case CtrParamsConst.CTR_PARAMS:
          return
        case CtrParamsConst.BASE_INFO:
          return models
        case CtrParamsConst.MODEL_TREND:
          return models
        case CtrParamsConst.OPTION_VAR:
          return
        case CtrParamsConst.DIS_VAR:
          return
        case CtrParamsConst.CTRED_VARIABLE:
          return
        case CtrParamsConst.GRADE_INFO:
          return ranks
        default:
          break
      }
    }
  })

  //保存
  const onSaveCtr = async () => {
    const res = await saveMpcPrjApi(route.query.name as string, type.value as string)
    if (!res) {
      message.success(route.query.name + '保存成功')
    }
    return typeof res === 'undefined' ? true : false
  }
  //运行在线工程
  const onRunOnline = async () => {
    signalRState()
    await runOnlinePrj(route.query.name as string)
    message.success('正在运行...')
  }
  const onStopOnline = async () => {
    signalRState()
    await stopOnlinePrj(route.query.name as string)
    message.success('正在停止...')
  }
  const onCheckModel = async () => {
    const res = await getCheckResultApi(route.query.name as string)
    message.success(res.length ? res.join(',') : '模型检查通过')
  }
  const onSetIOSName = async () => {
    await setIOServerApi(route.query.name as string, prjTotalData.value?.ioSeverDataSource || '')
    message.success('IOServer数据源名称修改成功')
    ioServerModal.value.toggle()
  }
  const onOpenModalLine = () => {
    // moduleTrend.value.show()
    //跳转到模型趋势页面
    router.push({
      path: '/ctr/ctrModalTrend',
      query: {
        title: route.query.name,
        serverUrl,
      },
    })
  }
  const onOpenIOserver = () => {
    ioServerModal.value.show()
  }

  //导出模型
  const onExportModel = () => {
    const url = `${window.origin}${EXPORT_MODEL_FILE}?prjName=${route.query.name}`
    window.location.href = url
  }
  onBeforeRouteLeave(async (to, from, next) => {
    if (type.value) {
      return next(true)
    }
    const isCanGo = window.confirm('是否保存工程？')
    if (isCanGo) {
      //保存控制器
      const canPass = await onSaveCtr()
      if (!canPass) {
        const isLogout = window.confirm('组态检查失败是否继续退出')
        if (isLogout) {
          next(true)
        } else {
          next(false)
        }
      }
      next(true)
    }
    next(true)
  })
  const getProles = async () => {
    pRoles.value = await getProlesApi()
  }
  onMounted(() => {
    //获取角色列表
    getProles()
    //放到创建前获取
    getCtrServiceData()
  })
  onBeforeUnmount(async () => {
    await signalR?.stop()
  })
  //保存
</script>

<style scoped lang="less">
  @import url('./components/index.less');
</style>
