<template>
  <div>
    <a-row v-for="(chunk, index) in dataChunks" :key="index" :warp="true">
      <div class="flex items-center">
        <span class="text-lg font-semibold text-red-500" style="writing-mode: vertical-lr">{{
          input[index]
        }}</span>
      </div>
      <a-col v-for="(item, i) in chunk" :key="i">
        <div class="text-center">
          <span v-if="index === 0" class="text-lg font-semibold text-center text-red-500">{{
            output[i as number]
          }}</span>
        </div>
        <a-dropdown :trigger="['contextmenu']">
          <div>
            <Chart :styleOp="style" :series="item" />
          </div>
          <template #overlay>
            <a-menu @click="onClickChartMenu">
              <a-menu-item :key="i" :params="item">模型组态</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-col>
    </a-row>
    <!-- 组态弹窗 -->
    <modal-dialog ref="modelDia">
      <template #content>
        <a-form
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 16 }"
          labelAlign="right"
          :model="formData"
          name="form"
        >
          <a-row :gutter="[5, 10]">
            <a-col :span="12">
              <div class="p-2 pt-3 pb-0 border-2 model-info">
                <a-form-item label="输入变量" name="inputName">
                  <a-input v-model:value="formData.inputName" :disabled="true"></a-input>
                </a-form-item>
                <a-form-item label="输出变量" name="outputName">
                  <a-input v-model:value="formData.outputName" :disabled="true"></a-input>
                </a-form-item>
                <a-form-item label="模型时滞" name="delay">
                  <a-input
                    :disabled="formData.funcType === 3"
                    v-model:value="formData.delay"
                  ></a-input>
                </a-form-item>
                <a-form-item label="模型增益" name="k">
                  <a-input v-model:value="formData.k"></a-input>
                </a-form-item>
                <a-form-item label="积分属性" name="">
                  <a-select v-model:value="formatIntegraFlag">
                    <a-select-option v-for="(value, name) in integralFlagMap" :value="value">{{
                      name
                    }}</a-select-option>
                  </a-select>
                </a-form-item>
              </div>
            </a-col>
            <a-col :span="12">
              <div
                class="flex flex-col justify-center p-3 pb-0 border-2 model-func"
                style="height: 296px"
              >
                <a-form-item label="函数类型" name="funcType">
                  <a-select v-model:value="formData.funcType">
                    <a-select-option v-for="(value, name) in funcTypeMap" :value="value">{{
                      name
                    }}</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="时间常数1" name="t1">
                  <a-input v-model:value="formData.t1" :disabled="!formData.funcType"></a-input>
                </a-form-item>
                <a-form-item label="时间常数2" name="t2">
                  <a-input v-model:value="formData.t2" :disabled="formData.funcType <= 1"></a-input>
                </a-form-item>
                <a-form-item label="模型长度" name="">
                  <a-input v-model:value="formData.modelLen"></a-input>
                </a-form-item>
              </div>
            </a-col>
          </a-row>
          <a-row class="mt-5">
            <a-col :span="24">
              <div class="p-2 pt-3 pb-0 border-2 model-resp" style="height: 250px">
                <component
                  :is="rspsChart"
                  :option="formData.datas"
                  :style="{ width: '100%', height: '100%' }"
                />
              </div>
            </a-col>
          </a-row>
        </a-form>
      </template>
      <template #footer>
        <div class="flex justify-start">
          <a-button style="margin-right: auto" @click="onGetRspsData">预览</a-button>
          <a-button>取消</a-button>
          <a-button type="primary" @click="onSetFIRMode">确定</a-button>
        </div>
      </template>
    </modal-dialog>
  </div>
</template>

<script setup lang="ts" name="model-trend">
  import { ref, reactive, onMounted, computed, defineAsyncComponent, watch } from 'vue'
  import { chartOption } from '@/types/echarts'
  import { GetFIRModelInfo, ModalInfo } from '@/types/apis/dpc/mpc'
  import { DataFormType, ModalDialogType, FormItem } from '@/types/components'
  import { debounce } from '@/utils/utils'
  import { getFIRModelInfoApi, getBuildFirModelInfoApi, setFirModelInfoApi } from '@/api/modules'
  import { useRoute } from 'vue-router'

  const rspsChart = defineAsyncComponent(() => import('./rsps-chart.vue'))
  type Policy = '位号读' | '本地读'
  interface Model {
    inputName: string
    outputName: string
    integralFlag: any
    delay: string
    policy: Policy
    policyRange: Policy[]
    tagName: string
    rawK: number
    curK: number
    hiLimit: number
    lowLimit: number
    datas: number[]
  }
  const route = useRoute()
  const modelDia = ref<ModalDialogType | null>()
  const emit = defineEmits(['refreshOview'])
  const props = withDefaults(
    defineProps<{
      componentData: Model[]
      type: string
    }>(),
    {
      componentData: () => [],
    }
  )
  const formData = ref<ModalInfo>({
    prjName: '',
    inputName: '',
    outputName: '',
    integralFlag: false,
    delay: 0,
    k: 0,
    t1: 0,
    t2: 0,
    funcType: 0,
    modelLen: 10,
    datas: [],
  })
  const integralFlagMap = {
    非积分: 0,
    积分: 1,
  }
  const funcTypeMap = {
    比例模型: 0,
    一阶模型: 1,
    二阶模型: 2,
    FIR模型: 3,
  }
  const formatIntegraFlag = computed({
    get: () => {
      return formData.value.integralFlag ? 1 : 0
    },
    set: (value: any) => {
      formData.value.integralFlag = value ? true : false
    },
  })
  let dataList = ref<any>([
    /* ...100个元素 */
  ])
  let dataChunks = ref<chartOption[]>([])

  watch(
    () => props.componentData,
    (value) => {
      //更新清空
      dataList.value = []
      dataChunks.value = []
      handelChart(value)
      getRowCol()
    }
  )

  const handelChart = (value: Model[]) => {
    for (let index = 0; index < value.length; index++) {
      const optionData = value[index]
      dataList.value.push({
        date: optionData.datas.map((item, index) => index),
        data: optionData,
      })
    }
  }
  handelChart(props.componentData)
  let input: string[] = []
  let output: string[] = []
  const getRowCol = () => {
    //行名称
    input = [...new Set(props.componentData.map((item) => item.inputName))]
    //列名称
    output = [...new Set(props.componentData.map((item) => item.outputName))]
    for (let i = 0; i < dataList.value.length; i += output.length) {
      dataChunks.value.push(dataList.value.slice(i, output.length + i))
    }
  }
  getRowCol()
  const getFIRModelInfo = async (data: GetFIRModelInfo) => {
    const modelInfo = await getFIRModelInfoApi(data, props.type)
    formData.value = modelInfo
  }

  const onClickChartMenu = ({ item }: any) => {
    const params = item.params.data as Model
    const mv = params.inputName || ''
    const cv = params.outputName || ''
    //获取指定模型组态信息
    getFIRModelInfo({
      prjName: route.query.name as string,
      mv,
      cv,
    })
    modelDia.value.show()
  }
  //获取越阶响应序列
  const onGetRspsData = async () => {
    const { integralFlag, delay, k, t1, t2, funcType, modelLen } = formData.value
    const res = await getBuildFirModelInfoApi(
      {
        integralFlag,
        funcType,
        k,
        modelLen,
        d: delay,
        T1: t1,
        T2: t2,
      },
      props.type
    )
    formData.value = {
      ...res,
      prjName: route.query.name as string,
      inputName: formData.value.inputName,
      outputName: formData.value.outputName,
    }
    console.log(formData.value)
  }
  //设置模型组态信息
  const onSetFIRMode = async () => {
    await setFirModelInfoApi(formData.value, props.type)
    //刷新所有数据
    emit('refreshOview')
    modelDia.value.toggle()
  }
  /**
   *设置图表宽高
   */
  let containWidth = ref()
  const style = ref()
  const containHeight = ref()
  const setChartWidHei = () => {
    let mainCon = document.querySelector('.main-base-style') as Element
    containWidth.value =
      mainCon?.getBoundingClientRect().width -
      (document.querySelector('.treeMenu-menu')?.getBoundingClientRect().width || 0) -
      48
    let mainPadd = '24px' //cardbody的padding
    style.value = {
      width: (containWidth.value - parseFloat(mainPadd) * 2 - 5) / output.length + 'px',
      // minWidth: '100px',
      height: input.length === 1 ? '300px' : (containHeight.value - 30) / input.length + 'px',
    }
  }
  const setChartWidHeiDeb: any = debounce(setChartWidHei)
  window.addEventListener('resize', setChartWidHeiDeb)
  setChartWidHeiDeb()
  onMounted(() => {
    // setChartWidHei()
    const treeOptionRow =
      document.querySelector('.treeMenu-optionRow')?.getBoundingClientRect().height || 0
    containHeight.value =
      (document.querySelector('.main-section')?.getBoundingClientRect().height || 0) -
      treeOptionRow -
      48
  })
</script>

<style scoped lang="less">
  //befor变量
  .before-pub {
    position: absolute;
    top: -10px;
    transform: translateX(-100%);
    background-color: white;
    padding: 0 10px;
  }
  .model-info::before {
    content: '模型信息';
    left: 30%;
    .before-pub();
  }
  .model-func::before {
    content: '传递函数';
    left: 30%;
    .before-pub();
  }
  .model-resp::before {
    content: '响应序列';
    left: 15%;
    .before-pub();
  }
</style>
