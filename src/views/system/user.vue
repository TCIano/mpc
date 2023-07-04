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
        <TableHeader ref="tableHeaderRef" :show-filter="false">
          <template #top-left>
            <add-button @add="onAdditem" />
            <!-- <DeleteButton @delete="onDeleteItems" /> -->
          </template>
        </TableHeader>
        <TableBody>
          <template #default>
            <a-table
              :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
              :loading="tableLoading"
              :data-source="dataList"
              :columns="tableColumns"
              :pagination="true"
              :customRow="(record:Users, index:number) => useCustomeRowSelect<Users>(record, index, 'id')"
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
                <template v-if="column.key === 'status'">
                  <a-tag color="success" size="small" v-if="record.status === 1">正常</a-tag>
                  <a-tag color="error" size="small" v-else>禁用</a-tag>
                </template>
              </template>
            </a-table>
          </template>
        </TableBody>
        <!-- <TableFooter ref="tableFooterRef" :pagination="pagination" /> -->
      </div>
    </a-col>
    <DrawerDialog
      ref="userEditModal"
      :title="actionModal === 'add' ? '添加用户' : '编辑用户'"
      @confirm="onUserInfoConfirm"
    >
      <template #content>
        <a-form :wrapperCol="{ span: 19 }" :labelCol="{ span: 5 }">
          <a-form-item
            v-for="item in formItems.filter((item) => item.hidden !== true)"
            :key="item.key"
            :label="item.label"
            :required="item.required"
          >
            <template v-if="item.type === 'input'">
              <a-input
                :placeholder="item.placeholder"
                :disabled="item.disabled"
                v-model:value="item.value.value"
              ></a-input>
            </template>
            <template v-if="item.type === 'pwd'">
              <a-input-password
                :placeholder="item.placeholder"
                v-model:value="item.value.value"
              ></a-input-password>
            </template>
            <template v-if="item.type === 'textarea'">
              <a-textarea
                :disabled="item.disabled"
                :placeholder="item.placeholder"
                v-model:value="item.value.value"
              ></a-textarea>
            </template>
          </a-form-item>
        </a-form>
      </template>
    </DrawerDialog>
  </a-row>
</template>

<script lang="ts">
  import { getTableList } from '@/api/url'
  import {
    usePagination,
    useRowKey,
    useRowSelection,
    useTable,
    useTableColumn,
    useTableHeight,
    useCustomeRowSelect,
  } from '@/hooks/table'
  import { FormItem, ModalDialogType, DrawerDialogType } from '@/types/components'
  import { addUserApi, deleteUserApi, getUsersApi, updateUsersApi } from '@/api/modules/index'
  import { message, Modal } from 'ant-design-vue'
  import { defineComponent, getCurrentInstance, onMounted, ref, watch, Ref, reactive } from 'vue'
  import { Users } from '@/types/apis/user'
  export default defineComponent({
    name: 'UserList',
    setup() {
      const disabledKey = 'system'
      const actionModal = ref('')
      const table = useTable()
      const rowKey = useRowKey('id')
      const pagination = usePagination(doRefresh)
      const { selectedRowKeys, onSelectChange } = useRowSelection()

      const onCustomSelectRow = (record: Users) => {}
      const formItems = [
        {
          key: 'id',
          value: ref(''),
          hidden: true,
          reset() {
            this.value.value = ''
          },
        },
        {
          label: '用户名',
          type: 'input',
          key: 'name',
          value: ref(''),
          required: true,
          placeholder: '请输入用户名',
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
          label: '密码',
          type: 'pwd',
          key: 'pwd',
          value: ref(''),
          required: true,
          placeholder: '请输入密码',
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
          label: '描述',
          key: 'desc',
          value: ref(''),
          type: 'textarea',
          placeholder: '请输入描述 ',
          reset: function () {
            this.value.value = ''
          },
        },
      ] as FormItem[]

      const tableColumns = useTableColumn(
        [
          table.indexColumn,
          {
            title: '用户名',
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
            key: 'actions',
            fixed: 'right',
            width: 200,
          },
        ],
        {
          align: 'center',
        }
      )
      const userEditModal = ref<DrawerDialogType>(null)
      const expandAllFlag = ref(false)
      async function doRefresh() {
        const res = await getUsersApi()
        table.handleSuccess(res)
        pagination.setTotalSize(res.length)
      }
      function onDeleteItems() {}
      async function onDeleteItem(item: any) {
        await deleteUserApi(item.id)
        doRefresh()
      }
      function onEditItem(item: any) {
        actionModal.value = 'edit'
        userEditModal.value?.show()
        formItems.forEach((it) => {
          it.disabled = item.isSystemReserved
          it.value.value = item[it.key] || null
        })
      }
      function onAdditem() {
        actionModal.value = 'add'
        formItems.forEach((item) => {
          item.disabled = false
          item.reset && item.reset()
        })
        userEditModal.value?.show()
      }
      const onUserInfoConfirm = async () => {
        if (formItems.every((it) => (it.validator ? it.validator() : true))) {
          let option = formItems.reduce((pre, cur) => {
            ;(pre as any)[cur.key] = cur.value.value
            return pre
          }, {})
          const { id, ...restRoles } = option as Users
          if (actionModal.value === 'edit') {
            await updateUsersApi(option as Users)
          } else {
            await addUserApi(restRoles as Users)
          }
          doRefresh()
          userEditModal.value?.toggle()
        }
      }
      function onUpdateExpandedKeys(keys: any) {
        getExpandedKeys.value = [...keys]
      }
      const getExpandedKeys = ref([] as Array<number>)

      onMounted(async () => {
        table.tableHeight.value = (await useTableHeight(getCurrentInstance())) as number
        doRefresh()
      })
      return {
        ...table,
        rowKey,
        userEditModal,
        selectedRowKeys,
        onSelectChange,
        expandAllFlag,
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
        disabledKey,
        onUserInfoConfirm,
        onCustomSelectRow,
        useCustomeRowSelect,
      }
    },
  })
</script>
