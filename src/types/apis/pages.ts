export interface PageData {
  id?: string
  name?: string
  url?: string
  sortNumber?: number
  icon?: string
  isFixed?: Boolean
  isHidden?: Boolean
  isCache?: Boolean
  parentId?: string
  children?: PageData
}
