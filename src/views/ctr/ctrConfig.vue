<template>
  <div>
    <table-header>
      <template #top-left>
        <add-button @add="onAdd" />
        <a-button size="small" @click="onImportCtrModal">
          <template #icon>
            <arrow-right-outlined />
          </template>
          导入
        </a-button>
        <a-button size="small" @click.prevent="onExportCtr">
          <template #icon>
            <arrow-down-outlined />
          </template>
          导出
        </a-button>
        <!-- <a-button type="dash" size="small" @click="onSaveCtr">
          <template #icon>
            <save-outlined />
          </template>
          保存
        </a-button> -->
        <!-- <delete-button name="批量删除"> </delete-button> -->
      </template>
    </table-header>
    <table-body>
      <a-table
        :columns="colums"
        :pagination="pagination"
        :loading="tableLoading"
        :rowKey="rowKey"
        :data-source="dataList"
        :customRow="(record:MpcPrjsRes, index:number) => useCustomeRowSelect<MpcPrjsRes>(record, index, 'name')"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange, type: 'radio' }"
      >
        <template #headerCell="{ column }">
          <template v-if="column.key === 'name'">
            <span style="color: #1890ff">名称</span>
          </template>
        </template>
        <template
          #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        >
          <div style="padding: 8px">
            <a-input
              ref="searchInput"
              placeholder="搜索名称"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="(e:ChangeEvent) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
              type="primary"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
              重置
            </a-button>
          </div>
        </template>
        <template #customFilterIcon="{ filtered }">
          <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
        </template>
        <template #bodyCell="{ text, record, index, column }">
          <span v-if="state.searchText && state.searchedColumn === column.dataIndex">
            <template v-for="(fragment, i) in text.toString().split(reg)">
              <mark
                v-if="fragment.toLowerCase() === state.searchText.toLowerCase()"
                :key="i"
                class="highlight"
              >
                {{ fragment }}
              </mark>
              <template v-else>{{ fragment }}</template>
            </template>
          </span>

          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="primary" size="small" ghost @click="onEdit(record)">编辑</a-button>
              <a-popconfirm
                placement="top"
                ok-text="是"
                cancel-text="否"
                @confirm="onConfirmDelete(record)"
              >
                <template #title>
                  <p>是否删除此条数据</p>
                </template>
                <a-button danger type="primary" size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </table-body>
    <!-- 新建模型抽屉 -->
    <drawer-dialog
      ref="configModal"
      :title="title"
      @confirm="onConfirmAdd"
      @cancel="onCancelCfg"
      :width="630"
    >
      <template #content>
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
          <a-row :gutter="[10]">
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
                  <div
                    v-show="editableData.name === record.name"
                    class="editable-cell-input-wrapper"
                  >
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
                <a-button type="link" size="small" @click="onMOrdVarAdd(index, 'MV')"
                  >增加</a-button
                >
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
                  <div
                    v-if="editableDvData.name === record.name"
                    class="editable-cell-input-wrapper"
                  >
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
                <a-button size="small" type="link" @click="onMOrdVarAdd(index, 'DV')"
                  >增加</a-button
                >
                <a-button size="small" type="link" @click="onMOrdVarDelete(index, 'DV')"
                  >删除</a-button
                >
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
                  <div
                    v-if="editableCvData.name === record.name"
                    class="editable-cell-input-wrapper"
                  >
                    <a-input v-model:value="editableCvData.name" />
                    <check-outlined
                      style="margin-top: 10px"
                      class="editable-cell-icon-check"
                      @click="onSaveRowData(record, 'CV')"
                    />
                  </div>
                  <div v-else class="editable-cell-text-wrapper">
                    {{ record.name }}
                    <edit-outlined
                      class="editable-cell-icon"
                      @click="onEditRowData(record, 'CV')"
                    />
                  </div>
                </div>
              </template>
              <template v-if="column.key === 'action'">
                <a-button size="small" type="link" @click="onMOrdVarAdd(index, 'CV')"
                  >增加</a-button
                >
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
                  <a-select-option
                    v-for="item in intFlgTypeMap"
                    key="item.value"
                    :value="item.value"
                    >{{ item.name }}</a-select-option
                  >
                </a-select>
              </template>
            </template>
          </a-table>
        </div>
      </template>
    </drawer-dialog>
    <!-- 新建模型抽屉 -->

    <!-- 文件导入抽屉 -->
    <drawer-dialog ref="importModal" title="导入" @confirm="onImportCtr">
      <template #content>
        <a-form :model="importData" :label-col="{ span: 5 }">
          <a-form-item label="导入模式">
            <a-select ref="select" v-model:value="importData.mode">
              <a-select-option v-for="item in modeMap" :value="item.value" :key="item.value">{{
                item.name
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="文件">
            <a-upload :file-list="fileList" :before-upload="beforeUpload" @remove="handleRemove">
              <a-button size="small">
                <upload-outlined></upload-outlined>
                点击上传
              </a-button>
            </a-upload>
          </a-form-item>
          <!-- <a-form-item label="文件">
            <input type="file" id="file" @change="onFileChange" />
          </a-form-item> -->
        </a-form>
      </template>
    </drawer-dialog>
    <!-- 文件导入抽屉 -->
  </div>
</template>

<script setup lang="ts" name="CtrCfg">
  import { ModalDialogType } from '@/types/components'
  import { ref, onMounted, reactive, computed, nextTick, onUpdated } from 'vue'
  import type { UnwrapRef } from 'vue'
  import {
    useTable,
    useRowKey,
    usePagination,
    useRowSelection,
    useCustomeRowSelect,
  } from '@/hooks/table'
  import {
    getMpcPrjsApi,
    EXPORT_CTR,
    deleteMpcPrjApi,
    importCtrApi,
    createByFileApi,
    createByManualApi,
  } from '@/api/modules'
  import { MpcPrjsRes } from '@/types/apis/dpc/mpc'
  import {
    FormInstance,
    Modal,
    UploadChangeParam,
    UploadProps,
    message,
    Empty,
  } from 'ant-design-vue'
  import { useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
  import { encode } from 'querystring'
  import dayjs from 'dayjs'
  import { ChangeEvent } from 'ant-design-vue/es/_util/EventInterface'
  const { selectedRowKeys, onSelectChange } = useRowSelection()
  const { useTableColumn, indexColumn, handleSuccess, tableLoading, dataList } = useTable()
  const pagination = usePagination()
  const rowKey = useRowKey('name')
  const configModal = ref<ModalDialogType>(null)
  const configForm = ref<FormInstance>()
  const importModal = ref<ModalDialogType>(null)
  const title = ref<string>('')
  const router = useRouter()
  const inputEle = ref()
  interface MOrdVarType {
    name: string
  }
  interface CVarVarType {
    name: string

    integralFlag: number
  }
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
  const modeMap = [
    {
      name: '跳过',
      value: 0,
    },
    {
      name: '覆盖',
      value: 1,
    },
    {
      name: '重命名',
      value: 2,
    },
  ]
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
  const fileList = ref<UploadProps['fileList']>([])
  const importModalValue = () => ({
    mode: 0,
  })
  const importData = ref(importModalValue())
  const modal = () => ({
    name: '',
    createType: 0,
    moduleType: '预测控制3.0',
    period: 30,
    modelLen: 60,
  })
  const radioStyle = reactive({
    display: 'flex',
    height: '40px',
    lineHeight: '1px',
  })
  let mv = () => [{ name: 'MV1' }]
  //操作变量集
  const mVarDatas = ref<MOrdVarType[]>(mv())
  //扰动变量集
  let dv = () => [{ name: 'DV1' }]
  const dVarDatas = ref<MOrdVarType[]>(dv())
  //被控变量集
  let cv = () => [
    {
      name: 'CV1',
      integralFlag: 0,
    },
  ]
  const cVarDatas = ref<CVarVarType[]>(cv())
  const onCancelCfg = () => {
    mVarDatas.value = mv()
    dVarDatas.value = dv()
    cVarDatas.value = cv()
    fileList.value = []
    restForm()
  }
  const modalData = ref<any>(modal())
  const colums = useTableColumn(
    [
      indexColumn,
      {
        title: '控制器名称',
        key: 'name',
        dataIndex: 'name',
        customFilterDropdown: true,
        onFilter: (value: string, record: MpcPrjsRes) =>
          record.name.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible: boolean) => {
          if (visible) {
            setTimeout(() => {
              searchInput.value.focus()
            }, 100)
          }
        },
      },
      {
        title: '控制器描述',
        key: 'desc',
        dataIndex: 'desc',
      },
      {
        title: '控制器路径',
        key: 'fileURL',
        dataIndex: 'fileURL',
      },
      {
        title: '控制器创建时间',
        key: 'fileTime',
        dataIndex: 'fileTime',
        defaultSortOrder: 'descend',
        sorter: {
          compare: (a: MpcPrjsRes, b: MpcPrjsRes) =>
            dayjs(a.fileTime).unix() - dayjs(b.fileTime).unix(),
        },
      },
      {
        title: '操作',
        key: 'action',
      },
    ],
    { align: 'center' }
  )
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
  const state = reactive({
    searchText: '',
    searchedColumn: '',
  })

  const searchInput = ref()
  const handleSearch = (selectedKeys: string[], confirm: Function, dataIndex: string) => {
    confirm()
    state.searchText = selectedKeys[0]
    state.searchedColumn = dataIndex
  }

  const handleReset = (clearFilters: Function) => {
    clearFilters({ confirm: true })
    state.searchText = ''
  }
  const reg = new RegExp(`(?<=${state.searchText})|(?=${state.searchText})`, 'i')

  let editableData: any = ref({})
  let editableDvData: any = ref({})
  let editableCvData: any = ref({})
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
      inputEle.value.focus()
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
  //
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
  const onMOrdVarDelete = (index: number, type: string) => {
    if (type === 'MV') {
      mVarDatas.value.splice(index, 1)
    } else if (type === 'DV') {
      dVarDatas.value.splice(index, 1)
    } else {
      cVarDatas.value.splice(index, 1)
    }
  }
  const restForm = () => {
    Object.assign(modalData.value, modal())

    configForm.value?.clearValidate()
    configForm.value?.resetFields()
  }
  const deleteMvIsDis = computed(() => {
    return mVarDatas.value.length === 1
  })
  const deleteDvIsDis = computed(() => {
    return dVarDatas.value.length === 1
  })
  const deleteInsFlgIsDis = (record: CVarVarType) => {
    const flag = cVarDatas.value.length === 1
    return flag
  }

  //添加按钮
  const onAdd = () => {
    //清除规则
    configModal.value?.show()
    title.value = '添加控制器'

    //清除每一项内容 reset（）
  }
  //编辑按钮
  const onEdit = ({ name, desc, fileURL }: MpcPrjsRes) => {
    //打开组态页面
    router.push({
      name: 'CtrTpl',
      query: {
        title: encodeURIComponent('设计 - ' + name),
        name,
        type: '',
      },
    })
  }
  //获取控制器列表
  const getPrjs = async () => {
    const res = await getMpcPrjsApi()
    handleSuccess(res)
  }
  //删除
  const onConfirmDelete = async (record: MpcPrjsRes) => {
    await deleteMpcPrjApi(encodeURIComponent(record.name))
    getPrjs()
    message.success('删除成功')
  }
  //保存
  // const onSaveCtr = async () => {
  //   // await saveMpcPrjApi()
  // }
  // onBeforeRouteLeave(() => {
  //   const isCanGo = window.confirm('是否保存工程？')
  //   console.log(isCanGo)
  //   if (isCanGo) {
  //     //保存控制器
  //   }
  // })
  //保存

  //导入控制器工程
  const onImportCtrModal = () => {
    Object.assign(importData.value, importModalValue())
    handleRemove()
    importModal.value?.show()
  }

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    //匹配.cf结尾的文件
    const ext = file.name.split('.').pop()?.toLowerCase()
    const name = file.name.split('.')[0]

    const type = file.type || ext
    if (type === 'cf' || type === 'cmf') {
      fileList.value && handleRemove()
      fileList.value = [file]
      if (name) {
        modalData.value.name = name
      }
    } else {
      message.error('文件格式不正确')
    }
    return false
  }
  const handleRemove = () => {
    fileList.value = []
    modalData.value.name = ''
  }
  const onConfirmAdd = async () => {
    if (modalData.value.name) {
      if (!modalData.value.createType) {
        //导入模型文件创建
        const formData = new FormData()
        fileList.value?.forEach((file: any) => {
          formData.append('file', file as any)
        })
        formData.append('prjName', modalData.value.name)
        formData.append('moduleType', modalData.value.moduleType)
        await createByFileApi(formData)
      } else {
        await createByManualApi({
          name: modalData.value.name,
          moduleType: modalData.value.moduleType,
          period: modalData.value.period, //生成模型的周期，单位：天（1天=24小时），默认为1天。
          modelLen: modalData.value.modelLen, //模型长度，单位：字节，默认为8192字节。应
          mVs: mVarDatas.value.map((item) => item.name),
          dVs: dVarDatas.value.map((item) => item.name),
          cVs: cVarDatas.value.map((item) => {
            return {
              name: item.name,
              integralFlag: !!item.integralFlag,
            }
          }),
        })

        //手动创建
      }
      configModal.value?.toggle()
      getPrjs()
      message.success('创建成功')
    } else {
      return message.warning('请输入模型名称')
    }
  }
  const onImportCtr = async () => {
    //文件处理
    const formData = new FormData()
    fileList.value?.forEach((file: any) => {
      formData.append('file', file as any)
    })
    formData.append('mode', String(importData.value?.mode) as string)
    const res = await importCtrApi(formData)
    message.success(res.prjName + '导入成功')
    importModal.value.toggle()
    getPrjs()
  }
  //导出控制器工程
  const onExportCtr = () => {
    if (!selectedRowKeys.value.length) return message.warning('请选择导出的工程')
    const url = `${window.origin}${EXPORT_CTR}?prjName=${escape(
      selectedRowKeys.value[0] as string
    )}`
    window.location.href = url
  }

  onMounted(() => {
    getPrjs()
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
  // .editable-cell:hover .editable-cell-icon {
  //   display: inline-block;
  // }
</style>
