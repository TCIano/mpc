<template>
  <a-table
    :pagination="false"
    :columns="columns"
    :data-source="componentData"
    :scroll="{ x: 1000, y: 675 }"
  >
    <template #bodyCell="{ record, column, text, value, index }">
      <template v-if="column.key === 'integralFlag'">
        {{ text ? '积分' : '非积分' }}
      </template>
      <template v-if="column.key === 'tagName'">
        <div class="editable-cell">
          <div
            v-if="editData[index] && editData.dataIndex === column.key"
            class="editable-cell-input-wrapper"
          >
            <a-input
              v-show="column.key === 'tagName'"
              v-model:value="editData[index].tagName"
              class="ml-5"
            ></a-input>

            <check-outlined
              class="editable-cell-icon-check"
              @click="saveCellValue(index, column.key)"
            />
          </div>
          <div
            :title="
              record.isEnumValueType === false
                ? text + ' (' + record.valueRange.join(' ~ ') + ')'
                : text
            "
            v-else
            :class="
              record.policy.startsWith('位号') ? 'text-blue-500 editable-cell-text-wrapper' : ''
            "
          >
            <span class="editable-cell-text">
              {{ text || '无' }}
            </span>
            <edit-outlined
              v-if="record.policy.startsWith('位号')"
              @click="editCellValue(index, value, column.key)"
              class="editable-cell-icon"
            />
          </div>
        </div>
      </template>
      <template
        v-if="
          (!type
            ? ['policy', 'curK', 'lowLimit', 'hiLimit']
            : ['curK', 'lowLimit', 'hiLimit']
          ).includes(column.key)
        "
      >
        <div class="editable-cell">
          <div
            v-if="editData[index] && editData.dataIndex === column.key"
            class="editable-cell-input-wrapper"
          >
            <a-input-number
              v-show="column.key === 'curK'"
              @pressEnter="saveCellValue(index, column.key)"
              v-model:value="editData[index].curK"
              class="ml-5"
            ></a-input-number>
            <a-input-number
              v-show="column.key === 'lowLimit'"
              @pressEnter="saveCellValue(index, column.key)"
              v-model:value.number="editData[index].lowLimit"
              class="ml-5"
            ></a-input-number>
            <a-input-number
              v-show="column.key === 'hiLimit'"
              @pressEnter="saveCellValue(index, column.key)"
              v-model:value.number="editData[index].hiLimit"
              class="ml-5"
            ></a-input-number>
            <a-select
              v-show="column.key === 'policy'"
              v-model:value="editData[index].policy"
              class="w-full"
            >
              <a-select-option v-for="option in record.policyRange" :key="option" :value="option">
                <span :title="option">{{ option }}</span>
              </a-select-option>
            </a-select>
            <check-outlined
              class="editable-cell-icon-check"
              @click="saveCellValue(index, column.key)"
            />
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
  import { ref, reactive, UnwrapRef, onMounted } from 'vue'
  import { useTableColumn } from '@/hooks/table'
  import { useRoute } from 'vue-router'
  import { cloneDeep } from 'lodash-es'
  import { setModelInfoValueApi } from '@/api/modules'
  import { message } from 'ant-design-vue'
  const route = useRoute()
  const emit = defineEmits(['refreshOview'])
  const props = withDefaults(defineProps<{ componentData: any[]; type: string }>(), {
    componentData: () => [],
  })
  const columns = useTableColumn(
    [
      {
        key: 'inputName',
        title: '输入变量',
        fixed: true,
        dataIndex: 'inputName',
      },
      {
        key: 'outputName',
        title: '输出变量',
        fixed: true,
        dataIndex: 'outputName',
      },
      {
        key: 'integralFlag',
        title: '是否积分',
        dataIndex: 'integralFlag',
      },
      {
        key: 'rawK',
        title: '原始增益',
        dataIndex: 'rawK',
      },
      {
        key: 'policy',
        title: '策略',
        dataIndex: 'policy',
      },
      {
        key: 'curK',
        title: '当前增益',
        dataIndex: 'curK',
      },
      {
        key: 'tagName',
        title: '位号信息',
        dataIndex: 'tagName',
      },
      {
        key: 'lowLimit',
        title: '增益下限',
        dataIndex: 'lowLimit',
      },
      {
        key: 'hiLimit',
        title: '增益上限',
        dataIndex: 'hiLimit',
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
  const saveCellValue = async (key: string, param: string) => {
    //判断当前增益和增益上下限匹配问题
    const { curK, inputName, outputName, policy, hiLimit, lowLimit, tagName } = editData.value[key]
    const isPass = curK >= lowLimit && curK <= hiLimit && lowLimit < hiLimit
    if (!isPass) {
      return message.warning('当前增益范围或者是增益上下限有误，请重新输入！')
    }
    const prjName = route.query.name as any
    const option = props.type
      ? {
          prjName,
          value: editData.value[key][param],
          paramType: param,
        }
      : {
          policy,
          tagName,
          curK,
          hiLimit,
          lowLimit,
        }
    await setModelInfoValueApi(
      {
        prjName,
        inputName,
        outputName,
        ...option,
      },
      props.type as string
    )
    editData.value = {}
    // //父级刷新数据
    emit('refreshOview')
  }
</script>
<style scoped lang="less">
  @import url('./index.less');
</style>
