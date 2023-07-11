<template>
  <div>
    <template v-for="(item, key) in mapType" :key="key">
      <a-divider v-if="item.data.length" orientation="left">{{ keyMap[key as any] }}</a-divider>
      <a-table
        v-if="item.data.length"
        bordered
        :pagination="false"
        :columns="item.col"
        :data-source="item.data"
      >
        <template #bodyCell="{ index, column, text, value, record }">
          <template v-if="column.title === '最近一次运行时间'">
            {{ componentData.lastRunTime }}
          </template>
          <template v-if="column.isReadOnly === false">
            <div class="editable-cell">
              <div
                v-if="editData[record.varName] && editData[record.varName].key === column.key"
                class="editable-cell-input-wrapper"
              >
                <a-input
                  v-if="column.isEnumValueType === false"
                  v-click-outside:onCancleSelect.editData.record="{
                    editData,
                    record,
                    indexName: 'varName',
                  }"
                  v-model:value="record[column.dataIndex]"
                  @pressEnter="saveCellValue(column, record.varName, record[column.key])"
                  class="ml-5"
                ></a-input>
                <a-select
                  v-else
                  autofocus
                  defaultOpen
                  @blur="onCancleSelect(record)"
                  @dropdownVisibleChange="(open:boolean)=>onDrop(open,record[column.key],record)"
                  v-model:value="record[column.dataIndex]"
                  class="w-full"
                >
                  <a-select-option
                    v-for="option in column.valueRange"
                    :key="option"
                    :value="option"
                  >
                    <span :title="option">{{ option }}</span>
                  </a-select-option>
                </a-select>
                <check-outlined
                  class="editable-cell-icon-check"
                  @click="saveCellValue(column, record.varName, record[column.key])"
                />
              </div>
              <div
                :title="
                  column.isEnumValueType === false
                    ? text + ' (' + column.valueRange.join(' ~ ') + ')'
                    : text
                "
                v-else
                class="editable-cell-text-wrapper"
                :style="{ color: handleVarColor(text) }"
              >
                <span class="editable-cell-text" @dblclick="ondblclick(column, record)">
                  {{ text }}
                </span>
                <edit-outlined @click="editCellValue(column, record)" class="editable-cell-icon" />
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, onMounted, UnwrapRef, computed } from 'vue'
  import { cloneDeep, isEqualWith } from 'lodash-es'
  import { handleVarColor } from '@/utils/utils'
  import { useTableColumn, useTable } from '@/hooks/table'
  import { PrjTotalData, Params, varColor } from '@/types/apis/dpc/mpc'
  import { ParamRolesById } from '@/types/apis/dpc/roles'
  import { getParamsByVarTypeApi, setParamValueApi, getParamsByIdApi } from '@/api/modules'
  import { TableColumn } from 'ant-design-vue'
  import { useRoute } from 'vue-router'
  // let loading = ref<boolean>(true)
  const route = useRoute()
  const props = withDefaults(
    defineProps<{
      componentData: any
      type: string
    }>(),
    {
      componentData: () => [],
    }
  )
  const emit = defineEmits(['refreshOview'])
  const keyMap: any = {
    ctr: '控制器参数',
    mVs: '操作变量',
    dVs: '扰动变量',
    cVs: '被控变量',
  }
  let ctrData: any = ref([{}])
  //指定参数
  const varType = ['ctr', 'mVs', 'dVs', 'cVs']
  let mapType = ref<any>({})
  const roleVars = ref<ParamRolesById>()
  watch(
    () => props.componentData,
    () => {
      // loading.value = true
      handleData()
    }
  )

  /**
   * 处理cps
   */
  const handleCtr = async () => {
    const cpsParams = (props.componentData as PrjTotalData).cPs?.params
    const roleId = props.componentData.roleId

    const whiteCol = ['控制器开关', '控制器状态', '最近一次运行时间']
    if (cpsParams) {
      const ctrCol = whiteCol.map((item: string) => {
        const currentCps = cpsParams.find((cps) => cps.name === item)
        return {
          key: currentCps?.id,
          dataIndex: currentCps?.id,
          title: item,
          ...currentCps,
          type: (props.componentData as PrjTotalData).cPs.type,
        }
      })
      //处理数据 colums中的dataIndex的值对应的是table数据中的id table数据中每一项的id作为一行数据中一个单元格的属性，就可以和表头中的路径对应
      mapType.value.ctr.data[0] = cpsParams.reduce((obj: any, curr: any) => {
        const currentCps = whiteCol.find((cps) => cps === curr.name)
        if (currentCps) {
          const key = curr.id.toString()
          // obj.varName = (props.componentData as PrjTotalData).cPs?.name
          obj.varName = 'ctr'
          obj[key] = curr.value || ''
        }
        return obj
      }, {})
      mapType.value.ctr.col = useTableColumn(ctrCol, {
        align: 'center',
        width: 150,
        ellipsis: true,
      }) as any
    }
  }
  const handleMv = <K extends keyof PrjTotalData>(type: K) => {
    const paramsType = type === 'cVs' ? 'cv' : type === 'dVs' ? 'dv' : 'mv'

    const list = (props.componentData as PrjTotalData)[type] as Array<any>
    if (list && list.length > 0) {
      let mvCol = list[0].params.map((item: Params) => {
        return {
          key: item.id,
          dataIndex: item.id,
          title: item.name,
          ...item,
          type: list[0].type,
        }
      })
      if (roleVars.value && roleVars.value?.[paramsType]?.length) {
        mvCol = mvCol.filter((item: any) => {
          const isHas = roleVars.value?.[paramsType].find((r) => r === item.title)
          if (isHas) {
            return true
          }
        })
      }
      const nameCol = {
        dataIndex: 'varName',
        title: '变量名称',
      }
      mapType.value[type].col = useTableColumn([nameCol, ...mvCol], {
        align: 'center',
        ellipsis: true,
        width: 150,
      }) as any
      let valueData = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        const params = element.params
        const data = params.reduce((obj: any, curr: any) => {
          const key = curr.id.toString()
          obj.varName = element.name
          obj[key] = curr.value
          return obj
        }, {})
        valueData.push(data)
      }
      mapType.value[type].data = valueData
    }
  } //编辑单元格
  const editData: UnwrapRef<Record<string | number, any>> = reactive({})

  const editCellValue = (column: typeof TableColumn, record: any) => {
    editData[record?.varName] = column
  }

  //失去焦点呢取消选择
  const onCancleSelect = (record: any) => {
    editData[record?.varName] = {}
  }
  //展开下拉框事件
  const onDrop = (open: boolean, value: any, record: any) => {
    //判断当前值和原来值是否相等如果相等，则直接失去焦点
    const isEqual = value === editData[record.varName].value
    !open && isEqual && onCancleSelect(record)
  }
  const ondblclick = (column: typeof TableColumn, record: any) => {
    editCellValue(column, record)
  }
  //保存单元格
  const saveCellValue = async (col: any, varName: string, value: string) => {
    const prjName = route.query.name as any
    await setParamValueApi(
      {
        prjName,
        varType: col.type,
        varName,
        paramID: col.id.toString(),
        paramName: col.name,
        policy: col.policy,
        value,
        tagInfo: col.tagName,
      },
      props.type
    )
    delete editData[varName]
    //父级刷新数据
    emit('refreshOview')
  }
  const handleData = () => {
    mapType.value = {}
    mapType.value = varType.reduce((item: any, curr) => {
      item[curr] = {
        col: [],
        data: [],
      }
      return item
    }, {})
    handleCtr()
    handleMv('mVs')
    handleMv('cVs')
    handleMv('dVs')
  }
  const handleRolesVar = async (roleId: string) => {
    if (!roleId) {
      roleVars.value = {} as any
      return emit('refreshOview')
    }
    const res = await getParamsByIdApi(roleId)
    roleVars.value = res
    handleMv('mVs')
    handleMv('cVs')
    handleMv('dVs')
  }
  defineExpose({ handleRolesVar })
  onMounted(() => {
    handleData()
  })
</script>

<style scoped lang="less">
  @import url('./index.css');
</style>
