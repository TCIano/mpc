<template>
  <div>
    <table-header>
      <template #top-left>
        <a-button size="small" style="background-color: #6fc140; color: white">
          <template #icon> <vertical-align-bottom-outlined /> </template>
          导出运行报告
        </a-button>
      </template>
      <template #top-right>
        <a-radio-group size="small" v-model:value="type">
          <a-radio-button value="day">日报</a-radio-button>
          <a-radio-button value="week">周报</a-radio-button>
          <a-radio-button value="month">月报</a-radio-button>
          <a-radio-button value="year">年报</a-radio-button>
        </a-radio-group>
      </template>
    </table-header>
    <a-card>
      <template #title>
        <a-space>
          <unordered-list-outlined class="text-xl" />
          <span>控制器评估信息</span>
        </a-space>
      </template>
      <template #extra>
        <a-date-picker v-model:value="time" />
      </template>
      <a-table
        :row-key="evaKey"
        :bordered="bordered"
        :loading="tableLoading"
        :data-source="data.data"
        :columns="tableEvaluaColumns"
        :rowClassName="evaClass"
        class="evaTable"
      >
        <template #headerCell="{ title }">
          <span>{{ title }}</span>
        </template>
      </a-table>
    </a-card>

    <a-card>
      <template #title>
        <a-space>
          <unordered-list-outlined class="text-xl" />
          <span>控制器运维策略</span>
        </a-space>
      </template>
      <a-table
        :row-key="mainKey"
        :bordered="bordered"
        :loading="tableLoading"
        :data-source="mainData.data"
        :columns="tableMaintenanceColumns"
      >
      </a-table>
    </a-card>

    <a-card>
      <template #title>
        <a-space>
          <unordered-list-outlined class="text-xl" />
          <span>控制器报警统计</span>
        </a-space>
      </template>
      <div>
        <a-row>
          <a-col :span="24">
            <span>用户操作</span>
            <a-divider style="border-color: #74c0fc; margin-top: 1px" dashed />
          </a-col>
          <a-col :span="24">
            <span>工艺报警</span>
            <a-divider style="border-color: #74c0fc; margin-top: 1px" dashed />
          </a-col>
          <a-col :span="24">
            <span>先控报警</span>
            <a-divider style="border-color: #74c0fc; margin-top: 1px" dashed />
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts" name="Performance">
  import { timeFormatter } from '@/utils/utils'
  import type { Dayjs } from 'dayjs'
  import { useTable, useTableHeight, useRowKey } from '@/hooks/table'
  import {
    ref,
    reactive,
    toRefs,
    onBeforeMount,
    onMounted,
    watchEffect,
    computed,
    onActivated,
    getCurrentInstance,
  } from 'vue'

  const type = ref('day')
  const time = ref()

  const { dataList, tableLoading, handleSuccess, useTableColumn, bordered } = useTable()
  //添加表格边框
  bordered.value = true
  const tableHeight = computed(async () => {
    return await useTableHeight(getCurrentInstance())
  })

  const evaKey = useRowKey('MV')
  const evaClass = (record: object, index: number) => {
    // console.log(record, index)
  }
  const tableEvaluaColumns = useTableColumn(
    [
      {
        title: 'MV变量个数',
        key: 'MV',
        dataIndex: 'MV',
      },
      {
        title: 'CV变量个数',
        key: 'CV',
        dataIndex: 'CV',
      },
      {
        title: '投用率(%)',
        key: 'Usage ',
        dataIndex: 'Usage ',
      },
      {
        title: '卡边率',
        key: 'Stuck ',
        dataIndex: 'Stuck ',
      },
      {
        title: '性能评分',
        key: 'perf',
        dataIndex: 'perf',
      },
      {
        title: '平稳率(%)',
        key: 'Steadiness',
        dataIndex: 'Steadiness',
      },

      {
        title: '饱和率(%)',
        key: 'Saturation',
        dataIndex: 'Saturation',
      },
      {
        title: '好值率(%)',
        key: 'goodValue',
        dataIndex: 'goodValue',
      },
      {
        title: '报警数',
        key: 'alarm',
        dataIndex: 'alarm',
      },
      {
        title: '边际效益',
        key: 'Marginal',
        dataIndex: 'Marginal',
      },
      {
        title: 'T2',
        key: 'T2',
        dataIndex: 'T2',
      },
      {
        title: 'SPE',
        key: 'SPE',
        dataIndex: 'SPE',
      },
    ],
    {
      align: 'center',
    }
  )
  const mainKey = useRowKey('varName')
  const tableMaintenanceColumns = useTableColumn(
    [
      {
        title: '变量名称',
        key: 'varName',
        dataIndex: 'varName',
      },
      {
        title: '运维策略',
        key: 'strategy',
        dataIndex: 'strategy',
      },
      {
        title: '变量名称',
        key: 'varName',
        dataIndex: 'varName',
      },
      {
        title: '运维策略',
        key: 'strategy',
        dataIndex: 'strategy',
      },
    ],
    { align: 'center' }
  )

  let data = {
    data: [
      {
        MV: 10,
        CV: 10,
        Usage: 10,
        Stuck: 10,
        perf: 10,
        Steadiness: 10,
        Saturation: 10,
        goodValue: 10,
        alarm: 10,
        Marginal: 10,
        T2: 10,
        SPE: 10,
      },
    ],
  }
  let mainData = {
    data: [
      {
        varName: 'MV',
        strategy: 'MV',
      },
      {
        varName: 'CV',
        strategy: 'CV',
      },
      {
        varName: 'Usage',
        strategy: 'Usage',
      },
      {
        varName: 'Stuck',
        strategy: 'Stuck',
      },
      {
        varName: 'perf',
        strategy: 'perf',
      },
      {
        varName: 'Steadiness',
        strategy: 'Steadiness',
      },
      {
        varName: 'Saturation',
        strategy: 'Saturation',
      },
      {
        varName: 'goodValue',
        strategy: 'goodValue',
      },
      {
        varName: 'alarm',
        strategy: 'alarm',
      },
      {
        varName: 'Marginal',
        strategy: 'Marginal',
      },
      {
        varName: 'T2',
        strategy: 'T2',
      },
    ],
  }
  onMounted(async () => {
    data.data = await handleSuccess(data)
    mainData.data = await handleSuccess(mainData)
  })
</script>

<style scoped lang="less">
  @primary-btn: #438efc;

  ::deep .ant-radio-button-wrapper-checked {
    .ant-radio-button-checked {
      background-color: @primary-btn;
    }
    span {
      color: white;
    }
  }
  :deep(.ant-table) {
    .ant-table-container {
      table > thead > tr {
        th {
          background-color: whitesmoke;
        }
      }
    }
  }
</style>
