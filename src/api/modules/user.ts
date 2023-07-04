import { Users } from '@/types/apis/user'
import { post, get } from '../http'
import { PLF } from './baseUrl'
//用户登录
export const loginApi = PLF + '/Platform/GetToken'
const BASE = PLF + '/Users'
//获取角色列表
const GET_USERS_API = BASE
//增加角色
const ADD_USER_API = BASE + '/Add'
//更新角色
const UPDATE_USER_API = BASE + '/Update'
//删除角色
const DELETE_USER_API = BASE + '/Delete'
//获取权限路由
const GET_PAGES_BY_USER = PLF + '/Platform/GetPagesByUser'
/**
 *  获取用户列表
 * @returns Users
 */
export const getUsersApi = () => {
  return get({
    url: GET_USERS_API,
  })
}
/**
 *  增加角色
 * @param data Users
 * @returns
 */
export const addUserApi = (data: Users) => {
  return post({
    url: ADD_USER_API,
    data,
  })
}
/**
 *  更新角色
 * @param data Users
 * @returns
 */
export const updateUsersApi = (data: Users) => {
  return post({
    url: UPDATE_USER_API,
    data,
  })
}

export const deleteUserApi = (id: string) => {
  return post({
    url: DELETE_USER_API,
    data: {
      id,
    },
  })
}
/**
 *
 * @param username 获取用户权限路由
 * @returns
 */
export const getPagesByUser = (username: string) => {
  return get({
    url: GET_PAGES_BY_USER,
    data: {
      username,
    },
  })
}
