import { SETTING_INFO_KEY } from '@/layouts/setting/keys'

export const projectName = '中智达'
const settingInfo = JSON.parse(localStorage.getItem(SETTING_INFO_KEY) || '{}')
interface Setting {
  projectName: string
  theme: 'light' | 'dark'
  sideTheme: 'dark' | 'white' | 'image'
  themeColor: string
  layoutMode: 'ltr' | 'ttb' | 'lcr'
  sideWidth: number
  isShowTabbar: boolean
  pageAnim: 'fade' | 'opacity' | 'down' | 'scale'
  isFixedNavBar: boolean
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
    sideTheme: 'dark',
    themeColor: 'cyan@#18a058',
    layoutMode: 'ltr',
    sideWidth: 210,
    pageAnim: 'opacity',
    isShowTabbar: true,
    isFixedNavBar: true,
    isOpenWaterMark: false,
    waterMark: projectName,
    isGray: false,
    actionBar: {
      isShowSearch: false,
      isShowMessage: false,
      isShowRefresh: true,
      isShowFullScreen: true,
    },
  },
  settingInfo
) as Setting
