import { SETTING_INFO_KEY } from '@/layouts/setting/keys'
import { cfgLogoKey } from '@/enum/setting'
const settingInfo = JSON.parse(localStorage.getItem(SETTING_INFO_KEY) || '{}') as Setting
export const projectName = settingInfo.projectName || ''
export interface Setting {
  home: string
  projectName: string
  theme: 'light' | 'dark'
  sideTheme: 'dark' | 'white' | 'image'
  themeColor: string
  layoutMode: 'ltr' | 'ttb' | 'lcr'
  sideWidth: number
  isShowTabbar: boolean
  pageAnim: 'fade' | 'opacity' | 'down' | 'scale'
  isFixedNavBar: boolean
  isOpenWaterMark: boolean
  waterMark: string
  projectLogo: string
  actionBar: {
    isShowSearch: boolean
    isShowMessage: boolean
    isShowRefresh: boolean
    isShowFullScreen: boolean
  }
}

export default Object.assign(
  {
    theme: 'light',
    home: '',
    sideTheme: 'dark',
    themeColor: 'cyan@#18a058',
    layoutMode: 'ltr',
    sideWidth: 210,
    pageAnim: 'fade',
    isShowTabbar: true,
    isFixedNavBar: true,
    isOpenWaterMark: false,
    waterMark: projectName,
    projectName: '',
    isGray: false,
    [cfgLogoKey]: 'logo',
    actionBar: {
      isShowSearch: false,
      isShowMessage: false,
      isShowRefresh: true,
      isShowFullScreen: true,
    },
  },
  settingInfo
) as Setting
