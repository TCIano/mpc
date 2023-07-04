import { post, get } from '../http'
import { SCRIPT } from './baseUrl'

const BASE = SCRIPT + '/Scripts'
//获取所有脚本
const GET_SERIPTS_ALL = `${BASE}/GetPrjs`
//获取指定工程脚本
const GET_SECIPT_PRJ = `${BASE}/GetScriptPrj`
//新建脚本工程
const CREATE_SCRIPT = `${BASE}/Add`
//保存脚本工程
const SAVE_SCRIPT = `${BASE}/Save`
//删除脚本工程
const DEL_SCRIPT = `${BASE}/Delete`

export const getAllScriptApi = () => {
  return get({
    url: GET_SERIPTS_ALL,
  })
}

export const getScriptByPrjApi = (prjName: string) => {
  return get({
    url: GET_SECIPT_PRJ,
    data: {
      prjName,
    },
  })
}

export const createScriptApi = (prjName: string) => {
  return post({
    url: CREATE_SCRIPT + '?prjName=' + prjName,
  })
}

export const saveScriptApi = (prjName: string, scriptContent: string) => {
  return post({
    url: `${SAVE_SCRIPT}?prjName=${prjName}&scriptContent=${scriptContent}`,
  })
}

export const deleteScriptApi = (prjName: string) => {
  return post({
    url: `${DEL_SCRIPT}?prjName=${prjName}`,
  })
}
