import { MessageApi } from 'ant-design-vue/lib/message'
import { Ref, VNode } from 'vue'
import * as Icons from '@ant-design/icons-vue/lib/icons'

export interface HeaderCellStyle {
  backgroundColor?: string
  color: string
}
//icon类型提示
export type IconNameType = keyof typeof Icons

export interface TableConfig {
  dataList: Array<any>
  stripe: boolean
  border: boolean
  size: string
  headerCellStyle: HeaderCellStyle
  height: string | number
  tableLoading: boolean
}

export interface SelectOptionItem {
  label: string
  value: any
}

export interface TableSearchItem {
  key: string | number
  label: string
  value: any
  placeholder?: string
  associatedOption?: string
  onChange?: (value: any, associationItem: string) => void
  span?: number
}

export interface FormItem extends TableSearchItem {
  required?: boolean
  validator?: (value?: FormItem, message?: MessageApi) => boolean
  hidden?: boolean
  type?: string
  maxLength?: number
  rows?: number
  disabled?: Ref<boolean> | boolean
  optionItems?: Array<SelectOptionItem>
  path?: string
  reset?: (formItem?: FormItem) => void
  render?: (formItem: FormItem) => VNode
}

export interface LikeSearchModel {
  conditionItems: Array<TableSearchItem> | null
  extraParams?: (() => Record<string, any>) | Record<string, any>
}

export interface TablePropsType {
  title: string
  key: string
  sortIndex: number
  checked: Ref<boolean>
}

// export type ModalDialogType = InstanceType<typeof ModalDialog>

export type ModalDialogType = InstanceType<
  typeof import('../components/common/ModalDialog.vue').default
>
export type DrawerDialogType = InstanceType<
  typeof import('../components/common/DrawerDialogType.vue').default
>

// export type DrawerDialogType = InstanceType<
export type DataFormType = InstanceType<typeof import('../components/DataForm.vue').default>

export type TableHeaderType = InstanceType<
  typeof import('../components/common/TableHeader.vue').default
>

export type TableFooterType = InstanceType<
  typeof import('../components/common/TableFooter.vue').default
>

export type SvgIconType = InstanceType<typeof import('../components/svg-icon/index.vue').default>

export type SearchContentType = InstanceType<
  typeof import('../components/common/SearchContent.vue').default
>
