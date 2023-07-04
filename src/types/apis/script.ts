export interface ScriptItem {
  name: string
  desc: string | null | null | undefined
  type: string
  fileURL: string
  fileTime: string
  properties: any[]
  nodeId: string | null | null | undefined
  pid: number
  state: number
  serviceURL: string | null | undefined
  fileName: string
}

export interface GetSptByP {
  name: string
  desc: null | undefined | string
  vars: any[]
  ioServerURL: string
  scriptContent: string | undefined
}
