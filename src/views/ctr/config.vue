<template>
  <div>
    <table-header>
      <template #top-left>
        <add-button @add="onAdd" />
        <a-button size="small">
          <template #icon>
            <arrow-right-outlined />
          </template>
          导入
        </a-button>
        <a-button size="small">
          <template #icon>
            <arrow-down-outlined />
          </template>
          导出
        </a-button>
        <delete-button name="批量删除"> </delete-button>
      </template>
    </table-header>
    <table-body>
      <a-table
        :columns="colums"
        :loading="tableLoading"
        :rowKey="rowKey"
        :data-source="dataList"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      >
        <template #bodyCell="{ text, record, index, column }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="primary" size="small" ghost @click="onEdit(text)">编辑</a-button>
              <a-popconfirm placement="top" ok-text="是" cancel-text="否" @confirm="onConfirm">
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
    <modal-dialog ref="useModal" :title="title" />
  </div>
</template>

<script setup lang="ts">
  import { ModalDialogType } from '@/types/components'
  import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue'
  import { useTable, useRowKey, useRowSelection } from '@/hooks/table'
  import ModalDialog from '@/components/ModalDialog.vue'
  import { DataType } from './type'
  const { useTableColumn, indexColumn, handleSuccess, tableLoading, dataList } = useTable()
  const rowKey = useRowKey('name')
  const { selectedRowKeys, onSelectChange } = useRowSelection()
  const useModal = ref<ModalDialogType>(null)
  const title = ref<string>('')
  const list = reactive({
    data: [
      {
        id: 1,
        name: '123',
        dec: 'were',
        enable: true,
        period: 10,
        timeout: 100,
        method: '789',
      },
      {
        id: 2,
        name: 'wod123',
        dec: 'were',
        enable: false,
        period: 10,
        timeout: 100,
        method: '789',
      },
    ] as DataType[],
  }) //必须是data
  const colums = useTableColumn(
    [
      indexColumn,
      {
        title: '控制脚本名称',
        key: 'name',
        dataIndex: 'name',
      },
      {
        title: '脚本描述',
        key: 'dec',
        dataIndex: 'dec',
      },
      {
        title: '是否启用',
        key: 'enable',
        dataIndex: 'enable',
      },
      {
        title: '控制脚本运行周期（秒）',
        key: 'period',
        dataIndex: 'period',
      },
      {
        title: '脚本执行最大超时（秒）',
        key: 'timeout',
        dataIndex: 'timeout',
      },
      {
        title: '入口方法',
        key: 'method',
        dataIndex: 'method',
      },
      {
        title: '操作',
        key: 'action',
      },
    ],
    { align: 'center' }
  )
  //添加按钮
  const onAdd = () => {
    useModal.value?.show()
    title.value = '添加控制脚本'
    //清除每一项内容 reset（）
  }
  //编辑按钮
  const onEdit = (text: DataType) => {
    useModal.value?.show()
    title.value = '编辑-' + text.name
  }
  //删除
  const onConfirm = () => {}
  onMounted(() => {
    handleSuccess(list)
  })
</script>

<style scoped lang="less"></style>
