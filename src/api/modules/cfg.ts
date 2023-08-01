import { PlfCfg } from '@/types/apis/cfg'
import { post, get } from '../http'
import { PLF } from './baseUrl'
import { SettingKeyType } from '@/types/setting'

const BASE = PLF + '/Configuration'
//获取系统配置
const GET_PLATFORM_CONFIGURATION = BASE + '/Get'
//获取平台配置项集合
const GET_PLATFORM_CONFIGURATION_LIST = BASE + '/GetList'
//增加系统配置
const ADD_PLATFORM_CONFIGURATION = BASE + '/Add'
//更新系统配置
const MODIFY_PLATFORM_CONFIGURATION = BASE + '/Update'
//s删除系统配置
const DELETE_PLATFORM_CONFIGURATION = BASE + '/Delete'
//附件上传
const UPLOAD_FILE = BASE + '/Upload'
//根据名称获取对应图片内容
const GET_IMAGE = BASE + '/Image'

export const getPlfCfgApi = (name: string = '') => {
  return get({
    url: GET_PLATFORM_CONFIGURATION,
    data: {
      name,
    },
  })
}
export const getPlfCfgListbyNameApi = (list: SettingKeyType[]) => {
  return post({
    url: GET_PLATFORM_CONFIGURATION_LIST,
    data: list,
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
  return post({
    url: DELETE_PLATFORM_CONFIGURATION,
    data: {
      id,
    },
  })
}

export const uploadPlfCfgApi = (data: FormData) => {
  return post({
    url: UPLOAD_FILE,
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getImageByName = (name: string) => {
  return import.meta.env.DEV
    ? import.meta.env.VITE_MPC_IMAGE_URL + `${GET_IMAGE}?name=${name}`
    : `${GET_IMAGE}?name=${name}`
}
