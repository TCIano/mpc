import { PlfCfg } from '@/types/apis/cfg'
import { post, get } from '../http'
import { PLF } from './baseUrl'

const BASE = PLF + '/Platform'
//获取系统配置
const GET_PLATFORM_CONFIGURATION = BASE + '/GetPlatformConfiguration'
//增加系统配置
const ADD_PLATFORM_CONFIGURATION = BASE + '/AddPlatformConfiguration'
//更新系统配置
const MODIFY_PLATFORM_CONFIGURATION = BASE + '/UpdatePlatformConfiguration'
//s删除系统配置
const DELETE_PLATFORM_CONFIGURATION = BASE + '/DeltePlatformConfiguration'

export const getPlfCfgApi = () => {
  return post({
    url: GET_PLATFORM_CONFIGURATION,
  })
}

export const addPlfCfgApi = (data: PlfCfg) => {
  return post({
    url: ADD_PLATFORM_CONFIGURATION,
    data,
  })
}

export const updatePlfCfgApi = (data: PlfCfg) => {
  return post({
    url: MODIFY_PLATFORM_CONFIGURATION,
    data,
  })
}

export const deletePlfCfgApi = (id: string | undefined) => {
  post({
    url: DELETE_PLATFORM_CONFIGURATION,
    data: {
      id,
    },
  })
}
