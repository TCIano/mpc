export interface MpcPrjsRes {
  name: string
  desc: string
  type: string
  fileTime: string
  fileURL: string
  properties: string[]
  nodeId: null
  pid: number
  state: number
  serviceURL: string
}

export interface ImportData {
  mode: number
  file: any
}
interface Cvs {
  name: string
  integralFlag: boolean
}
export interface CreateMpcByManual {
  name: string
  moduleType: string
  period: 0
  modelLen: 0
  mVs: string[]
  dVs: string[]
  cVs: Cvs[]
}

export type TotalvarType = {
  index: number
  name: string
  type: 'cps' | 'mv' | 'cv' | 'dv'
  params: Params[] | undefined
}
export type Params = {
  id: number
  classType: string
  name: string
  desc: string
  isEnumValueType: boolean
  value: string | number
  valueRange: number[] | string[]
  tagName: string
  policy: '本地写' | '本地读' | '本地读写'
  policyRange: string[]
  isReadOnly: boolean
}
type Model = {
  inputName: string
  outputName: string
  integralFlag: boolean
  delay: number
  policy: '本地写' | '本地读' | '本地读写'
  policyRange: string[]
  tagName: string
  rawK: number
  curK: number
  hiLimit: number
  lowLimit: number
  datas: any[]
}
export interface PrjTotalData {
  name: string
  ioSeverDataSource: string
  cPs: TotalvarType
  mVs: TotalvarType[]
  dVs: TotalvarType[]
  cVs: TotalvarType[]
  ranks: []
  models: Model[]
}

export interface SetParamValue {
  prjName: string
  varType: string
  varName: string
  paramID: string | number
  paramName: string
  policy: string
  value?: string
  tagInfo?: string
}
export interface SetmodelInfoValue {
  prjName: string
  inputName: string
  outputName: string
  policy?: string
  tagName?: string
  curK?: number
  hiLimit?: number
  lowLimit?: number
  paramType?: string
  value?: number
}

export interface SetRankParamValue {
  prjName: string
  level?: number
  policy: string
}
export interface GetFIRModelInfo {
  prjName: string
  mv: string
  cv: string
}

export interface GetBuildFirModelInfo {
  integralFlag: boolean
  d: number
  k: number
  T1: number
  T2: number
  funcType: number
  modelLen: number
}
export interface ModalInfo {
  prjName: string
  inputName: string
  outputName: string
  delay: number
  k: number
  integralFlag: any
  funcType: FunT
  t1: number
  t2: number
  modelLen: number
  datas: number[]
}
export type lineName =
  | '未来下限'
  | '未来上限'
  | '未来动作值'
  | '历史下限'
  | '历史上限'
  | '历史测量值'
type FunT = 0 | 1 | 2 | 3
type trendDatasType = 'future' | 'history'
export interface trendDatas {
  Name: string
  Lines: [
    {
      Name: string
      Type: trendDatasType
      Datas: number[]
    }
  ]
  Limit: {
    Eanble: boolean
    HiLimit: number
    LoLimit: number
  }
}
export interface signalRTrendDatas {
  result: boolean
  data: {
    baseTime: string
    period: number
    trendDatas: trendDatas[]
  }
}
interface signalROnlineDatasChangedParams {
  ParamID: number
  Value: string
}
export interface signalROnlineDatasChangedVars {
  Name: string
  Params: signalROnlineDatasChangedParams[]
}
export interface signalROnlineDatasChangedModels {
  InputName: string
  OutputName: string
  Gain: number
  HiLimit: number
  LoLimit: number
}
export interface signalROnlineVarT {
  CPs: signalROnlineDatasChangedVars
  MVs: signalROnlineDatasChangedVars[]
  DVs: signalROnlineDatasChangedVars[]
  CVs: signalROnlineDatasChangedVars[]
}
export interface signalROnlineDatasChanged {
  result: boolean
  data: {
    prjName: string
    prjState: number
    datas: {
      ModuleInfo: {
        Name: string
        State: number
        LastRunTime: string
        CostTime: number
      }
      Vars: signalROnlineVarT
      Models: signalROnlineDatasChangedModels[]
    }
  }
}
/**
 * 变量颜色
 */
export const varColor: { [key: string]: string } = {
  ON: '#40c057',
  MV: '#40c057',
  OFF: '#fa5252',
  other: '#228be6',
}
