<template>
  <div ref="basicTable">
    <!-- <a-divider orientation="left">{{ key }}</a-divider> -->
    <a-table
      bordered
      :pagination="false"
      :columns="columns"
      :data-source="tableData?.param"
      :scroll="{ x: 1100, y: 655 }"
    >
      <template #bodyCell="{ index, column, text, value, record }">
        <template v-if="column.key === 'tagName'">
          <div class="editable-cell">
            <div
              v-if="editData[record.id] && editData.dataIndex === column.key"
              class="editable-cell-input-wrapper"
            >
              <a-input
                v-click-outside
                @blur="editData = {}"
                v-show="column.key === 'tagName'"
                v-model:value="editData[record.id].tagName"
                class="ml-5"
              ></a-input>

              <check-outlined class="editable-cell-icon-check" @click="saveCellValue(record)" />
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
              <span
                class="editable-cell-text"
                @dblclick="
                  record.policy.startsWith('位号')
                    ? editCellValue(record.id, value, column.key)
                    : ''
                "
              >
                {{ text || '无' }}
              </span>
              <edit-outlined
                v-if="record.policy.startsWith('位号')"
                @click="editCellValue(record.id, value, column.key)"
                class="editable-cell-icon"
              />
            </div>
          </div>
        </template>
        <template v-if="(type ? ['value'] : ['value', 'policy']).includes(column.key)">
          <template v-if="record.isReadOnly === false">
            <div class="editable-cell">
              <div
                v-if="editData[record.id] && editData.dataIndex === column.key"
                class="editable-cell-input-wrapper"
              >
                <a-input
                  v-click-outside
                  @blur="editData = {}"
                  v-show="column.key === 'tagName'"
                  v-model:value="editData[record.id].tagName"
                  class="ml-5"
                ></a-input>
                <a-textarea
                  v-show="column.key === 'desc'"
                  v-model:value="editData[record.id].desc"
                  class="ml-5"
                ></a-textarea>
                <a-select
                  autofocus
                  defaultOpen
                  @blur="onCancleSelect"
                  @dropdownVisibleChange="(open:boolean)=>onDrop(open,record.policy,editData[record.id].policy)"
                  v-if="column.key === 'policy'"
                  v-model:value="editData[record.id].policy"
                  class="w-full"
                >
                  <a-select-option
                    v-for="option in record.policyRange"
                    :key="option"
                    :value="option"
                  >
                    <span :title="option">{{ option }}</span>
                  </a-select-option>
                </a-select>
                <a-select
                  autofocus
                  defaultOpen
                  @blur="onCancleSelect"
                  @dropdownVisibleChange="(open:boolean)=>onDrop(open,record.value,editData[record.id].value)"
                  v-if="column.key === 'value' && record.isEnumValueType"
                  v-model:value="editData[record.id].value"
                  class="w-full"
                >
                  <a-select-option
                    v-for="option in record.valueRange"
                    :key="option"
                    :value="option"
                  >
                    <span :title="option">{{ option }}</span>
                  </a-select-option>
                </a-select>
                <a-input
                  v-click-outside
                  @blur="editData = {}"
                  v-if="column.key === 'value' && !record.isEnumValueType"
                  v-model:value="editData[record.id].value"
                ></a-input>
                <check-outlined class="editable-cell-icon-check" @click="saveCellValue(record)" />
              </div>
              <div
                :title="
                  record.isEnumValueType === false
                    ? text + ' (' + record.valueRange.join(' ~ ') + ')'
                    : text
                "
                v-else
                class="editable-cell-text-wrapper"
                :style="{ color: handleVarColor(text) }"
              >
                <span
                  class="editable-cell-text"
                  @dblclick="editCellValue(record.id, value, column.key)"
                >
                  {{ text || '无' }}
                </span>
                <edit-outlined
                  @click="editCellValue(record.id, value, column.key)"
                  class="editable-cell-icon"
                />
              </div>
            </div>
          </template>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import { cloneDeep } from 'lodash-es'

  import { useTableColumn } from '@/hooks/table'
  import { Params } from '@/types/apis/dpc/mpc'
  import { ref, UnwrapRef, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { handleVarColor } from '@/utils/utils'
  import { setParamValueApi } from '@/api/modules'
  const route = useRoute()
  const emit = defineEmits(['refreshVar'])
  const props = withDefaults(
    defineProps<{
      tableData: {
        type: string
        param: Params[]
      }
      varName: string
      type: string
    }>(),
    {
      tableData: <T extends Params>(): T | any => {},
      tableColumn: () => [],
    }
  )

  const columns = useTableColumn(
    [
      {
        key: 'name',
        dataIndex: 'name',
        title: '参数名称',
        fixed: true,
        width: 150,
      },
      {
        key: 'classType',
        dataIndex: 'classType',
        title: '所属分类',
        width: 150,
      },
      {
        key: 'policy',
        dataIndex: 'policy',
        title: '策略',
      },
      {
        key: 'value',
        dataIndex: 'value',
        title: '值',
        // width: 150,
      },
      {
        key: 'tagName',
        dataIndex: 'tagName',
        title: '位号信息',
      },
      {
        key: 'desc',
        dataIndex: 'desc',
        title: '描述',
        width: 300,
      },
    ],
    { align: 'center', ellipsis: true }
  )
  const basicTable = ref<Element>()
  const editData: UnwrapRef<Record<string | number, any>> = ref({})
  const editCellValue = (key: number, value: string, dataIndex: string) => {
    editData.value = {}
    editData.value[key] = cloneDeep(props.tableData.param.filter((item) => key === item.id)[0])
    editData.value.dataIndex = dataIndex
  }
  const onCancleSelect = () => {
    editData.value = {}
  }
  const onDrop = (open: boolean, record: any, old: any) => {
    const isEqual = record === old
    !open && isEqual && onCancleSelect()
  }
  //保存单元格
  const saveCellValue = async (col: any) => {
    const prjName = route.query.name as any
    const option = editData.value[col.id]
    await setParamValueApi(
      {
        prjName,
        varType: props.tableData.type,
        varName: props.varName,
        paramID: option.id.toString(),
        paramName: option.name,
        policy: option.policy,
        value: option.value,
        tagInfo: option.tagName,
      },
      props.type as string
    )
    delete editData.value[col.id]
    delete editData.value.dataIndex
    //父级刷新数据
    emit('refreshVar')
  }
</script>

<style scoped lang="less">
  @import url('./index.less');
</style>
