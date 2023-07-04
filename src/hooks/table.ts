import { reactive, Ref, ref, shallowReactive } from 'vue'

import { TableFooterType, TableHeaderType } from '@/types/components'
import { TableColumnType } from 'ant-design-vue'
import { TableRowSelection } from 'ant-design-vue/lib/table/interface'

interface Table {
  dataList: Array<any>
  bordered: Ref<Boolean>
  striped: Ref<Boolean>
  tableLoading: Ref<boolean>
  tableHeaderRef: Ref<TableHeaderType | null>
  tableFooterRef: Ref<TableFooterType | null>
  tableHeight: Ref<number>
  handleSuccess: (res: any) => Promise<any>
  useTableColumn: (columns: TableColumnType[] | any, options: TableColumnType) => Array<any>
  selectionColumn: { type: 'selection' }
  indexColumn: {
    title: string
    key: string
    width: number
  }
}

export const useTableHeight = async function (currentIns: any, otherClass?: any): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const clientHeight =
        document.querySelector('.main-section')?.getBoundingClientRect().height || 0
      const tableHeaderHeight =
        document.querySelector('.ant-table-header')?.getBoundingClientRect().height || 0
      const tableFooterHeight = 56 //antd分页大小
      // document.querySelector('.ant-pagination')?.getBoundingClientRect().height || 0
      const otherClassHeight =
        document.querySelector(otherClass)?.getBoundingClientRect().height || 0
      if (currentIns) {
        let tempHeight = tableHeaderHeight
        if (currentIns.refs.tableHeaderRef) {
          const header = (currentIns.refs as any).tableHeaderRef.$el
          tempHeight += header.clientHeight
        } else {
          tempHeight += otherClassHeight
        }
        if (currentIns.refs.tableFooterRef) {
          tempHeight += (currentIns.refs as any).tableFooterRef.$el.clientHeight
        } else {
          // tempHeight += tableFooterHeight
          // tempHeight -= 45
        }
        resolve(clientHeight - tempHeight)
      }
      resolve(150)
    }, 300)
  })
}

export const useTable = function (): Table {
  const dataList = shallowReactive([]) as Array<any>
  const tableHeaderRef = ref<TableHeaderType | null>(null)
  const tableFooterRef = ref<TableFooterType | null>(null)
  const tableHeight = ref<number>(200)
  const bordered = ref(false)
  const striped = ref(false)
  const tableLoading = ref(true)
  const handleSuccess = (data: Array<object>): Promise<any> => {
    dataList.length = 0
    dataList.push(...data)
    tableLoading.value = false
    return Promise.resolve(data)
  }
  return {
    dataList,
    tableHeaderRef,
    tableFooterRef,
    tableHeight,
    bordered,
    striped,
    tableLoading,
    handleSuccess,
    useTableColumn,
    selectionColumn: {
      type: 'selection',
    },
    indexColumn: useTableIndexColumn(),
  }
}

export const useRowKey = function (propName: string) {
  return function (rowData: any) {
    return rowData[propName]
  }
}

type RowSelectKey = string | number
type RowSelectType = 'checkbox' | 'radio'
let selectedRowKeys = ref<Array<RowSelectKey>>([])
let rowSelectType = ref<RowSelectType>()
export const useRowSelection = function (selectType: RowSelectType = 'checkbox') {
  rowSelectType.value = selectType
  const onSelectChange = (tempSelectRows: Array<RowSelectKey>) => {
    selectedRowKeys.value = tempSelectRows
  }
  console.log(rowSelectType.value)

  return {
    selectedRowKeys,
    onSelectChange,
    rowSelectType,
  }
}
/**
 * 行选中
 * @param record
 */
// T 为 key为字符串 value为任意的 对象
function selectRow<T extends Record<string, any>>(record: T, i: any, attr: keyof T) {
  let selectedRowKey: Array<RowSelectKey> = []
  if (rowSelectType.value === 'checkbox') {
    selectedRowKeys.value = [...selectedRowKeys.value]
    if (selectedRowKey.indexOf(record[attr]) >= 0) {
      selectedRowKey.splice(selectedRowKey.indexOf(record[attr]), 1)
    } else {
      selectedRowKey.push(record[attr])
    }
    selectedRowKeys.value = selectedRowKey
  } else {
    selectedRowKeys.value = [record[attr]]
  }
}
export function useCustomeRowSelect<T extends Record<string, any>>(
  record: T,
  i: number,
  attr: keyof T
) {
  return {
    onclick: () => {
      selectRow<T>(record, i, attr)
    },
  }
}
export const useTableColumn = function (columns: TableColumnType[], options: TableColumnType = {}) {
  return columns.map((it) => Object.assign(it, options))
}

export const useTableIndexColumn = function () {
  return {
    title: '序号',
    key: 'index',
    width: 80,
  }
}

export const usePagination = function (callback?: () => void) {
  const onChange = () => (callback ? callback() : {})
  const paginationInfo = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageCount: 1,
    pageSizes: ['10', '20', '30', '40'],
    onChange,
    setTotalSize(totalSize: number) {
      paginationInfo.pageCount = totalSize
    },
  })
  return paginationInfo
}
