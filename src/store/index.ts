import { SideTheme, RouteRecordRawWithHidden, StoreType } from './../types/store'
import { reactive } from 'vue'
import { DeviceType, LayoutMode, StateType, ThemeMode } from '../types/store'
import { transfromRoutes } from '../utils'
import CachedViewAction from './modules/cached-view'
import VisitedViewAction from './modules/visited-view'
import { RouteRecordRaw } from 'vue-router'
import Setting from '../setting'
import { useChangeMenuWidth } from '../hooks/useMenuWidth'
import useGray from '../hooks/useGray'
import useTheme from '../hooks/useTheme'
import { SETTING_INFO_KEY } from '@/layouts/setting/keys'
import { supportedCfgs, cfgLogoKey } from '@/enum/setting'
import { getImageByName, getPlfCfgListbyNameApi } from '@/api/modules'
import { obj2KeyValueByQuery } from '@/utils/utils'
import { CfgFormData } from '@/types/apis/user'

export function presistSettingInfo(setting: any) {
  localStorage.setItem(SETTING_INFO_KEY, JSON.stringify(setting))
}
!localStorage.getItem(SETTING_INFO_KEY) && presistSettingInfo(Setting)

const originState = {
  isShowTabbar: Setting.isShowTabbar,
  isCollapse: false,
  isFixedNavBar: Setting.isFixedNavBar,
  layoutMode: Setting.layoutMode,
  device: DeviceType.PC,
  theme: Setting.theme,
  home: Setting.home,
  sideBarBgColor: Setting.sideTheme,
  pageAnim: Setting.pageAnim,
  waterMark: Setting.waterMark,
  projectName: Setting.projectName,
  projectLogo: Setting.projectLogo,
  isOpenWaterMark: Setting.isOpenWaterMark,
  permissionRoutes: [],
  visitedView: [],
  cachedView: [],
  actionItem: {
    showSearch: Setting.actionBar.isShowSearch,
    showMessage: Setting.actionBar.isShowMessage,
    showFullScreen: Setting.actionBar.isShowFullScreen,
    showRefresh: Setting.actionBar.isShowRefresh,
  },
}

const store = {
  state: reactive<StateType>(originState),
  async start({ state, actions }: any): Promise<void> {
    //可以在这获取用户可配置项api
    const cfgObj = await getPlfCfgListbyNameApi(supportedCfgs)
    const supportedCfgObj = obj2KeyValueByQuery<CfgFormData>(cfgObj)
    const finalState = { ...state, ...supportedCfgObj } //最终配置（包括默认配置和后台配置）
    state && (this.state = Object.assign(this.state, finalState))
    if (actions) {
      for (const key in actions) {
        ;(this as any)[key] = actions[key]
      }
    }
    if (this.state.device === DeviceType.MOBILE) {
      this.toggleCollapse(true)
      this.changeLayoutMode(LayoutMode.LTR)
    }
    if (this.state.theme === 'light') {
      import('../styles/theme/antd.min.css').then(() => {
        useTheme(document.documentElement, 'light')
      })
    } else {
      import('../styles/theme/antd.dark.min.css').then(() => {
        useTheme(document.documentElement, 'dark')
      })
    }
    useChangeMenuWidth(Setting.sideWidth)
    this.restoreVisitedView()
  },
  toggleCollapse(newStatus: boolean) {
    this.state.isCollapse = newStatus
  },
  changeProjectName(newStatus: string) {
    this.state.projectName = newStatus
    presistSettingInfo(
      Object.assign(Setting, {
        projectName: newStatus,
      })
    )
  },
  //修改首页
  changeHome(newHome: string) {
    this.state.home = newHome
    presistSettingInfo(
      Object.assign(Setting, {
        home: newHome,
      })
    )
  },
  toggleFixedNavBar(newStatus: boolean) {
    this.state.isFixedNavBar = newStatus
  },
  changeLayoutMode(mode: LayoutMode) {
    this.state.layoutMode = mode
    presistSettingInfo(
      Object.assign(Setting, {
        layoutMode: mode,
      })
    )
  },
  changeDevice(device: DeviceType) {
    this.state.device = device
  },
  changeTheme(theme: ThemeMode) {
    this.state.theme = theme
    presistSettingInfo(
      Object.assign(Setting, {
        theme,
      })
    )
  },
  changeSideBarBgColor(colorName: SideTheme) {
    this.state.sideBarBgColor = colorName
    presistSettingInfo(
      Object.assign(Setting, {
        sideTheme: colorName,
      })
    )
  },
  //获取页面log
  // getProjectLogo() {
  //   return getImageByName(cfgLogoKey)
  // },
  //修稿页面logo

  changePageAnim(pageAnim: string) {
    this.state.pageAnim = pageAnim
    presistSettingInfo(
      Object.assign(Setting, {
        pageAnim,
      })
    )
  },
  isShowHeader() {
    return this.state.device === 'pc' && this.state.layoutMode === 'ttb'
  },
  getSplitTabs() {
    return this.state.permissionRoutes.filter((it) => {
      return it.path && !it.hidden && it.children && it.children.length > 0
    }) as Array<RouteRecordRawWithHidden>
  },
  initPermissionRoute(routes: Array<RouteRecordRaw>) {
    const tempRoutes = transfromRoutes(routes) || []
    this.state.permissionRoutes.length = 0
    this.state.permissionRoutes.push(...tempRoutes)
  },
  isEmptyPermissionRoute() {
    return !this.state.permissionRoutes || this.state.permissionRoutes.length === 0
  },
  reset() {
    this.state = reactive<StateType>({
      isCollapse: false,
      isFixedNavBar: Setting.isFixedNavBar,
      layoutMode: Setting.layoutMode,
      device: DeviceType.PC,
      theme: Setting.theme,
      home: Setting.home,
      sideBarBgColor: Setting.sideTheme,
      pageAnim: Setting.pageAnim,
      waterMark: Setting.waterMark,
      projectName: Setting.projectName,
      projectLogo: Setting.projectLogo,
      isOpenWaterMark: Setting.isOpenWaterMark,
      permissionRoutes: [],
      visitedView: [],
      cachedView: [],
      isShowTabbar: Setting.isShowTabbar,
      actionItem: {
        showSearch: Setting.actionBar.isShowSearch,
        showMessage: Setting.actionBar.isShowMessage,
        showFullScreen: Setting.actionBar.isShowFullScreen,
        showRefresh: Setting.actionBar.isShowRefresh,
      },
    })
  },
  ...CachedViewAction,
  ...VisitedViewAction,
} as StoreType

export default store
