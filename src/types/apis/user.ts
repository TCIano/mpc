export interface Users {
  name?: string
  pwd?: String
  desc?: String
  isSystemReserved?: Boolean
  id: string
}
type CfgType = 'string' | 'image' | '' | undefined

export interface CfgFormData {
  id?: string
  name: string
  value: string
  type: CfgType | any
  desc: string
}
