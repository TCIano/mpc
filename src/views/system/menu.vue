<template>
  <div class="main-container">
    <TableHeader :show-filter="false">
      <template #top-right>
        <AddButton @add="onAddItem" />
      </template>
    </TableHeader>
    <TableBody>
      <template #default>
        <a-table
          :loading="tableLoading"
          :data-source="dataList"
          :row-key="rowKey"
          :columns="tableColumns"
          :pagination="false"
          bordered
        >
          <template #bodyCell="{ column, record, index, text }">
            <template v-if="column.key === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.key === 'sortNumber'">
              <a-badge
                :showZero="true"
                :count="text"
                :number-style="{
                  backgroundColor: '#fff',
                  color: '#000c',
                  fontWeight: '600',
                  boxShadow: '0 0 0 1px #d9d9d9 inset',
                }"
              />
            </template>
            <template v-if="column.key === 'icon'">
              <component :is="record.icon || 'MenuOutlined'" style="font-size: 18px" />
            </template>
            <template v-if="column.key === 'cacheable'">
              <a-tag size="small" :color="record.isCache ? 'success' : 'error'">
                {{ record.isCache ? '是' : '否' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'hidden'">
              <a-tag size="small" :color="record.isHidden ? 'success' : 'error'">
                {{ record.isHidden ? '是' : '否' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'affix'">
              <a-tag size="small" :color="record.isFixed ? 'success' : 'error'">
                {{ record.isFixed ? '是' : '否' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button ghost type="primary" @click="onUpdateItem(record)" size="small">
                  编辑
                </a-button>
                <a-popconfirm
                  title="是否要删除此数据?"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="onDeleteItem(record)"
                >
                  <a-button danger size="small">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </template>
    </TableBody>
    <DrawerDialog
      ref="modalDialog"
      :title="actionModel === 'add' ? '添加菜单' : '编辑菜单'"
      @confirm="onConfirm"
    >
      <template #content>
        <a-form :wrapperCol="{ span: 18 }" ref="dataForm">
          <a-form-item
            :class="[item.required ? 'form-item__require' : 'form-item__no_require']"
            :label="item.label"
            v-for="item of itemFormOptions.filter((item) => item.label !== 'id')"
            :key="item.key"
          >
            <template v-if="item.type === 'tree-select'">
              <a-tree-select
                v-model:value="item.value.value"
                show-search
                :fieldNames="{ label: 'name', key: 'id', value: 'id' }"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :placeholder="item.placeholder"
                allow-clear
                :tree-data="dataList"
              >
              </a-tree-select>
            </template>
            <template v-if="item.type === 'input'">
              <a-input v-model:value="item.value.value" :placeholder="item.placeholder"></a-input>
            </template>
            <template v-if="item.type === 'numberInput'">
              <a-input-number style="width: 100%" v-model:value="item.value.value"></a-input-number>
            </template>
            <template v-if="item.type === 'icon'">
              <IconSelector v-model:value="item.value.value"></IconSelector>
            </template>
            <template v-if="item.type === 'switch'">
              <a-switch v-model:checked="item.value.value"></a-switch>
            </template>
          </a-form-item>
        </a-form>
      </template>
    </DrawerDialog>
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref, Ref, onActivated } from 'vue'
  import { addPageApi, deletePageApi, getPageDataApi, updatePageApi } from '@/api/modules'
  import { useRowKey, useTable, useTableColumn } from '@/hooks/table'
  import { DataFormType, ModalDialogType, FormItem } from '@/types/components'
  import { message, Modal, FormInstance } from 'ant-design-vue'
  import { PageData } from '@/types/apis/pages'
  import { sortTree } from '@/utils/router'
  export default defineComponent({
    name: 'Menu',
    setup() {
      const actionModel = ref('add')
      let tempItem: { menuUrl: string } | null = null
      const table = useTable()
      const modalDialog = ref<ModalDialogType | null>(null)
      const dataForm = ref<FormInstance | null>(null)
      const rowKey = useRowKey('id')
      const tableColumns = useTableColumn(
        [
          {
            title: '菜单名称',
            key: 'menuName',
            dataIndex: 'name',
          },
          {
            title: '菜单地址',
            key: 'menuUrl',
            dataIndex: 'url',
          },
          {
            title: '菜单图标',
            key: 'icon',
          },
          {
            title: '排序',
            key: 'sortNumber',
            dataIndex: 'sortNumber',
          },
          {
            title: '是否缓存',
            key: 'cacheable',
            dataIndex: 'isCache',
          },
          {
            title: '是否隐藏',
            key: 'hidden',
            dataIndex: 'isHidden',
          },
          {
            title: '是否固定标题栏',
            key: 'affix',
            dataIndex: 'isFixed',
          },
          {
            title: '操作',
            key: 'actions',
          },
        ],
        {
          ellipsis: true,
        }
      )
      const itemFormOptions = [
        {
          label: 'id',
          key: 'id',
          value: ref(null),
          reset: function () {
            this.value.value = null
          },
        },
        {
          label: '上级菜单',
          key: 'parentId',
          value: ref<string>(),
          placeholder: '请选择上级菜单',
          type: 'tree-select',
          reset: function () {
            this.value.value = ''
          },
        },
        {
          label: '菜单名称',
          key: 'name',
          required: true,
          type: 'input',
          placeholder: '请输入菜单名称',
          value: ref(undefined),
          validator: function () {
            if (!this.value.value) {
              message.error(this.placeholder)
              return false
            }
            return true
          },
          reset: function () {
            this.value.value = undefined
          },
        },
        {
          label: '菜单地址',
          key: 'url',
          required: true,
          value: ref(''),
          type: 'input',
          disabled: ref(false),
          placeholder: '请输入菜单地址',
          validator: function () {
            if (!this.value.value) {
              message.error(this.placeholder)
              return false
            }
            return true
          },
          reset: function () {
            this.value.value = ''
          },
        },
        // {
        //   label: '外链地址',
        //   key: 'outLink',
        //   type: 'input',
        //   placeholder: '请输入外链地址',
        //   value: ref(''),
        //   reset: function () {
        //     this.value.value = ''
        //   },
        // },
        {
          label: '菜单排序',
          key: 'sortNumber',
          type: 'numberInput',
          value: ref(0),
          reset: function () {
            this.value.value = 0
          },
        },
        {
          label: '菜单图标',
          key: 'icon',
          type: 'icon',
          value: ref(''),
          reset: function () {
            this.value.value = ''
          },
        },
        {
          label: '是否缓存',
          key: 'isCache',
          type: 'switch',
          value: ref(false),
          reset: function () {
            this.value.value = false
          },
        },
        {
          label: '是否隐藏',
          key: 'isHidden',
          type: 'switch',
          value: ref(false),
          reset: function () {
            this.value.value = false
          },
        },
        {
          label: '是否固定',
          key: 'isFixed',
          type: 'switch',
          value: ref(false),
          reset: function () {
            this.value.value = false
          },
        },
      ] as Array<FormItem>

      function removeEmptyChildren(tree: any) {
        tree.forEach((node: any) => {
          if (node.children && node.children.length === 0) {
            delete node.children
          } else if (node.children) {
            removeEmptyChildren(node.children)
          }
        })
      }

      async function doRefresh() {
        let res = await getPageDataApi()
        removeEmptyChildren(res)
        res = sortTree(res)
        table.handleSuccess(res)
      }
      function onAddItem() {
        actionModel.value = 'add'
        itemFormOptions.forEach((it) => {
          it.disabled = false
          it.reset && it.reset()
        })
        modalDialog.value?.show()
      }
      function onUpdateItem(item: any) {
        actionModel.value = 'edit'
        itemFormOptions.forEach((it) => {
          it.value.value = item[it.key]
        })
        modalDialog.value?.show()
      }
      async function onConfirm() {
        if (itemFormOptions.every((it) => (it.validator ? it.validator() : true))) {
          let option = itemFormOptions.reduce((pre, cur) => {
            ;(pre as any)[cur.key] = cur.value.value
            return pre
          }, {})
          if (actionModel.value === 'add') {
            const { id, ...restOption } = option as PageData
            await addPageApi(restOption)
          } else {
            await updatePageApi(option as PageData)
          }
          doRefresh()
          modalDialog.value?.close()
        }
      }
      async function onDeleteItem(item: any) {
        await deletePageApi(item.id)
        doRefresh()
      }
      onMounted(() => {
        doRefresh()
      })

      return {
        rowKey,
        actionModel,
        modalDialog,
        dataForm,
        ...table,
        itemFormOptions,
        tableColumns,
        onAddItem,
        onDeleteItem,
        onUpdateItem,
        onConfirm,
      }
    },
  })
</script>

<style lang="less" scoped>
  :deep(.ant-table-cell .ant-table-cell-with-append) {
    text-align: end;
  }
</style>
