export interface HandlePrj {
  name: string
  type: PrjsType
  fileURL?: string
}
type PrjState = 0 | 1 | 2 | 3 | 4
export interface PrjsRes {
  name: string
  desc: string
  type: PrjsType
  fileURL: string
  properties: any[]
  nodeId: string
  pid: number
  state: PrjState
  serviceURL: string
}
export type PrjsType = 'node' | 'mpc' | 'script'
export const prjsTypeColor: { [key in PrjsType]: string } = {
  node: 'green',
  mpc: 'warning',
  script: 'blue',
}
