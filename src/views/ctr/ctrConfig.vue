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
      </template>
      <template #top-right>
        <a-input
          placeholder="请输入名称"
          size="small"
          style="width: 150px"
          v-model:value="fuzzySearch"
        />
        <a-button type="primary" size="small" @click="setSearch">
          <template #icon><SearchOutlined /></template>
          搜索
        </a-button>
        <a-button size="small" @click="resetSearch"> 重置 </a-button>
      </template>
    </table-header>
    <table-body>
      <a-table
        size="middle"
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
        <ctr-cfg-drawer ref="ctrCom" :modalData="modalData" />
      </template>
    </drawer-dialog>
    <!-- 新建模型抽屉 -->

    <!-- 文件导入抽屉 -->
    <drawer-dialog
      ref="importModal"
      title="导入"
      @confirm="onImportCtr"
      @cancel="onCancelImportCtr"
    >
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
  import { ref, onMounted, reactive, computed, watch, nextTick } from 'vue'
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
  import { MpcPrjsRes, MOrdVarType, CVarVarType } from '@/types/apis/dpc/mpc'
  import { FormInstance, UploadProps, message, Empty } from 'ant-design-vue'
  import { useRouter } from 'vue-router'
  import ctrCfgDrawer from './components/ctr-cfg-drawer.vue'
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
  const ctrCom = ref<InstanceType<typeof ctrCfgDrawer>>()
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

  const state = reactive({
    searchText: '',
    searchedColumn: '',
  })

  const searchInput = ref()
  const fuzzySearch = ref<string>('')
  const handleSearch = (selectedKeys: string[], confirm: Function, dataIndex: string) => {
    confirm()
    state.searchText = selectedKeys[0]
    state.searchedColumn = dataIndex
  }

  const handleReset = (clearFilters: Function) => {
    clearFilters({ confirm: true })
    state.searchText = ''
  }
  //顶部查询
  const resetSearch = () => {
    getPrjs()
    fuzzySearch.value = ''
  }
  const setSearch = () => {
    const res = dataList.filter((item) => {
      return item.name.toLowerCase().includes(fuzzySearch.value.toLowerCase())
    })
    console.log(fuzzySearch.value)

    handleSuccess(res)
  }
  const reg = new RegExp(`(?<=${state.searchText})|(?=${state.searchText})`, 'i')

  //

  const restForm = () => {
    Object.assign(modalData.value, modal())
    configForm.value?.clearValidate()
    configForm.value?.resetFields()
  }

  const onCancelCfg = () => {
    ctrCom.value!.resetCtr()
    ctrCom.value!.fileList = []
    restForm()
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

  //导入控制器工程
  const onImportCtrModal = () => {
    Object.assign(importData.value, importModalValue())
    handleRemove()
    importModal.value?.show()
  }
  const onCancelImportCtr = () => {
    modalData.value.name = ''
    fileList.value = []
    Object.assign(importData.value, importModalValue())
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
    console.log(ctrCom.value)

    if (modalData.value.name) {
      if (!modalData.value.createType) {
        //导入模型文件创建
        const formData = new FormData()
        console.log(ctrCom.value!.fileList!)
        ctrCom.value!.fileList!.forEach((file: any) => {
          formData.append('file', file as any)
        })
        formData.append('prjName', modalData.value.name)
        formData.append('moduleType', modalData.value.moduleType)
        const res = await createByFileApi(formData)
        if (res?.result) {
          message.success('创建成功')
          configModal.value?.toggle()
        }
      } else {
        await createByManualApi({
          name: modalData.value.name,
          moduleType: modalData.value.moduleType,
          period: modalData.value.period, //生成模型的周期，单位：天（1天=24小时），默认为1天。
          modelLen: modalData.value.modelLen, //模型长度，单位：字节，默认为8192字节。应
          mVs: ctrCom.value!.mVarDatas.map((item) => item.name),
          dVs: ctrCom.value!.dVarDatas.map((item) => item.name),
          cVs: ctrCom.value!.cVarDatas.map((item) => {
            return {
              name: item.name,
              integralFlag: !!item.integralFlag,
            }
          }),
        })
        message.success('创建成功')
        configModal.value?.toggle()
        //手动创建
      }
      onCancelCfg()
      getPrjs()
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
  // .editable-cell:hover .editable-cell-icon {
  //   display: inline-block;
  // }
</style>
