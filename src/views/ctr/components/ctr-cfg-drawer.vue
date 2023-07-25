<template>
  <a-form ref="configForm" name="formConfig" :model="modalData">
    <a-form-item label="模块名称" :rules="[{ required: true }]">
      <a-input v-model:value="modalData.name" placeholder="请输入模型名称"></a-input>
    </a-form-item>
    <a-form-item label="模型文件" :rules="[{ required: true }]">
      <a-radio-group v-model:value="modalData.createType">
        <a-radio :style="radioStyle" v-for="item in moduleType" :value="item.value"
          >{{ item.key }}
          <template v-if="!item.value && !modalData.createType">
            <a-upload
              name="file"
              :file-list="fileList"
              :before-upload="beforeUpload"
              @remove="handleRemove"
            >
              <a-button size="small" class="w-60">
                <upload-outlined />
                点击上传
              </a-button>
            </a-upload>
          </template>
        </a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
  <div v-if="modalData.createType" class="p-1 border-2 border-gray-100 shadow-lg">
    <a-row :gutter="3">
      <a-col :span="12">
        <a-form-item label="采样周期" name="period" :rules="[{ type: 'number', min: 0 }]">
          <a-input-number style="width: 100%" v-model:value="modalData.period" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="模型长度" name="modelLen" :rules="[{ type: 'number', min: 0 }]">
          <a-input-number style="width: 100%" v-model:value="modalData.modelLen" />
        </a-form-item>
      </a-col>
    </a-row>
    <!-- 操作变量 -->
    <a-table :columns="mVarColums" :pagination="false" :data-source="mVarDatas">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'name'">
          <div class="editable-cell">
            <div v-show="editableData.name === record.name" class="editable-cell-input-wrapper">
              <a-input
                ref="inputEle"
                v-model:value="editableData.name"
                @pressEnter="onSaveRowData(record, 'MV')"
              />
              <check-outlined
                style="margin-top: 10px"
                class="editable-cell-icon-check"
                @click="onSaveRowData(record, 'MV')"
              />
            </div>
            <div
              v-show="editableData.name !== record.name"
              class="editable-cell-text-wrapper"
              @click="onEditRowData(record, 'MV')"
            >
              {{ record.name }}
              <edit-outlined class="editable-cell-icon" />
            </div>
          </div>
        </template>
        <template v-if="column.key === 'action'">
          <a-button type="link" size="small" @click="onMOrdVarAdd(index, 'MV')">增加</a-button>
          <a-button
            size="small"
            type="link"
            :disabled="deleteMvIsDis"
            @click="onMOrdVarDelete(index, 'MV')"
            >删除</a-button
          >
          <a-button size="small" @click="moveDataTop(record, index, 'MV')" type="link"
            >上移</a-button
          >
          <a-button size="small" @click="moveDataBottom(record, index, 'MV')" type="link"
            >下移</a-button
          >
          <a-button
            size="small"
            :disabled="!index"
            @click="onChangePo(record, index, 'MV')"
            type="link"
            >切换</a-button
          >
        </template>
      </template>
    </a-table>
    <!-- 扰动变量 -->
    <a-table :columns="dVarColums" :pagination="false" :data-source="dVarDatas">
      <template #emptyText>
        <a-empty :image="simpleImage">
          <add-button @add="onMOrdVarAdd(0, 'DV')" />
        </a-empty>
      </template>
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'name'">
          <div class="editable-cell">
            <div v-if="editableDvData.name === record.name" class="editable-cell-input-wrapper">
              <a-input v-model:value="editableDvData.name" />
              <check-outlined
                style="margin-top: 10px"
                class="editable-cell-icon-check"
                @click.prevent="onSaveRowData(record, 'DV')"
              />
            </div>
            <div v-else class="editable-cell-text-wrapper">
              {{ record.name }}
              <edit-outlined
                class="editable-cell-icon"
                @click.prevent="onEditRowData(record, 'DV')"
              />
            </div>
          </div>
        </template>
        <template v-if="column.key === 'action'">
          <a-button size="small" type="link" @click="onMOrdVarAdd(index, 'DV')">增加</a-button>
          <a-button size="small" type="link" @click="onMOrdVarDelete(index, 'DV')">删除</a-button>
          <a-button size="small" @click="moveDataTop(record, index, 'DV')" type="link"
            >上移</a-button
          >
          <a-button size="small" @click="moveDataBottom(record, index, 'DV')" type="link"
            >下移</a-button
          >
          <a-button size="small" @click="onChangePo(record, index, 'DV')" type="link"
            >切换</a-button
          >
        </template>
      </template>
    </a-table>
    <!-- 被控变量 -->
    <a-table :columns="cVarColums" :pagination="false" :data-source="cVarDatas">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'name'">
          <div class="editable-cell">
            <div v-if="editableCvData.name === record.name" class="editable-cell-input-wrapper">
              <a-input v-model:value="editableCvData.name" />
              <check-outlined
                style="margin-top: 10px"
                class="editable-cell-icon-check"
                @click="onSaveRowData(record, 'CV')"
              />
            </div>
            <div v-else class="editable-cell-text-wrapper">
              {{ record.name }}
              <edit-outlined class="editable-cell-icon" @click="onEditRowData(record, 'CV')" />
            </div>
          </div>
        </template>
        <template v-if="column.key === 'action'">
          <a-button size="small" type="link" @click="onMOrdVarAdd(index, 'CV')">增加</a-button>
          <a-button
            size="small"
            type="link"
            :disabled="deleteInsFlgIsDis(record)"
            @click="onMOrdVarDelete(index, 'CV')"
            >删除</a-button
          >
          <a-button size="small" @click="moveDataTop(record, index, 'CV')" type="link"
            >上移</a-button
          >
          <a-button size="small" @click="moveDataBottom(record, index, 'CV')" type="link"
            >下移</a-button
          >
        </template>
        <template v-if="column.key === 'integralFlag'">
          <a-select v-model:value="record.integralFlag">
            <a-select-option v-for="item in intFlgTypeMap" key="item.value" :value="item.value">{{
              item.name
            }}</a-select-option>
          </a-select>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    reactive,
    toRefs,
    onBeforeMount,
    onMounted,
    nextTick,
    watchEffect,
    computed,
    watch,
  } from 'vue'
  import { FormInstance, UploadProps, message, Empty } from 'ant-design-vue'
  import { MpcPrjsRes, MOrdVarType, CVarVarType } from '@/types/apis/dpc/mpc'

  interface Props {
    modalData: any
  }
  let { modalData } = withDefaults(defineProps<Props>(), {
    modalData: () => {
      return {}
    },
  })

  const emits = defineEmits(['varChange'])
  const fileList = ref<UploadProps['fileList']>([])
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
  const inputEle = ref<HTMLElement>()
  const varTypeMap = [
    {
      name: '操作变量',
      value: 0,
    },
    {
      name: '扰动变量',
      value: 1,
    },
  ]
  const intFlgTypeMap = [
    {
      name: ' 积分',
      value: 1,
    },
    {
      name: '非积分',
      value: 0,
    },
  ]
  const moduleType = [
    {
      key: '模型导入',
      value: 0,
    },
    {
      key: '手动新建',
      value: 1,
    },
  ]
  const radioStyle = reactive({
    display: 'flex',
    height: '40px',
    lineHeight: '1px',
  })
  const mVarColums = [
    {
      title: '操作变量',
      key: 'name',
      width: 200,
      dataIndex: 'name',
    },
    {
      title: '操作',
      key: 'action',
    },
  ]

  const dVarColums = [
    {
      title: '扰动变量',
      key: 'name',
      width: 200,

      dataIndex: 'name',
    },
    {
      title: '操作',
      key: 'action',
    },
  ]

  const cVarColums = [
    {
      title: '被控变量',
      key: 'name',
      width: 200,
      dataIndex: 'name',
    },
    {
      title: '是否积分',
      key: 'integralFlag',
      dataIndex: 'integralFlag',
    },
    {
      title: '操作',
      key: 'action',
    },
  ]
  let mv = () => [{ name: 'MV1' }]
  //操作变量集
  let mVarDatas = ref<MOrdVarType[]>(mv())
  //扰动变量集
  let dv = () => [{ name: 'DV1' }]
  let dVarDatas = ref<MOrdVarType[]>(dv())
  //被控变量集
  let cv = () => [
    {
      name: 'CV1',
      integralFlag: 0,
    },
  ]
  const resetCtr = () => {
    mVarDatas.value = mv()
    dVarDatas.value = dv()
    cVarDatas.value = cv()
  }
  let cVarDatas = ref<CVarVarType[]>(cv())

  let editableData: any = ref({})
  let editableDvData: any = ref({})
  let editableCvData: any = ref({})
  const handleRemove = () => {
    fileList.value = []
    modalData.name = ''
  }
  const deleteMvIsDis = computed(() => {
    return mVarDatas.value.length === 1
  })
  const deleteDvIsDis = computed(() => {
    return dVarDatas.value.length === 1
  })
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    //匹配.cf结尾的文件
    const ext = file.name.split('.').pop()?.toLowerCase()
    const name = file.name.split('.')[0]
    const type = file.type || ext
    if (type === 'cf' || type === 'cmf') {
      fileList.value && handleRemove()
      fileList.value = [file]
      if (name) {
        modalData.name = name
      }
    } else {
      message.error('文件格式不正确')
    }
    return false
  }

  const onSaveRowData = (record: Record<string, any>, type: string) => {
    if (type === 'MV') {
      Object.assign(
        mVarDatas.value.filter((item) => record.name === item.name)[0],
        editableData.value
      )

      editableData.value = {}
    } else if (type === 'DV') {
      Object.assign(
        dVarDatas.value.filter((item) => record.name === item.name)[0],
        editableDvData.value
      )
      editableDvData.value = {}
    } else {
      Object.assign(
        cVarDatas.value.filter((item) => record.name === item.name)[0],
        editableCvData.value
      )
      editableCvData.value = {}
    }
  }
  /**
   * 获得下一个唯一的变量名称
   */
  const getNextName = (type: string, arr: any[], index: number = 1): any => {
    const isRepeat = arr.some((item: any) => item.name === type + index)
    const name = type + index
    if (isRepeat) {
      return getNextName(type, arr, index + 1) // Recursion. Go to the next level. Go to the next level.
    }
    return name
  }

  const onEditRowData = (record: Record<string, any>, type: string) => {
    if (type === 'MV') {
      editableData.value = mVarDatas.value.filter((item) => record.name === item.name)[0]
    } else if (type === 'DV') {
      editableDvData.value = dVarDatas.value.filter((item) => record.name === item.name)[0]
    } else {
      editableCvData.value = cVarDatas.value.filter((item) => record.name === item.name)[0]
    }
    //获取焦点
    nextTick(() => {
      inputEle.value?.focus()
    })
  }
  //上移
  const moveDataTop = (record: any, index: number, type: string) => {
    if (index === 0) return
    if (type === 'MV') {
      const element = mVarDatas.value.splice(index, 1)
      mVarDatas.value.splice(index - 1, 0, element[0])
    } else if (type === 'DV') {
      const element = dVarDatas.value.splice(index, 1)
      dVarDatas.value.splice(index - 1, 0, element[0])
    } else {
      const element = cVarDatas.value.splice(index, 1)
      cVarDatas.value.splice(index - 1, 0, element[0])
    }
  }
  const moveDataBottom = (record: any, index: number, type: string) => {
    if (type === 'MV') {
      if (index === mVarDatas.value.length - 1) return
      const element = mVarDatas.value.splice(index, 1)
      mVarDatas.value.splice(index + 1, 0, element[0])
    } else if (type === 'DV') {
      if (index === dVarDatas.value.length - 1) return
      const element = dVarDatas.value.splice(index, 1)
      dVarDatas.value.splice(index + 1, 0, element[0])
    } else {
      if (index === cVarDatas.value.length - 1) return
      const element = cVarDatas.value.splice(index, 1)
      cVarDatas.value.splice(index + 1, 0, element[0])
    }
  }
  const onMOrdVarAdd = (index: number, type: string) => {
    if (type === 'MV') {
      //每次添加从0开始进行唯一添加
      const name = getNextName(type, mVarDatas.value)
      mVarDatas.value.splice(index + 1, 0, {
        name,
      })
    } else if (type === 'DV') {
      const name = getNextName(type, dVarDatas.value)
      dVarDatas.value.splice(index + 1, 0, {
        name,
      })
    } else {
      const name = getNextName(type, cVarDatas.value)
      cVarDatas.value.splice(index + 1, 0, {
        name,
        integralFlag: 0,
      })
    }
  }
  const deleteInsFlgIsDis = (record: CVarVarType) => {
    const flag = cVarDatas.value.length === 1
    return flag
  }
  const onMOrdVarDelete = (index: number, type: string) => {
    if (type === 'MV') {
      mVarDatas.value.splice(index, 1)
    } else if (type === 'DV') {
      dVarDatas.value.splice(index, 1)
    } else {
      cVarDatas.value.splice(index, 1)
    }
  }
  const onChangePo = (record: any, index: number, type: string) => {
    let changeArr = []
    if (type === 'MV') {
      changeArr = mVarDatas.value.slice(index)
      mVarDatas.value = mVarDatas.value.slice(0, index)
      dVarDatas.value.push(...changeArr)
    } else {
      changeArr = dVarDatas.value.slice(index)
      dVarDatas.value = dVarDatas.value.slice(0, index)
      mVarDatas.value.push(...changeArr)
    }
    console.log(mVarDatas.value, dVarDatas.value)
  }
  watch([mVarDatas.value, dVarDatas.value], (val) => {
    console.log(val)
  })
  defineExpose({
    mVarDatas,
    dVarDatas, //扰动变量集合转换为元组列表格式的数组对
    cVarDatas, //被控变量集合转换为元组列表格式的数组
    resetCtr,
    fileList,
  })
</script>

<style scoped lang="less">
  .highlight {
    background-color: rgb(255, 192, 105);
    padding: 0px;
  }
  .editable-cell {
    position: relative;
    .editable-cell-input-wrapper,
    .editable-cell-text-wrapper {
      padding-right: 24px;
    }

    .editable-cell-text-wrapper {
      padding: 5px 24px 5px 5px;
    }

    .editable-cell-icon,
    .editable-cell-icon-check {
      position: absolute;
      right: 0;
      width: 20px;
      cursor: pointer;
    }

    .editable-cell-icon {
      margin-top: 4px;
      // display: none;
    }

    .editable-cell-icon-check {
      line-height: 28px;
    }

    .editable-cell-icon:hover,
    .editable-cell-icon-check:hover {
      color: #108ee9;
    }

    .editable-add-btn {
      margin-bottom: 8px;
    }
  }
</style>
