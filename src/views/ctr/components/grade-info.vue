<template>
  <a-table :columns="columns" :data-source="componentData" :pagination="false">
    <template #bodyCell="{ record, column, text, value, index }">
      <template v-if="(type ? [''] : ['policy']).includes(column.key)">
        <div class="editable-cell">
          <div
            v-if="editData[index] && editData.dataIndex === column.key"
            class="editable-cell-input-wrapper"
          >
            <a-select
              v-show="column.key === 'policy'"
              v-model:value="editData[index].policy"
              style="width: 50%"
            >
              <a-select-option v-for="option in record.policyRange" :key="option" :value="option">
                <span :title="option">{{ option }}</span>
              </a-select-option>
            </a-select>
            <check-outlined class="editable-cell-icon-check" @click="saveCellValue(index)" />
          </div>
          <div :title="text" v-else class="text-blue-500 editable-cell-text-wrapper">
            <span class="editable-cell-text">
              {{ text }}
            </span>
            <edit-outlined
              @click="editCellValue(index, value, column.key)"
              class="editable-cell-icon"
            />
          </div>
        </div>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { useTableColumn } from '@/hooks/table'
  import { ref, UnwrapRef } from 'vue'
  import { cloneDeep } from 'lodash-es'
  import { useRoute } from 'vue-router'
  import { setRankParamValueApi } from '@/api/modules'
  type PolicyRange = 'LP' | 'QP'
  interface TableData {
    level: number
    policy: PolicyRange
    policyRange: PolicyRange[]
  }
  const route = useRoute()
  const props = withDefaults(defineProps<{ componentData: TableData[]; type: string }>(), {
    componentData: () => [],
  })
  const emit = defineEmits(['refreshOview'])
  const columns = useTableColumn(
    [
      {
        key: 'level',
        title: '等级',
        dataIndex: 'level',
      },
      {
        key: 'policy',
        title: '策略',
        dataIndex: 'policy',
      },
    ],
    {
      align: 'center',
      width: 150,
    }
  )
  const editData: UnwrapRef<Record<string | number, any>> = ref({})
  const editCellValue = (key: number, value: string, dataIndex: string) => {
    editData.value = {}
    editData.value[key] = cloneDeep(props.componentData[key])
    editData.value.dataIndex = dataIndex
  }
  //保存单元格
  const saveCellValue = async (key: string) => {
    //判断当前增益和增益上下限匹配问题
    const { policy, level } = editData.value[key]

    const prjName = route.query.name as any
    await setRankParamValueApi(
      {
        prjName,
        level,
        policy,
      },
      props.type
    )
    editData.value = {}
    // //父级刷新数据
    emit('refreshOview')
  }
</script>

<style scoped lang="less">
  @import url('./index.less');
</style>
