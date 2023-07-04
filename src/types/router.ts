export interface OriginRoute {
  url: string
  name?: string
  isHidden?: boolean
  outLink?: string
  isFixed?: boolean
  isCache?: boolean
  iconPrefix?: string
  parentId?: string
  icon?: string
  badge?: string | number
  isSingle?: boolean
  sortNumber: number
  children?: Array<OriginRoute>
}
