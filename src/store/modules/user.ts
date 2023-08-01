import { defineStore } from 'pinia'
import { UserState } from '../types'
import layoutStore from '../index'
import { presistSettingInfo } from '@/store'
import { StateType } from '@/types/store'
import Setting from '@/setting'
import { CfgFormData } from '@/types/apis/user'
import { getPlfCfgApi } from '@/api/modules'
import Avatar from '@/assets/img_avatar.jpg'
import Cookies from 'js-cookie'
import { USER_INFO_KEY, USER_TOKEN_KEY } from '@/layouts/setting/keys'
import { obj2KeyValueByQuery } from '@/utils/utils'

const defaultAvatar = Avatar

const userInfo: UserState = JSON.parse(localStorage.getItem(USER_INFO_KEY) || '{}')

const useUserStore = defineStore('user', {
  state: () => {
    return {
      access_token: userInfo.access_token || '',
      userName: userInfo.username || '',
      menus: userInfo.menus || [],
      redirectURL: userInfo.redirectURL || '',
      avatar: userInfo.avatar || defaultAvatar,
    }
  },
  actions: {
    saveUser(userInfo: UserState) {
      return new Promise<void>((res) => {
        this.access_token = userInfo.access_token
        this.userName = userInfo.username
        this.menus = userInfo.menus
        Cookies.set(USER_TOKEN_KEY, userInfo.access_token)
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
        res()
      })
    },
    logout() {
      return new Promise<void>((resolve) => {
        this.userName = ''
        this.access_token = ''
        Cookies.remove(USER_TOKEN_KEY)
        localStorage.clear()
        sessionStorage.clear()
        layoutStore.reset()
        resolve()
      })
    },
    reloadCfg(cfgList?: CfgFormData[]) {
      return new Promise<{ apiCfg: CfgFormData[]; systemCfg: any }>(async (resolve, reject) => {
        const res = cfgList ? cfgList : await getPlfCfgApi()
        //可传递泛型
        const systemCfg = obj2KeyValueByQuery<CfgFormData>(res)
        resolve({ apiCfg: res, systemCfg })
      })
    },
    presistSystemCfg(res: StateType) {
      return new Promise<void>((resolve, reject) => {
        presistSettingInfo(Object.assign(Setting, res))
        resolve()
      })
    },
  },
})

export default useUserStore
