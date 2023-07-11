import { defineStore } from 'pinia'
import { UserState } from '../types'
import layoutStore from '../index'
import { presistSettingInfo } from '@/store'
import { StateType } from '@/types/store'
import Setting from '@/setting'
import { CfgFormData } from '@/types/apis/user'
import { getPlfCfgApi } from '@/api/modules'
import Avatar from '@/assets/img_avatar.gif'
import Cookies from 'js-cookie'
import { USER_INFO_KEY, USER_TOKEN_KEY } from '@/layouts/setting/keys'

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
      systemCfg: '',
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
    async reloadCfg() {
      const res: CfgFormData[] = await getPlfCfgApi()
      this.systemCfg = res.reduce((obj: any, curr) => {
        obj[curr.name] = curr.value
        return obj
      }, {})
      return {
        apiCfg: res,
        systemCfg: this.systemCfg,
      }
    },
    presistSystemCfg(res: StateType) {
      return new Promise<void>((resolve, reject) => {
        presistSettingInfo(Object.assign(Setting, res))
      })
    },
  },
})

export default useUserStore
