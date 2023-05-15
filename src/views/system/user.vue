<template>
  <a-row :gutter="10">
    <!-- <a-col :span="4">
      <a-card class="h-full" :bodyStyle="{ padding: '5px' }" :headerStyle="{ padding: '5px' }">
        <a-space>
          <a-input class="mr-2" placeholder="搜索" size="small" />
          <a-switch size="small" v-model:checked="expandAllFlag" />
        </a-space>
        <div class="mt-4">
          <a-tree v-model:expandedKeys="getExpandedKeys" :tree-data="departmentData" checkable />
        </div>
      </a-card>
    </a-col> -->
    <a-col :span="24">
      <div>
        <TableHeader ref="tableHeaderRef" :show-filter="true">
          <template #top-left>
            <add-button @add="onAdditem" />
            <DeleteButton @delete="onDeleteItems" />
          </template>
        </TableHeader>
        <TableBody>
          <template #default>
            <a-table
              :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
              :loading="tableLoading"
              :data-source="dataList"
              :columns="tableColumns"
              :pagination="false"
              tableLayout="fixed"
              :rowKey="rowKey"
              :scroll="{ y: tableHeight, x: 'max-content' }"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'index'">
                  {{ index + 1 }}
                </template>
                <template v-if="column.key === 'gender'">
                  {{ record.gender === 1 ? '男' : '女' }}
                </template>
                <template v-if="column.key === 'avatar'">
                  <a-avatar>{{ record.nickName.substring(0, 1) }}</a-avatar>
                </template>
                <template v-if="column.key === 'actions'">
                  <a-space>
                    <a-button ghost type="primary" @click="onEditItem(record)" size="small"
                      >编辑</a-button
                    >
                    <a-button danger @click="onDeleteItem(record)" size="small">删除</a-button>
                  </a-space>
                </template>
                <template v-if="column.key === 'status'">
                  <a-tag color="success" size="small" v-if="record.status === 1">正常</a-tag>
                  <a-tag color="error" size="small" v-else>禁用</a-tag>
                </template>
              </template>
            </a-table>
          </template>
        </TableBody>
        <TableFooter ref="tableFooterRef" :pagination="pagination" />
      </div>
    </a-col>
    <DrawerDialog
      ref="userEditModal"
      :title="actionModal === 'add' ? '添加用户' : '编辑用户'"
      content-height="50vh"
    >
      <template #content>
        <a-form :wrapperCol="{ span: 18 }">
          <a-form-item
            v-for="item in formItems"
            :key="item.key"
            :label="item.label"
            :required="item.required"
          >
            <template v-if="item.type === 'input'">
              <a-input :placeholder="item.placeholder" v-model:value="item.value.value"></a-input>
            </template>
            <template v-if="item.type === 'radio'">
              <a-radio-group v-model:value="item.value.value">
                <a-radio v-for="rad in item.optionItems" :key="rad.value" :value="rad.value">
                  {{ rad.label }}
                </a-radio>
              </a-radio-group>
            </template>
            <template v-if="item.type === 'switch'">
              <a-switch
                v-model:checked="item.value.value"
                checked-children="正常"
                un-checked-children="禁用"
              />
            </template>
          </a-form-item>
        </a-form>
      </template>
    </DrawerDialog>
  </a-row>
</template>

<script lang="ts">
  import { post } from '@/api/http'
  import { getTableList } from '@/api/url'
  import {
    usePagination,
    useRowKey,
    useRowSelection,
    useTable,
    useTableColumn,
    useTableHeight,
  } from '@/hooks/table'
  import { FormItem, ModalDialogType, DrawerDialogType } from '@/types/components'
  import { message, Modal } from 'ant-design-vue'
  import { defineComponent, getCurrentInstance, onMounted, ref, watch } from 'vue'
  export default defineComponent({
    name: 'UserList',
    setup() {
      const actionModal = ref('')
      const table = useTable()
      const rowKey = useRowKey('id')
      const pagination = usePagination(doRefresh)
      const { selectedRowKeys, onSelectChange } = useRowSelection()
      const formItems = [
        {
          label: '名称',
          type: 'input',
          key: 'name',
          value: ref(''),
          required: true,
          placeholder: '请输入用户名称',
          validator: function () {
            if (!this.value.value) {
              message.error(this.placeholder)
              return false
            }
            return true
          },
          reset() {
            this.value.value = ''
          },
        },
        {
          label: '性别',
          key: 'gender',
          value: ref(1),
          type: 'radio',
          optionItems: [
            { label: '男', value: 1 },
            { label: '女', value: 0 },
          ],
          required: true,
          placeholder: '请输入用户性别',
          validator: function () {
            if (!this.value.value) {
              message.error(this.placeholder)
              return false
            }
            return true
          },
          reset() {
            this.value.value = 1
          },
        },
        {
          label: '状态',
          key: 'status',
          value: ref(false),
          type: 'switch',
          reset: function () {
            this.value.value = false
          },
        },
      ] as FormItem[]
      const departmentData = [
        {
          title: '东部地区',
          key: 1,
          children: [
            {
              title: '总裁部',
              key: 11,
            },
            {
              title: '财务部',
              key: 12,
            },
            {
              title: '技术部',
              key: 13,
            },
            {
              title: '销售部',
              key: 14,
            },
            {
              title: '总裁部',
              key: 11,
            },
            {
              title: '财务部',
              key: 12,
            },
            {
              title: '技术部',
              key: 13,
            },
            {
              title: '销售部',
              key: 14,
            },
            {
              title: '总裁部',
              key: 11,
            },
            {
              title: '财务部',
              key: 12,
            },
            {
              title: '技术部',
              key: 13,
            },
            {
              title: '销售部',
              key: 14,
            },
          ],
        },
        {
          title: '西部地区',
          key: 2,
          children: [
            {
              title: '总裁部',
              key: 21,
            },
            {
              title: '财务部',
              key: 22,
            },
            {
              title: '技术部',
              key: 23,
            },
            {
              title: '销售部',
              key: 24,
            },
          ],
        },
        {
          title: '南部地区',
          key: 3,
          children: [
            {
              title: '总裁部',
              key: 31,
            },
            {
              title: '财务部',
              key: 32,
            },
            {
              title: '技术部',
              key: 33,
            },
            {
              title: '销售部',
              key: 34,
            },
          ],
        },
        {
          title: '北部地区',
          key: 4,
          children: [
            {
              title: '总裁部',
              key: 41,
            },
            {
              title: '财务部',
              key: 42,
            },
            {
              title: '技术部',
              key: 43,
            },
            {
              title: '销售部',
              key: 44,
            },
          ],
        },
      ]
      const tableColumns = useTableColumn(
        [
          table.indexColumn,
          {
            title: '名称',
            key: 'nickName',
            dataIndex: 'nickName',
          },
          {
            title: '性别',
            key: 'gender',
            dataIndex: 'gender',
            width: 80,
          },
          // {
          //   title: '头像',
          //   key: 'avatar',
          //   dataIndex: 'avatar',
          // },
          // {
          //   title: '地址',
          //   key: 'address',
          //   dataIndex: 'address',
          // },
          // {
          //   title: '登录时间',
          //   key: 'lastLoginTime',
          //   dataIndex: 'lastLoginTime',
          //   width: 120,
          // },
          // {

          //   title: '登录IP',
          //   key: 'lastLoginIp',
          //   dataIndex: 'lastLoginIp',
          //   width: 100,
          // },
          {
            title: '状态',
            key: 'status',
            dataIndex: 'status',
            width: 80,
          },
          {
            title: '操作',
            key: 'actions',
            fixed: 'right',
            width: 160,
          },
        ],
        {
          align: 'center',
        }
      )
      const userEditModal = ref<DrawerDialogType>(null)
      const expandAllFlag = ref(false)
      function doRefresh() {
        post({
          url: getTableList,
          data: () => {
            return {
              page: pagination.page,
              pageSize: pagination.pageSize,
            }
          },
        })
          .then((res) => {
            table.handleSuccess(res)
            pagination.setTotalSize((res as any).totalSize)
          })
          .catch(console.log)
      }
      function onDeleteItems() {
        Modal.confirm({
          title: '提示',
          content: '确定要删除此数据吗？',
          cancelText: '取消',
          okText: '删除',
          onOk: () => {
            message.success(
              '数据模拟删除成功，所选择的Keys为：' + JSON.stringify(selectedRowKeys.value)
            )
          },
        })
      }
      function onDeleteItem(item: any) {
        Modal.confirm({
          title: '提示',
          content: '确定要删除此数据吗？',
          cancelText: '取消',
          okText: '删除',
          onOk: () => {
            table.dataList.splice(table.dataList.indexOf(item), 1)
          },
        })
      }
      function onEditItem(item: any) {
        actionModal.value = 'edit'
        userEditModal.value?.show()
      }
      function onAdditem() {
        actionModal.value = 'add'
        formItems.forEach((item) => {
          item.reset && item.reset()
        })
        userEditModal.value?.show()
      }
      function onUpdateExpandedKeys(keys: any) {
        getExpandedKeys.value = [...keys]
      }
      const getExpandedKeys = ref([] as Array<number>)
      watch(
        () => expandAllFlag.value,
        (newVal) => {
          newVal
            ? (getExpandedKeys.value = departmentData.map((it) => it.key))
            : (getExpandedKeys.value = [])
        }
      )
      onMounted(async () => {
        table.tableHeight.value = await useTableHeight(getCurrentInstance())
        doRefresh()
      })
      return {
        ...table,
        rowKey,
        userEditModal,
        selectedRowKeys,
        onSelectChange,
        expandAllFlag,
        departmentData,
        tableColumns,
        pagination,
        onDeleteItem,
        onEditItem,
        onDeleteItems,
        getExpandedKeys,
        onUpdateExpandedKeys,
        formItems,
        onAdditem,
        actionModal,
      }
    },
  })
</script>
