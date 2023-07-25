<template>
  <div>
    <table-header ref="tableHeaderRef">
      <template #top-left>
        <add-button @add="addItem" />
        <a-button size="small">导入</a-button>
        <a-button size="small">导出</a-button>
        <delete-button @delete="deleteItem" name="批量删除" />
      </template>
    </table-header>
    <table-body>
      <a-table :loading="tableLoading" :scroll="{ y: tableHeight }" :columns="columns">
        <template #bodyCell="{ column }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button ghost type="primary">编辑</a-button>
              <delete-button @delete="deleteItem" name="批量删除" />
            </a-space>
          </template>
        </template>
      </a-table>
    </table-body>
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    reactive,
    toRefs,
    onBeforeMount,
    onMounted,
    watchEffect,
    computed,
    getCurrentInstance,
  } from 'vue'
  import { useTable, useTableHeight } from '../../hooks/table'
  const {
    tableHeaderRef,
    tableHeight,
    tableLoading,
    handleSuccess,
    indexColumn,
    tableFooterRef,
    useTableColumn,
  } = useTable()

  const columns = useTableColumn(
    [
      indexColumn,
      {
        title: '控制脚本名称',
      },
      {
        title: '脚本描述',
      },
      {
        title: '是否启用',
      },
      {
        title: '运行脚本周期（秒）',
      },
      {
        title: '脚本执行最大超时（秒）',
      },
      {
        title: '入口方法',
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
  onMounted(async () => {
    tableHeight.value = await useTableHeight(getCurrentInstance())
    console.log(tableHeight.value)
  })
</script>

<style scoped lang="less"></style>
