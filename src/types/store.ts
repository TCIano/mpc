import { Ref, UnwrapRef } from 'vue'
import { RouteRecordRaw, RouteMeta } from 'vue-router'
import CacheView from './cached-view'
import VisitedView from './visited-view'
import { StorageDic } from '../enum'

export interface RouteMetaType extends RouteMeta {
  icon?: string
  title?: string
  cacheable?: boolean
  affix?: boolean
}

export type RouteRecordRawWithHidden = RouteRecordRaw & {
  fullPath?: string
  icon?: string
  hidden?: boolean
  params?: Record<string, any>
  query?: Record<string, any>
}

export interface SplitTab {
  label: string
  iconPrefix?: string | unknown
  icon: string
  fullPath: string
  children?: Array<RouteRecordRawWithHidden>
  checked: Ref<UnwrapRef<boolean>>
}

export enum LayoutMode {
  LTR = 'ltr',
  LCR = 'lcr',
  TTB = 'ttb',
}

export enum DeviceType {
  PC = 'pc',
  PAD = 'pad',
  MOBILE = 'mobile',
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum SideTheme {
  DARK = 'dark',
  WHITE = 'white',
  BLUE = 'blue',
  IMAGE = 'image',
}

export interface StateType {
  isCollapse: boolean
  isFixedNavBar: boolean
  layoutMode: string
  device: DeviceType
  theme: string
  sideBarBgColor: string
  pageAnim: string
  waterMark: string
  projectName: string
  projectLogo: string
  isOpenWaterMark: Boolean
  permissionRoutes: Array<RouteRecordRawWithHidden>
  visitedView: Array<RouteRecordRawWithHidden>
  cachedView: Array<string>
  isShowTabbar: boolean
  actionItem: {
    showSearch: boolean
    showMessage: boolean
    showFullScreen: boolean
    showRefresh: boolean
  }
}

export interface StoreType extends CacheView, VisitedView {
  state: UnwrapRef<StateType>
  start: (params: any) => void
  randomLayouMode: () => void
  toggleCollapse: (newStatus: boolean) => void
  toggleFixedNavBar: (newStatus: boolean) => void
  changeLayoutMode: (mode: LayoutMode) => void
  changeDevice: (device: DeviceType) => void
  changeTheme: (theme: ThemeMode) => void
  changeSideBarBgColor: (colorName: SideTheme) => void
  changePageAnim: (pageAnim: string) => void
  changePrjName: (prjName: string) => void
  changeProjectLogo: (prjLogo: string) => void
  changePrimaryColor: (color: string) => void
  isShowHeader: () => boolean
  getSplitTabs: () => Array<RouteRecordRawWithHidden>
  initPermissionRoute: (routes: Array<RouteRecordRaw>) => void
  isEmptyPermissionRoute: () => boolean
  reset: () => void
}
/**
 * 本地存储
 */
export type Key = string
export type Expire = StorageDic.permanent | number
export interface StorageData<T> {
  value: T
  [StorageDic.expire]: StorageDic.expire | number
}
export interface StorageResult<T> {
  value: T | null
  message: string
}
export interface StorageCls {
  set: <T>(key: Key, value: T, expire: Expire) => void
  get: <T>(key: Key) => StorageResult<T | null>
  remove: (key: Key) => void
  clear: () => void
}
