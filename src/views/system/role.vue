<template>
  <div class="main-container">
    <TableHeader ref="tableHeaderRef" :show-filter="false">
      <template #top-right>
        <AddButton @add="onAddItem" />
      </template>
    </TableHeader>
    <TableBody>
      <template #default>
        <a-table
          :loading="tableLoading"
          :data-source="dataList"
          :columns="tableColumns"
          :pagination="false"
          :row-key="rowKey"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button ghost type="primary" @click="onUpdateItem(record)" size="small"
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
                <!-- <a-button ghost type="primary" size="small" @click="onShowMenus(record)">
                  <template #icon>
                    <audit-outlined />
                  </template>
                  菜单权限
                </a-button>
                <a-button size="small" @click="onShowUsers(record)">
                  <template #icon>
                    <user-switch-outlined />
                  </template>
                  用户
                </a-button> -->
              </a-space>
            </template>
          </template>
        </a-table>
      </template>
    </TableBody>
    <DrawerDialog ref="modalDialogRef" :title="actionTitle" @confirm="onDataFormConfirm">
      <template #content>
        <a-form>
          <a-form-item
            :class="[item.required ? 'form-item__require' : 'form-item__no_require']"
            :label="item.label"
            v-for="item of formItems.filter((item) => item.label !== 'id')"
            :key="item.key"
          >
            <template v-if="item.type === 'input'">
              <a-input :placeholder="item.placeholder" v-model:value="item.value.value"> </a-input>
            </template>
            <template v-if="item.type === 'textarea'">
              <a-textarea
                v-model:value="item.value.value"
                :placeholder="item.placeholder"
                :auto-size="{ minRows: 3, maxRows: 5 }"
              />
            </template>
            <template v-if="item.type === 'tree-menus'">
              <a-tree
                :tree-data="store.menus"
                checkable
                :fieldNames="{ title: 'name', key: 'id' }"
                v-model:expandedKeys="defaultExpandedUserKeys"
                v-model:checkedKeys="item.value.value"
                @check="checkNode"
              />
            </template>
            <template v-if="item.type === 'tree-users'">
              <a-tree
                :tree-data="treeUsers"
                checkable
                :fieldNames="{ title: 'name', key: 'id' }"
                v-model:expandedKeys="defaultExpandedUserKeys"
                v-model:checkedKeys="item.value.value"
              />
            </template>
          </a-form-item>
        </a-form>
      </template>
    </DrawerDialog>
    <!-- <DrawerDialog ref="menuModalDialogRef" title="编辑菜单权限" @confirm="onMenuConfirm">
      <template #content>
        <a-tree
          :tree-data="menuData"
          checkable
          v-model:expandedKeys="defaultExpandedKeys"
          v-model:checkedKeys="defaultCheckedKeys"
        />
      </template>
    </DrawerDialog> -->
  </div>
</template>

<script lang="ts">
  import {
    addRoleApi,
    getRolesApi,
    getUsersApi,
    getUsersByRoleIdApi,
    getPagesByRoleIdApi,
    updateUsersByRidApi,
    updatePagesByRidApi,
  } from '@/api/modules/index'
  import { useRowKey, useTable, useTableColumn } from '@/hooks/table'
  import { Users } from '@/types/apis/user'
  import { Roles, UserByRidRes, PageByidRes } from '@/types/apis/roles'
  import { ModalDialogType, FormItem } from '@/types/components'
  import { message, Modal } from 'ant-design-vue'
  import useUserStore from '@/store/modules/user'
  import { defineComponent, nextTick, onMounted, ref, shallowReactive } from 'vue'
  import { deleteRoleApi, updateRolesApi } from '@/api/modules/roles'
  const ROLE_CODE_FLAG = 'ROLE_'
  const formItems = [
    {
      label: 'id',
      key: 'id',
      value: ref(null),
      reset: function () {
        this.value.value = null
      },
    },
    {
      label: '角色名称',
      type: 'input',
      disabled: false,
      key: 'name',
      value: ref(''),
      required: true,
      placeholder: '请输入角色名称',
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

    {
      label: '角色描述',
      key: 'desc',
      disabled: false,
      value: ref(''),
      type: 'textarea',
      placeholder: '请输入角色描述',
      reset: function () {
        this.value.value = ''
      },
    },
    {
      label: '菜单权限',
      key: 'pages',
      value: ref([]),
      type: 'tree-menus',
      reset: function () {
        this.value.value = []
      },
    },
    {
      label: '用户',
      key: 'users',
      value: ref([]),
      type: 'tree-users',
      reset: function () {
        this.value.value = []
      },
    },
  ] as FormItem[]
  function handleMenuData(
    menuData: Array<any>,
    defaultCheckedKeys: Array<string>,
    defaultExpandedKeys: Array<string>
  ) {
    const tempMenus = [] as Array<any>
    menuData.forEach((it) => {
      const tempMenu = {} as any
      tempMenu.key = it.menuUrl
      tempMenu.title = it.menuName
      defaultCheckedKeys.push(tempMenu.key as string)
      if (it.children) {
        defaultExpandedKeys.push(tempMenu.key as string)
        tempMenu.children = handleMenuData(it.children, defaultCheckedKeys, defaultExpandedKeys)
      }
      tempMenus.push(tempMenu)
    })
    return tempMenus
  }
  export default defineComponent({
    name: 'Role',
    setup() {
      const modalDialogRef = ref<ModalDialogType | null>(null)
      const menuModalDialogRef = ref<ModalDialogType | null>(null)
      const table = useTable()
      const rowKey = useRowKey('id')
      const actionTitle = ref('添加角色')
      const menuData = shallowReactive([] as Array<any>)
      const store = useUserStore()
      const treeUsers = ref<Users>()
      const tableColumns = useTableColumn(
        [
          table.indexColumn,
          {
            title: '角色名称',
            key: 'name',
            dataIndex: 'name',
          },

          {
            title: '角色描述',
            key: 'desc',
            dataIndex: 'desc',
          },

          {
            title: '操作',
            key: 'actions',
          },
        ],
        { align: 'center' }
      )
      const defaultCheckedKeys = ref([] as Array<string>)
      const defaultExpandedKeys = ref([] as Array<string>)
      const defaultCheckedUserKeys = ref([] as Array<string>)
      const defaultExpandedUserKeys = ref([] as Array<string>)
      async function doRefresh() {
        let res = await getRolesApi()
        table.handleSuccess(res)
      }
      //获取菜单/用户
      const getUserList = async () => {
        treeUsers.value = await getUsersApi()
      }
      function onAddItem() {
        actionTitle.value = '添加角色'
        formItems.forEach((it) => {
          it.disabled = false
          it.reset && it.reset()
        })
        modalDialogRef.value?.toggle()
      }
      async function onUpdateItem(item: any) {
        actionTitle.value = '编辑角色'
        let users = await getUsersByRoleIdApi(item.id)
        let menus = await getPagesByRoleIdApi(item.id)
        modalDialogRef.value?.toggle()
        nextTick(() => {
          formItems.forEach((it) => {
            const key = it.key
            const propName = item[key] as any
            it.value.value = propName
            if (key === 'pages') {
              it.value.value = menus.map((page: PageByidRes) => page.pageId)
            } else if (key === 'users') {
              it.value.value = users.map((user: UserByRidRes) => user.userId)
            } else if (item.isSystemReserved && it.disabled === false) {
              it.disabled = true
            }
          })
        })
      }
      async function onDeleteItem(item: any) {
        await deleteRoleApi(item.id)
        doRefresh()
      }
      async function onDataFormConfirm() {
        if (formItems.every((it) => (it.validator ? it.validator() : true))) {
          let option: Roles = {}
          option = formItems.reduce((pre, cur) => {
            ;(pre as any)[cur.key] = cur.value.value
            return pre
          }, {})
          const { id, ...restRoles } = option as Roles
          if (actionTitle.value === '添加角色') {
            await addRoleApi(restRoles)
          } else {
            await updateRolesApi({ id, ...restRoles })
          }

          doRefresh()
          modalDialogRef.value?.toggle()
        }
      }

      function onMenuConfirm() {
        menuModalDialogRef.value?.close()
        message.success('提交成功: ' + JSON.stringify(defaultCheckedKeys.value))
      }
      const checkNode = (key: string[], e: any) => {
        console.log(e)
      }

      onMounted(() => {
        doRefresh()
        getUserList()
      })
      return {
        store,
        ROLE_CODE_FLAG,
        modalDialogRef,
        menuModalDialogRef,
        rowKey,
        menuData,
        tableColumns,
        formItems,
        actionTitle,
        defaultCheckedKeys,
        defaultExpandedKeys,
        ...table,
        onAddItem,
        onDataFormConfirm,
        onDeleteItem,
        onUpdateItem,
        onMenuConfirm,
        defaultExpandedUserKeys,
        defaultCheckedUserKeys,
        treeUsers,
        checkNode,
      }
    },
  })
</script>
