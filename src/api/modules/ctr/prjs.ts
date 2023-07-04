import { post, get } from '@/api/http'
import { PMS } from '../baseUrl'
import { HandlePrj } from '@/types/apis/ctr/prjs'
export const CPM_HUB = PMS + '/cpmHub'
const BASE = PMS + '/Prjs'
//获取工程状态
const GET_PRJS_STATE = BASE + '/GetPrjsState'
//根据类型获取工程
const GET_PRJS = BASE + '/GetPrjs'
//加载工程
const LOAD = BASE + '/Load'
//重新加载
const RELOAD = BASE + '/Reload'
//卸载
const UNLOAD = BASE + '/Unload'
//run
const RUN = BASE + '/Run'
//停止
const STOP = BASE + '/Stop'

export const getPrjsStateApi = () => {
  return get({
    url: GET_PRJS_STATE,
  })
}
/**
 *
 * @param prjType 工程类型
 * @returns
 */
export const getPrjsApi = (prjType: string = '') => {
  return get({
    url: GET_PRJS,
    data: {
      prjType,
    },
  })
}
export const loadPrjApi = (data: HandlePrj) => {
  return post({
    url: LOAD,
    data,
  })
}
export const unloadPrjApi = (data: HandlePrj) => {
  return post({
    url: UNLOAD,
    data,
  })
}
export const reloadPrjApi = (data: HandlePrj) => {
  return post({
    url: RELOAD,
    data,
  })
}
export const runPrjApi = (data: HandlePrj) => {
  return post({
    url: RUN,
    data,
  })
}
export const stopPrjApi = (data: HandlePrj) => {
  return post({
    url: STOP,
    data,
  })
}
