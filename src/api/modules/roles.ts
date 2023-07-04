import { get, post } from '../http'
import { PageByid, Roles, UserByRid } from '@/types/apis/roles'
import { PLF } from './baseUrl'
const BASE = PLF + '/Roles'
//获取角色列表
const GET_ROLES_API = BASE
//增加角色
const ADD_ROLE_API = BASE + '/Add'
//更新角色
const UPDATE_ROLE_API = BASE + '/Update'
//删除角色
const DELETE_ROLE_API = BASE + '/Delete'
const GET_USERS_BY_ROLE_ID = BASE + '/GetUsersByRoleId'
const UPDATE_USERS_BY_ROLE_ID = BASE + '/UpdateUsersByRoleId'
const GET_PAGES_BY_ROLE_ID = BASE + '/GetPagesByRoleId'
const UPDATE_PAGES_BY_ROLE_ID = BASE + '/UpdatePagesByRoleId'
export const getUsersByRoleIdApi = (roleId: string) => {
  return get({
    url: GET_USERS_BY_ROLE_ID,
    data: {
      roleId,
    },
  })
}
export const getPagesByRoleIdApi = (roleId: string) => {
  return get({
    url: GET_PAGES_BY_ROLE_ID,
    data: {
      roleId,
    },
  })
}
export const updateUsersByRidApi = (data: UserByRid) => {
  return post({
    url: UPDATE_USERS_BY_ROLE_ID,
    data,
  })
}
export const updatePagesByRidApi = (data: PageByid) => {
  return post({
    url: UPDATE_PAGES_BY_ROLE_ID,
    data,
  })
}
/**
 *  获取用户列表
 * @returns Roles
 */
export const getRolesApi = () => {
  return get({
    url: GET_ROLES_API,
  })
}
/**
 *  增加角色
 * @param data Roles
 * @returns
 */
export const addRoleApi = (data: Roles) => {
  return post({
    url: ADD_ROLE_API,
    data,
  })
}
/**
 *  更新角色
 * @param data Roles
 * @returns
 */
export const updateRolesApi = (data: Roles) => {
  return post({
    url: UPDATE_ROLE_API,
    data,
  })
}

export const deleteRoleApi = (id: string) => {
  return post({
    url: DELETE_ROLE_API,
    data: {
      id,
    },
  })
}
