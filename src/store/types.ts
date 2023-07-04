import { OriginRoute } from '@/types/router'
export interface UserState {
  result: boolean
  errMsg: string
  userId?: number
  access_token: string
  roleId: number
  roles: string[] | null
  username: string
  redirectURL: string
  // nickName: string
  avatar?: string
  menus: Array<OriginRoute>
}
export interface MpcState {
  onlineUrl: string
}
