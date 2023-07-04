import { post, get } from '@/api/http'
import { DPC } from '../baseUrl'
import { ParamRoles, VarType } from '@/types/apis/dpc/roles'
const BASE = DPC + '/ParamRoles'
//参数角色列表
const GET_ROLES = `${BASE}/GetRoles`
//获取指定角色可访问的参数集合
const GET_PARAMS = `${BASE}/GetParams`
//增加参数角色
const ADD = `${BASE}/Add`
//编辑参数
const UPDATE = `${BASE}/Update`
//删除角色
const DELETE = `${BASE}/Delete`
//获取指定变量类型的参数集合
const GET_PARAMS_BY_VAR_TYPE = `${BASE}/GetParamsByVarType`
/**
 *  获取指定变量类型的参数集合
 * @param varType 参数类型
 * @returns
 */
export const getParamsByVarTypeApi = (varType: string) => {
  return get({
    url: GET_PARAMS_BY_VAR_TYPE,
    data: {
      varType,
    },
  })
}

export const getProlesApi = () => {
  return get({
    url: GET_ROLES,
  })
}

export const getParamsByIdApi = (roleId: string) => {
  return get({
    url: GET_PARAMS,
    data: {
      roleId,
    },
  })
}

export const addParamsRole = (data: ParamRoles) => {
  return post({
    url: ADD,
    data,
  })
}

export const updateParamsRole = (data: ParamRoles) => {
  return post({
    url: UPDATE,
    data,
  })
}

export const deleteParamsRole = (id: string) => {
  return post({
    url: DELETE,
    data: {
      id,
    },
  })
}
