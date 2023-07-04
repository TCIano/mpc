import { PageData } from '@/types/apis/pages'
import { post, get } from '../http'
import { PLF } from './baseUrl'

const BASE = PLF + '/pages'
//获取菜单
const GET_PAGES = BASE
//增加菜单
const ADD_PAGE_URL = BASE + '/Add'
//删除菜单
const DELETE_PAGE_URL = BASE + '/Delete'
//更新菜单
const UPDATE_PAGE_URL = BASE + '/Update'
/**
 * 获取菜单
 * @returns PROMISE
 */
export const getPageDataApi = () => {
  return get({
    url: GET_PAGES,
  })
}
/**
 *  增加菜单
 * @param data PageData
 * @returns PROMISE
 */
export const addPageApi = (data: PageData) => {
  return post({
    url: ADD_PAGE_URL,
    data,
  })
}
/**
 * 删除菜单
 * @param data PageData
 * @returns PEOMISE
 */
export const deletePageApi = (id: string) => {
  return post({
    url: DELETE_PAGE_URL,
    data: {
      id,
    },
  })
}
/**
 *  更新菜单
 * @param data PageData
 * @returns PEOMISE
 */
export const updatePageApi = (data: PageData) => {
  return post({
    url: UPDATE_PAGE_URL,
    data,
  })
}
