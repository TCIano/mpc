<template>
  <div>
    <table-header ref="tableHeaderRef">
      <template #top-left>
        <add-button @add="onAddItem" />
        <a-button @click="onSaveItem" size="small">保存</a-button>
      </template>
    </table-header>
    <table-body>
      <template #default>
        <a-row :gutter="1">
          <a-col :span="12">
            <a-table
              :loading="tableLoading"
              :data-source="dataList"
              :columns="columns"
              :row-key="rowKey"
              :scroll="{ y: tableHeight }"
              :row-selection="{
                selectedRowKeys: selectedRowKeys,
                onChange: onSelectChange,
                type: rowSelectType,
              }"
              :customRow="(record:ScriptItem, index:number) => useCustomeRowSelect<ScriptItem>(record, index, 'name' )"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-button danger size="small" @click.stop="onDeleteItem(record.name)"
                    >删除</a-button
                  >
                </template>
              </template>
            </a-table>
          </a-col>
          <a-col :span="12">
            <!-- <codemirror
              v-model="code"
              placeholder="请选择脚本或直接编写.."
              :extensions="exti"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
            /> -->
            <code-editor
              v-model:modelValue="code"
              :options="{
                disabled,
                placeholder: '请选择脚本或直接编写..',
                autofocus: true,
                indentWithTab: true,
                tabSize: '2',
              }"
              :codeHeigth="codeHeigth || 300"
            />
          </a-col>
        </a-row>
      </template>
    </table-body>
    <drawer-dialog ref="scriptDra" @confirm="onConfirm">
      <template #content>
        <a-form name="form" :model="formData" ref="form">
          <a-form-item label="脚本名称" :rules="[{ required: true }]">
            <a-input v-model:value="formData.name"></a-input>
          </a-form-item>
        </a-form>
      </template>
    </drawer-dialog>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, watch, shallowRef, onMounted, getCurrentInstance } from 'vue'

  import {
    useTableHeight,
    useTable,
    useTableColumn,
    useCustomeRowSelect,
    useRowSelection,
    useRowKey,
  } from '@/hooks/table'
  import {
    getAllScriptApi,
    createScriptApi,
    saveScriptApi,
    deleteScriptApi,
    getScriptByPrjApi,
  } from '@/api/modules'
  import { ScriptItem, GetSptByP } from '@/types/apis/script'
  import { DrawerDialogType } from '@/types/components'
  import { FormInstance, message } from 'ant-design-vue'
  import { base642String, string2Base64 } from '@/utils/utils'
  export default defineComponent({
    setup() {
      const table = useTable()
      const { selectedRowKeys, onSelectChange, rowSelectType } = useRowSelection('radio') //规定单多选
      rowSelectType.value = 'radio'
      const code = ref<string | undefined>(``)
      const disabled = ref<boolean>(false)
      const codeHeigth = ref()
      const scriptDra = ref<DrawerDialogType>()
      const formData = ref<any>({
        name: '',
      })

      const rowKey = useRowKey('name')
      const form = ref<FormInstance>()
      const columns = useTableColumn(
        [
          {
            title: '名称',
            key: 'name',
            dataIndex: 'name',
          },
          {
            title: '描述',
            key: 'desc',
            dataIndex: 'desc',
          },
          {
            title: '操作',
            key: 'action',
          },
        ],
        {
          align: 'center',
        }
      )
      watch(selectedRowKeys, (value) => {
        //获取脚本内容
        replaceCode(value[0] as string)
      })
      const replaceCode = async (name: string) => {
        const res: GetSptByP = await getScriptByPrjApi(name)
        if (res.scriptContent) {
          code.value = base642String(res.scriptContent)
        } else {
          code.value = ''
        }
      }

      const doRefresh = async () => {
        const res: ScriptItem[] = await getAllScriptApi()
        table.handleSuccess(res)
      }
      const onAddItem = () => {
        formData.value.name = ''
        scriptDra.value.show()
      }

      const onDeleteItem = async (name: string) => {
        await deleteScriptApi(name)
        message.success('删除成功')
        doRefresh()
      }
      const onSaveItem = async () => {
        const base64 = string2Base64(code.value || '')
        await saveScriptApi(selectedRowKeys.value[0] as string, base64)
        message.success('保存成功')
        doRefresh()
      }
      const onConfirm = async () => {
        await createScriptApi(formData.value.name)
        message.success('添加成功')
        doRefresh()
        scriptDra.value.toggle()
      }
      onMounted(async () => {
        table.tableHeight.value = (await useTableHeight(getCurrentInstance())) as number
        // 32 分页大小
        codeHeigth.value =
          table.tableHeight.value +
            32 +
            document.querySelector('.ant-table-header')?.getBoundingClientRect()?.height! || 0
        doRefresh()
      })
      return {
        code,
        log: console.log,
        codeHeigth,
        onAddItem,
        ...table,
        columns,
        scriptDra,
        formData,
        onConfirm,
        form,
        onDeleteItem,
        onSaveItem,
        useCustomeRowSelect,
        selectedRowKeys,
        onSelectChange,
        rowKey,
        rowSelectType,
        disabled,
      }
    },
  })
</script>

<style lang="less" scoped></style>
