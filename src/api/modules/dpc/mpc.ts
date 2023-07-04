import { post, get } from '@/api/http'
import { DPC } from '../baseUrl'
import {
  CreateMpcByManual,
  GetFIRModelInfo,
  ImportData,
  SetParamValue,
  SetRankParamValue,
  SetmodelInfoValue,
  GetBuildFirModelInfo,
  ModalInfo,
} from '@/types/apis/dpc/mpc'
import useMpcStore from '@/store/modules/mpc'
//在线实时数据
export const MPC_HUB = DPC + '/Watch/mpcHub'
const mpcStore = useMpcStore()
const BASE = DPC + '/MPCPro'
let varHttp = ''
let ONLINE = varHttp + DPC + '/Watch/Online'
let TREND = varHttp + DPC + '/Watch/Trend'
//获取控制器工程
const GET_PRJS = BASE + '/GetPrjs'
//根据文件路径获取指定控制器工程
const GET_MPC_PRJ = BASE + '/GetMPCPrj'
const GET_MPC_PRJ_ONLINE = ONLINE + '/GetPrj'
//手动新建控制器工程
const CREATE_BY_MANUAL_FIR_MODEL = BASE + '/CreateByManualFIRModel'
//导入模型文件新建控制器工程
const CREATE_BY_MODEL_FILE = BASE + '/CreateByModelFile'
//保存工程
const SAVE = BASE + '/Save'
//保存在线工程
const SAVE_ONLINE = ONLINE + '/Save'
//运行在线工程
const RUN_ONLINE = ONLINE + '/Run'
//停止在线工程
const STOP_ONLINE = ONLINE + '/Stop'
const DELETE = BASE + '/Delete'
//导入控制器工程文件
const IMPORT_CTR = BASE + '/ImportCTR'
//导出控制器工程文件
export const EXPORT_CTR = BASE + '/ExportCTR'
//导出控制工程模型文件
export const EXPORT_MODEL_FILE = BASE + '/ExportModelFile'
//获取组态检查结果
const GET_CHECK_RESULT = BASE + '/GetCheckResult'
//设置工程中位号所属的IOS数据源名称
const SET_IO_SERVER_DATA_SOURCE = BASE + '/SetIOServerDataSource'
//设置变量参数值
const SET_PARAM_VALUE = BASE + '/SetParamValue'
//设置在线变量参数
const SET_PARAM_VALUE_ONLINE = ONLINE + '/SetParamValue'
//设置等级参数
const SET_RANK_PARAM_VALUE = BASE + '/SetRankParamValue'
//设置在线等级参数
const SET_RANK_PARAM_VALUE_ONLINE = ONLINE + '/SetRankParamValue'
//设置模型参数值
const SET_MODEL_INFO_VALUE = BASE + '/SetModelInfoValue'
//设置在线模型参数
const SET_MODEL_INFO_VALUE_ONLINE = ONLINE + '/SetModelInfoValue'
//获取模型组态信息
const GET_FIR_MODEL_INFO = BASE + '/GetFIRModelInfo'
//获取模型在线组态信息
const GET_FIR_MODEL_INFO_ONLINE = ONLINE + '/GetFIRModelInfo'
//设置模型组态信息
const SET_FIR_MODEL_INFO = BASE + '/SetFIRModelInfo'
//设置模型在线组态信息
const SET_FIR_MODEL_INFO_ONLINE = ONLINE + '/SetFIRModelInfo'
//根据传递函数类型及其参数生成阶跃响应序列
const BUILD_FIR_MODEL_INFO = BASE + '/BuildFIRModelDatas'
//根据根据传递函数类型及其参数生成在线阶跃响应序列
const BUILD_FIR_MODEL_INFO_ONLINE = ONLINE + '/BuildFIRModelDatas'
//获取工程趋势单元集合
const GET_TREND_UNITS = TREND + '/GetTrendUnits'
export const getMpcPrjsApi = () => {
  return get({
    url: GET_PRJS,
  })
}

export const deleteMpcPrjApi = (prjName: string) => {
  return post({
    url: `${DELETE}?prjName=${prjName}`,
  })
}

export const saveMpcPrjApi = (prjName: string, type: string) => {
  return post({
    url: type ? varHttp + SAVE_ONLINE : SAVE,
    data: {
      prjName,
    },
  })
}

export const importCtrApi = (data: any) => {
  return post({
    url: IMPORT_CTR,
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const createByManualApi = (data: CreateMpcByManual) => {
  return post({
    url: CREATE_BY_MANUAL_FIR_MODEL,
    data,
  })
}
//导入模型文件创建
export const createByFileApi = (data: FormData) => {
  return post({
    url: CREATE_BY_MODEL_FILE,
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
/**
 *  获取指定名称的组态
 * @param prjName 文件名称
 * @returns
 */
export const getMpcPrjByPath = (prjName: string, type: string, newUrl: string) => {
  varHttp = newUrl
  return get({
    url: type ? varHttp + GET_MPC_PRJ_ONLINE : GET_MPC_PRJ,
    data: {
      prjName,
    },
  })
}

export const setParamValueApi = (data: SetParamValue, type: string) => {
  return post({
    url: type ? varHttp + SET_PARAM_VALUE_ONLINE : SET_PARAM_VALUE,
    data,
  })
}

export const setModelInfoValueApi = (data: SetmodelInfoValue, type: string) => {
  return post({
    url: type ? varHttp + SET_MODEL_INFO_VALUE_ONLINE : SET_MODEL_INFO_VALUE,
    data,
  })
}

export const setRankParamValueApi = (data: SetRankParamValue, type: string) => {
  return post({
    url: type ? varHttp + SET_RANK_PARAM_VALUE_ONLINE : SET_RANK_PARAM_VALUE,
    data,
  })
}

export const getFIRModelInfoApi = (data: GetFIRModelInfo, type: string) => {
  return get({
    url: type ? varHttp + GET_FIR_MODEL_INFO_ONLINE : GET_FIR_MODEL_INFO,
    data,
  })
}

export const getBuildFirModelInfoApi = (data: GetBuildFirModelInfo, type: string) => {
  return get({
    url: type ? varHttp + BUILD_FIR_MODEL_INFO_ONLINE : BUILD_FIR_MODEL_INFO,
    data,
  })
}

export const setFirModelInfoApi = (data: ModalInfo, type: string) => {
  return post({
    url: type ? varHttp + SET_FIR_MODEL_INFO_ONLINE : SET_FIR_MODEL_INFO,
    data,
  })
}
/**
 * 运行在线工程
 * @param prjName 在线工程名称
 * @returns
 */
export const runOnlinePrj = (prjName: string) => {
  return post({
    url: varHttp + RUN_ONLINE,
    data: {
      prjName,
    },
  })
}
/**
 * 停止在线工程
 * @param prjName 在线工程名称
 * @returns
 */
export const stopOnlinePrj = (prjName: string) => {
  return post({
    url: varHttp + STOP_ONLINE,
    data: {
      prjName,
    },
  })
}
export const getCheckResultApi = (prjName: string) => {
  return post({
    url: GET_CHECK_RESULT + '?prjName=' + prjName,
  })
}
/**
 *
 * @param prjName 工程名称
 * @param ioServerDataSourceName io名称
 * @returns
 */
export const setIOServerApi = (prjName: string, ioServerDataSourceName: string) => {
  return post({
    url: SET_IO_SERVER_DATA_SOURCE,
    data: {
      prjName,
      ioServerDataSourceName,
    },
  })
}

export const getTrendUnitsApi = (prjName: string, varHttp: string) => {
  return post({
    url: varHttp + GET_TREND_UNITS,
    data: {
      prjName,
    },
  })
}
